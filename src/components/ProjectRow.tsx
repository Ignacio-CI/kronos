import type { Project, TimerStyle } from "@/types";
import { formatHM, formatHMS, pad } from "@/lib/utils";
import { PauseIcon, PlayIcon, StopIcon, TimerVisual } from "@/components/TimerVisual";

type ProjectRowProps = {
  project: Project;
  idx: number;
  todayMs: number;
  weekMs: number;
  totalMs: number;
  isActive: boolean;
  runningMs: number;
  onToggle: () => void;
  onStop: () => void;
  onEdit: () => void;
  timerStyle: TimerStyle;
};

export function ProjectRow({
  project, idx, todayMs, weekMs, totalMs, isActive, runningMs,
  onToggle, onStop, onEdit, timerStyle,
}: ProjectRowProps) {
  return (
    <div className={"project-row" + (isActive ? " active" : "")}>
      <div className="project-index mono">{pad(idx + 1)}</div>

      <div className="project-name-cell">
        <div className="client">
          <span className="project-tag-color" style={{ background: project.color }} />
          {project.client}
        </div>
        <h3 className="name" onClick={onEdit} style={{ cursor: "pointer" }}>{project.name}</h3>
      </div>

      <div className="figure-stack">
        <div className="figure">{formatHM(isActive ? todayMs + runningMs : todayMs)}</div>
        <div className="figure-label">today</div>
      </div>

      <div className="figure-stack">
        <div className="figure">{formatHM(isActive ? weekMs + runningMs : weekMs)}</div>
        <div className="figure-label">this week</div>
      </div>

      <div className="figure-stack dim col-total">
        <div className="figure">{formatHM(isActive ? totalMs + runningMs : totalMs)}</div>
        <div className="figure-label">total</div>
      </div>

      <div className="timer-control">
        {timerStyle === "bar" && isActive && (
          <TimerVisual running={true} style="bar" elapsedMs={runningMs} />
        )}
        {timerStyle === "radial" && (
          <TimerVisual running={isActive} style="radial" elapsedMs={runningMs} />
        )}
        <div className="timer-readout mono">
          {isActive ? formatHMS(runningMs) : "—"}
        </div>
        {isActive && (
          <button
            className="stop-btn"
            onClick={onStop}
            aria-label="Stop and log session"
            title="Stop & log"
          >
            <StopIcon />
          </button>
        )}
        <button
          className={"play-btn" + (isActive ? " running" : "")}
          onClick={onToggle}
          aria-label={isActive ? "Pause" : "Start"}
          title={isActive ? "Pause" : "Start"}
        >
          {isActive ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </div>
  );
}
