import type { ActiveSession, Project, Route } from "@/types";
import { formatDateLong, formatHMS } from "@/lib/utils";

type SidebarProps = {
  route: Route;
  setRoute: (r: Route) => void;
  active: ActiveSession | null;
  activeProject: Project | null;
  runningMs: number;
  today: Date;
  onNewEntry: () => void;
  onNewProject: () => void;
  onExportCSV: () => void;
};

export function Sidebar({
  route, setRoute, active, activeProject, runningMs, today,
  onNewEntry, onNewProject, onExportCSV,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-title">Kronos</div>
        <div className="brand-sub">Logbook · est. 2026</div>
      </div>

      <button
        className={"nav-item" + (route === "dashboard" ? " active" : "")}
        onClick={() => setRoute("dashboard")}
      >
        <span>{route === "dashboard" ? <em>Today</em> : "Today"}</span>
        <span className="nav-num">I</span>
      </button>
      <button
        className={"nav-item" + (route === "calendar" ? " active" : "")}
        onClick={() => setRoute("calendar")}
      >
        <span>{route === "calendar" ? <em>The Week</em> : "The Week"}</span>
        <span className="nav-num">II</span>
      </button>
      <button className="nav-item" onClick={onNewEntry}>
        <span>New entry</span>
        <span className="nav-num">+</span>
      </button>
      <button className="nav-item" onClick={onNewProject}>
        <span>New project</span>
        <span className="nav-num">+</span>
      </button>
      <button className="nav-item" onClick={onExportCSV}>
        <span>Export CSV</span>
        <span className="nav-num">↓</span>
      </button>

      <div className="sidebar-footer">
        {active && activeProject ? (
          <div className="sidebar-active-mini">
            <div className="label">
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: "var(--accent)", display: "inline-block",
                animation: "blink 1.2s ease-in-out infinite",
              }} />
              in session
            </div>
            <div className="project-name">{activeProject.name}</div>
            <div className="timer mono">{formatHMS(runningMs)}</div>
          </div>
        ) : (
          <div style={{
            fontFamily: "var(--font-data)", fontSize: 10,
            letterSpacing: "0.18em", color: "var(--ink-4)",
            textTransform: "uppercase",
          }}>
            No session
          </div>
        )}
        <div style={{
          fontFamily: "var(--font-data)", fontSize: 10,
          color: "var(--ink-4)", letterSpacing: "0.06em",
        }}>
          {formatDateLong(today)}
        </div>
      </div>
    </aside>
  );
}
