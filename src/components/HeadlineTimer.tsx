import type { Project } from "@/types";
import { formatHMS, formatTime } from "@/lib/utils";

type HeadlineTimerProps = {
  activeProject: Project | null;
  runningMs: number;
  onPause: () => void;
  onStop: () => void;
};

export function HeadlineTimer({ activeProject, runningMs, onPause, onStop }: HeadlineTimerProps) {
  const running = !!activeProject;
  return (
    <div className={"headline-timer " + (running ? "running" : "idle")}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
        <div className="headline-meta">
          {running ? "in session" : "no session running"}
          {running && (
            <span style={{ marginLeft: 16, color: "var(--ink-3)" }}>
              started at {formatTime(new Date(Date.now() - runningMs))}
            </span>
          )}
        </div>
        <div className="headline-project">
          {running
            ? activeProject!.name
            : <span style={{ color: "var(--ink-3)" }}>Press any project to begin</span>}
        </div>
      </div>
      <div className="headline-figure mono">
        {running ? formatHMS(runningMs) : "00:00:00"}
      </div>
      {running && (
        <div className="headline-actions">
          <button className="btn-ghost" onClick={onPause}>Pause</button>
          <button className="btn-primary" onClick={onStop}>Stop &amp; log</button>
        </div>
      )}
    </div>
  );
}
