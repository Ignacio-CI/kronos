import type { TimerStyle } from "@/types";

export function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M2 1.5 L10 6 L2 10.5 Z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12">
      <rect x="0" y="0" width="3" height="12" fill="currentColor" />
      <rect x="7" y="0" width="3" height="12" fill="currentColor" />
    </svg>
  );
}

export function StopIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10">
      <rect x="0" y="0" width="10" height="10" fill="currentColor" />
    </svg>
  );
}

type TimerVisualProps = {
  running: boolean;
  style: TimerStyle;
  elapsedMs: number;
};

export function TimerVisual({ running, style, elapsedMs }: TimerVisualProps) {
  if (style === "bar") {
    return running ? (
      <div className="timer-bar"><div className="fill" /></div>
    ) : null;
  }
  if (style === "radial") {
    const secs = Math.floor((elapsedMs / 1000) % 60);
    const circ = 2 * Math.PI * 18;
    const offset = circ * (1 - secs / 60);
    return (
      <div className="timer-radial">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle className="ring-bg" cx="22" cy="22" r="18" fill="none" strokeWidth="2" />
          {running && (
            <circle
              className="ring-fg"
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="2"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          )}
        </svg>
        {running && <div className="dot" />}
      </div>
    );
  }
  // digits: nothing extra (timer-readout already shows digits)
  return null;
}
