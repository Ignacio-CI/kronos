import { useState } from "react";
import type { Entry, Project } from "@/types";
import { decimalHours, entryDuration, formatHM, formatRange } from "@/lib/utils";
import { WeekCalendar } from "@/components/WeekCalendar";

type CalendarViewProps = {
  projects: Project[];
  entries: Entry[];
  runningEntry: Entry | null;
  weekStart: Date;
  weekEnd: Date;
  onEditEntry: (e: Entry) => void;
  onAddAt: (d: Date, hourFloat: number) => void;
  offset: number;
  setOffset: (n: number) => void;
  onAdd: () => void;
};

export function CalendarView({
  projects, entries, runningEntry, weekStart, weekEnd,
  onEditEntry, onAddAt, offset, setOffset, onAdd,
}: CalendarViewProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? entries : entries.filter(e => e.projectId === filter);

  const totalMs = filtered.reduce((s, e) => s + entryDuration(e), 0);
  const revenue = filtered.reduce((s, e) => {
    const p = projects.find(x => x.id === e.projectId);
    return s + (p ? decimalHours(entryDuration(e)) * p.rate : 0);
  }, 0);

  const weekIndex = Math.ceil(
    (weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime())
    / (7 * 24 * 3600 * 1000),
  );

  return (
    <>
      <div className="page-header" data-screen-label="Calendar">
        <div>
          <div className="page-eyebrow">The Logbook · Week {weekIndex}</div>
          <h1 className="page-title">{formatRange(weekStart, weekEnd)}</h1>
        </div>
        <div className="page-meta">
          <strong>{formatHM(totalMs)}</strong>
          {filtered.length} sessions
          <br />
          ${revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })} billable
        </div>
      </div>

      <section className="section" style={{ paddingBottom: 16 }}>
        <div className="log-toolbar">
          <button className="btn-ghost" onClick={() => setOffset(offset - 1)}>← Previous</button>
          <button
            className="btn-ghost"
            onClick={() => setOffset(0)}
            disabled={offset === 0}
            style={{ opacity: offset === 0 ? 0.4 : 1 }}
          >This week</button>
          <button
            className="btn-ghost"
            onClick={() => setOffset(offset + 1)}
            disabled={offset >= 0}
            style={{ opacity: offset >= 0 ? 0.4 : 1 }}
          >Next →</button>
          <span style={{ width: 24 }} />
          <span
            className="mono"
            style={{
              fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--ink-3)",
            }}
          >Filter</span>
          <button
            className={"chip" + (filter === "all" ? " active" : "")}
            onClick={() => setFilter("all")}
          >All projects</button>
          {projects.map(p => (
            <button
              key={p.id}
              className={"chip" + (filter === p.id ? " active" : "")}
              onClick={() => setFilter(p.id)}
            >
              <span style={{
                display: "inline-block", width: 6, height: 6,
                borderRadius: 999, background: p.color, marginRight: 8,
              }} />
              {p.client}
            </button>
          ))}
          <span className="spacer" />
          <button className="btn-primary" onClick={onAdd}>+ New entry</button>
        </div>
      </section>

      <WeekCalendar
        weekStart={weekStart}
        entries={filtered}
        projects={projects}
        runningEntry={runningEntry}
        onEditEntry={onEditEntry}
        onAddAt={onAddAt}
      />

      <section className="section" style={{ borderBottom: 0 }}>
        <div
          className="muted mono"
          style={{
            fontSize: 10, letterSpacing: "0.18em",
            textTransform: "uppercase", textAlign: "center",
          }}
        >
          Double-click any open slot to log time · Click a block to edit
        </div>
      </section>
    </>
  );
}
