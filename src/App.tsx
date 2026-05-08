import { useEffect, useMemo, useState } from "react";
import type {
  ActiveSession, Entry, Project, Route, Tweaks, Typography,
} from "@/types";
import {
  subscribeToProjects,
  saveProjectToDb,
  deleteProjectFromDb,
  subscribeToEntries,
  saveEntryToDb,
  deleteEntryFromDb,
} from "@/lib/db";
import {
  addDays, downloadCSV, decimalHours, entryDuration,
  startOfDay, startOfWeekMon, toCSV,
} from "@/lib/utils";
import { useTicker } from "@/hooks/useTicker";
import { Sidebar } from "@/components/Sidebar";
import { EntryModal, type EntryDraft } from "@/components/EntryModal";
import { ProjectModal, type ProjectDraft } from "@/components/ProjectModal";
import { KronosTweaksPanel } from "@/components/KronosTweaksPanel";
import { DashboardView, type Totals } from "@/views/DashboardView";
import { CalendarView } from "@/views/CalendarView";

const TWEAK_DEFAULTS: Tweaks = /*EDITMODE-BEGIN*/{
  theme: "light",
  density: "comfortable",
  typography: "serif-mono",
  timerStyle: "digits",
}/*EDITMODE-END*/;

function applyTypography(mode: Typography): void {
  const root = document.documentElement;
  if (mode === "mono") {
    root.style.setProperty("--font-display", "var(--font-mono)");
    root.style.setProperty("--font-body", "var(--font-mono)");
  } else if (mode === "sans") {
    root.style.setProperty("--font-display", "var(--font-sans)");
    root.style.setProperty("--font-body", "var(--font-sans)");
  } else {
    root.style.setProperty("--font-display", "var(--font-serif)");
    root.style.setProperty("--font-body", "var(--font-sans)");
  }
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [route, setRoute] = useState<Route>("dashboard");
  const [tweaks, setTweaksState] = useState<Tweaks>(TWEAK_DEFAULTS);
  const [editingEntry, setEditingEntry] = useState<EntryDraft | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectDraft | null>(null);
  const [calWeekOffset, setCalWeekOffset] = useState(0);

  const [active, setActive] = useState<ActiveSession | null>(null);
  useTicker(!!active, 1000);

  const setTweak = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    setTweaksState(prev => ({ ...prev, [k]: v }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*");
  };

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
    applyTypography(tweaks.typography);
  }, [tweaks]);

  useEffect(() => {
    const unsubProjects = subscribeToProjects((data) => setProjects(data));
    const unsubEntries = subscribeToEntries((data) => setEntries(data));
    return () => {
      unsubProjects();
      unsubEntries();
    };
  }, []);

  const runningMs = active ? Date.now() - active.start : 0;
  const activeProject = active ? projects.find(p => p.id === active.projectId) ?? null : null;

  const today = new Date();
  const todayStart = startOfDay(today).getTime();
  const weekStart = startOfWeekMon(today).getTime();

  const totals: Totals = useMemo(() => {
    const out: Totals = {};
    projects.forEach(p => {
      const projEntries = entries.filter(e => e.projectId === p.id);
      let todayMs = 0, weekMs = 0, totalMs = 0, longest = 0;
      projEntries.forEach(e => {
        const dur = entryDuration(e);
        const startTs = new Date(e.start).getTime();
        if (startTs >= todayStart) todayMs += dur;
        if (startTs >= weekStart) weekMs += dur;
        totalMs += dur;
        if (dur > longest) longest = dur;
      });
      out[p.id] = { todayMs, weekMs, totalMs, longest, ms: weekMs };
    });
    return out;
  }, [entries, projects, todayStart, weekStart]);

  const weekTotalMs =
    Object.values(totals).reduce((s, t) => s + t.weekMs, 0)
    + (active ? runningMs : 0);

  const weekRevenue = projects.reduce((s, p) => {
    const t = totals[p.id]!;
    const ms = t.weekMs + (active && active.projectId === p.id ? runningMs : 0);
    return s + decimalHours(ms) * p.rate;
  }, 0);

  // === actions ===
  const startTimer = (projectId: string) => {
    if (active && active.projectId === projectId) {
      stopTimer();
      return;
    }
    if (active) {
      const e: Entry = {
        id: "e" + Math.random().toString(36).slice(2, 8),
        projectId: active.projectId,
        start: new Date(active.start).toISOString(),
        end: new Date().toISOString(),
        note: "",
      };
      saveEntryToDb(e);
    }
    setActive({ projectId, start: Date.now() });
  };

  const stopTimer = () => {
    if (!active) return;
    const e: Entry = {
      id: "e" + Math.random().toString(36).slice(2, 8),
      projectId: active.projectId,
      start: new Date(active.start).toISOString(),
      end: new Date().toISOString(),
      note: "",
    };
    saveEntryToDb(e);
    setActive(null);
  };

  const pauseTimer = () => stopTimer();

  const saveEntry = (e: Entry) => {
    saveEntryToDb(e);
  };

  const deleteEntry = (id: string) => {
    deleteEntryFromDb(id);
  };

  const saveProject = (p: Project) => {
    saveProjectToDb(p);
  };

  const deleteProject = (id: string) => {
    if (active && active.projectId === id) setActive(null);
    deleteProjectFromDb(id);
    // Clean up orphaned entries
    entries.forEach(e => {
      if (e.projectId === id) {
        deleteEntryFromDb(e.id);
      }
    });
  };

  const exportCSV = () => {
    const csv = toCSV(entries, projects);
    downloadCSV("kronos-export-" + new Date().toISOString().slice(0, 10) + ".csv", csv);
  };

  const runningEntry: Entry | null = active ? {
    id: "running",
    projectId: active.projectId,
    start: new Date(active.start).toISOString(),
    end: null,
    note: "in session",
  } : null;

  const calWeekStart = addDays(startOfWeekMon(), calWeekOffset * 7);
  const calWeekEnd = addDays(calWeekStart, 6);

  const calendarEntries = useMemo(() => {
    const startTs = calWeekStart.getTime();
    const endTs = addDays(calWeekStart, 7).getTime();
    return entries.filter(e => {
      const t = new Date(e.start).getTime();
      return t >= startTs && t < endTs;
    });
  }, [entries, calWeekStart]);

  return (
    <div className="app">
      <Sidebar
        route={route}
        setRoute={setRoute}
        active={active}
        activeProject={activeProject}
        runningMs={runningMs}
        today={today}
        onNewEntry={() => setEditingEntry({})}
        onNewProject={() => setEditingProject({})}
        onExportCSV={exportCSV}
      />

      <main className="main">
        {route === "dashboard" && (
          <DashboardView
            projects={projects}
            totals={totals}
            active={active}
            runningMs={runningMs}
            activeProject={activeProject}
            startTimer={startTimer}
            stopTimer={stopTimer}
            pauseTimer={pauseTimer}
            onEditProject={(p) => setEditingProject(p)}
            onAddProject={() => setEditingProject({})}
            weekTotalMs={weekTotalMs}
            weekRevenue={weekRevenue}
            timerStyle={tweaks.timerStyle}
          />
        )}
        {route === "calendar" && (
          <CalendarView
            projects={projects}
            entries={calendarEntries}
            runningEntry={runningEntry}
            weekStart={calWeekStart}
            weekEnd={calWeekEnd}
            onEditEntry={setEditingEntry}
            onAddAt={(d, hourFloat) => {
              const start = new Date(d);
              start.setHours(Math.floor(hourFloat), Math.round((hourFloat % 1) * 60), 0, 0);
              const end = new Date(start.getTime() + 60 * 60 * 1000);
              setEditingEntry({ start: start.toISOString(), end: end.toISOString() });
            }}
            offset={calWeekOffset}
            setOffset={setCalWeekOffset}
            onAdd={() => setEditingEntry({})}
          />
        )}
      </main>

      {editingEntry && (
        <EntryModal
          entry={editingEntry}
          projects={projects}
          onSave={saveEntry}
          onDelete={deleteEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {editingProject && (
        <ProjectModal
          project={editingProject}
          existingCount={projects.length}
          onSave={saveProject}
          onDelete={deleteProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      <KronosTweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}
