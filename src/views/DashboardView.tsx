import type { ActiveSession, Project, TimerStyle } from "@/types";
import { addDays, formatHM, formatRange, startOfDay, startOfWeekMon } from "@/lib/utils";
import { HeadlineTimer } from "@/components/HeadlineTimer";
import { ProjectRow } from "@/components/ProjectRow";
import {
  WeekSummaryStrip,
  type ProjectHours,
} from "@/components/WeekSummaryStrip";
import { WeekProjectBars } from "@/components/WeekProjectBars";

export type Totals = Record<
  string,
  { todayMs: number; weekMs: number; totalMs: number; longest: number; ms: number }
>;

type DashboardViewProps = {
  projects: Project[];
  totals: Totals;
  active: ActiveSession | null;
  runningMs: number;
  activeProject: Project | null;
  startTimer: (projectId: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  weekTotalMs: number;
  weekRevenue: number;
  timerStyle: TimerStyle;
  onEditProject: (p: Project) => void;
  onAddProject: () => void;
};

export function DashboardView({
  projects, totals, active, runningMs, activeProject,
  startTimer, stopTimer, pauseTimer, weekTotalMs, weekRevenue,
  timerStyle, onEditProject, onAddProject,
}: DashboardViewProps) {
  const projectsHours: ProjectHours[] = projects.map(p => {
    const t = totals[p.id]!;
    return {
      id: p.id,
      ms: t.weekMs + (active && active.projectId === p.id ? runningMs : 0),
      longest: t.longest,
    };
  });

  const billableMs = projectsHours.reduce((s, p) => s + p.ms, 0);
  const weekIndex = Math.ceil(
    (startOfDay(new Date()).getTime() - new Date(new Date().getFullYear(), 0, 1).getTime())
    / (7 * 24 * 3600 * 1000),
  );

  return (
    <>
      <div className="page-header" data-screen-label="Dashboard">
        <div>
          <div className="page-eyebrow">
            Volume {new Date().getFullYear()} · No. {weekIndex}
          </div>
          <h1 className="page-title">
            Today, <span className="it">{new Date().toLocaleDateString("en-US", { weekday: "long" })}</span>
          </h1>
        </div>
        <div className="page-meta">
          <strong>{formatHM(weekTotalMs)}</strong>
          this week
          <br />
          ${weekRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })} billable
        </div>
      </div>

      <HeadlineTimer
        activeProject={activeProject}
        runningMs={runningMs}
        onPause={pauseTimer}
        onStop={stopTimer}
      />

      <section className="section">
        <div className="section-head">
          <h2>Active engagements</h2>
          <div className="actions">
            <span
              className="muted mono"
              style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              {projects.length} projects on the books
            </span>
            <button className="btn-ghost" onClick={onAddProject}>+ New project</button>
          </div>
        </div>

        <div className="projects">
          {projects.map((p, i) => {
            const t = totals[p.id]!;
            const isActive = !!(active && active.projectId === p.id);
            return (
              <ProjectRow
                key={p.id}
                project={p}
                idx={i}
                todayMs={t.todayMs}
                weekMs={t.weekMs}
                totalMs={t.totalMs}
                isActive={isActive}
                runningMs={isActive ? runningMs : 0}
                onToggle={() => startTimer(p.id)}
                onStop={() => stopTimer()}
                onEdit={() => onEditProject(p)}
                timerStyle={timerStyle}
              />
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>The week, at a glance</h2>
          <div className="actions">
            <span
              className="muted mono"
              style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              {formatRange(startOfWeekMon(), addDays(startOfWeekMon(), 6))}
            </span>
          </div>
        </div>

        <WeekSummaryStrip
          weekMs={weekTotalMs}
          weekRevenue={weekRevenue}
          billableMs={billableMs}
          projectsHours={projectsHours}
        />

        <div className="rule-with-label"><span className="lbl">by project</span></div>

        <WeekProjectBars projects={projects} projectsHours={projectsHours} />
      </section>
    </>
  );
}
