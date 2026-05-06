import type { CSSProperties } from "react";
import type { Entry, Project } from "@/types";
import { addDays, entryDuration, formatHM, formatTime, pad, renderMD, sameDay } from "@/lib/utils";

type WeekCalendarProps = {
  weekStart: Date;
  entries: Entry[];
  projects: Project[];
  runningEntry: Entry | null;
  onEditEntry: (e: Entry) => void;
  onAddAt: (d: Date, hourFloat: number) => void;
};

export function WeekCalendar({
  weekStart, entries, projects, runningEntry, onEditEntry, onAddAt,
}: WeekCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  const projMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const HOUR_START = 7;
  const HOUR_END = 21;
  const TOTAL_HOURS = HOUR_END - HOUR_START;
  const PX_PER_HOUR = 60;
  const totalHeight = TOTAL_HOURS * PX_PER_HOUR;

  const byDay: Entry[][] = days.map(() => []);
  entries.forEach(e => {
    const start = new Date(e.start);
    days.forEach((d, idx) => {
      if (sameDay(start, d)) byDay[idx]!.push(e);
    });
  });
  if (runningEntry) {
    const start = new Date(runningEntry.start);
    days.forEach((d, idx) => {
      if (sameDay(start, d)) byDay[idx]!.push({ ...runningEntry, _running: true });
    });
  }

  const computeBlock = (e: Entry) => {
    const s = new Date(e.start);
    const en = e.end ? new Date(e.end) : new Date();
    const startH = s.getHours() + s.getMinutes() / 60;
    const endH = en.getHours() + en.getMinutes() / 60;
    const top = Math.max(0, (startH - HOUR_START) * PX_PER_HOUR);
    const height = Math.max(18, (endH - startH) * PX_PER_HOUR);
    return { top, height };
  };

  const nowLineFor = (d: Date): number | null => {
    if (!sameDay(d, today)) return null;
    const h = today.getHours() + today.getMinutes() / 60;
    if (h < HOUR_START || h > HOUR_END) return null;
    return (h - HOUR_START) * PX_PER_HOUR;
  };

  return (
    <div
      className="calendar"
      style={{ "--cal-h": totalHeight + "px" } as CSSProperties}
    >
      <div className="cal-corner"></div>
      {days.map((d, i) => (
        <div key={i} className={"cal-day-head" + (sameDay(d, today) ? " today" : "")}>
          <span className="dow">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
          <span className="dom">{d.getDate()}</span>
        </div>
      ))}

      <div className="cal-time-col" style={{ minHeight: totalHeight }}>
        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
          <div key={i} className="cal-hour" style={{ top: i * PX_PER_HOUR }}>
            {pad(HOUR_START + i)}:00
          </div>
        ))}
      </div>

      {days.map((d, i) => {
        const nowTop = nowLineFor(d);
        return (
          <div
            key={i}
            className={"cal-day-col" + (sameDay(d, today) ? " today" : "")}
            style={{ minHeight: totalHeight }}
            onDoubleClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetY = e.clientY - rect.top;
              const hourFloat = HOUR_START + offsetY / PX_PER_HOUR;
              onAddAt(d, hourFloat);
            }}
          >
            {Array.from({ length: TOTAL_HOURS }, (_, h) => (
              <div
                key={h}
                className="cal-hour"
                style={{
                  top: h * PX_PER_HOUR,
                  position: "absolute",
                  borderBottom: "1px dashed var(--rule-soft)",
                }}
              />
            ))}
            {byDay[i]!.map((e, k) => {
              const p = projMap[e.projectId];
              if (!p) return null;
              const { top, height } = computeBlock(e);
              const s = new Date(e.start);
              const en = e.end ? new Date(e.end) : new Date();
              return (
                <div
                  key={e.id + "-" + k}
                  className="cal-block"
                  style={{
                    top, height,
                    background: e._running ? "var(--accent-bg)" : "var(--paper-2)",
                    borderColor: p.color,
                  }}
                  onClick={() => !e._running && onEditEntry(e)}
                  title={p.name}
                >
                  <div className="b-name">{p.name}</div>
                  <div className="b-time">
                    {formatTime(s)}–{e.end ? formatTime(en) : "now"}
                    {" · "}
                    {formatHM(entryDuration(e))}
                  </div>
                  {height > 50 && e.note && (
                    <div
                      className="b-note"
                      dangerouslySetInnerHTML={{
                        __html: renderMD(e.note).replace(/<br\/>/g, " · "),
                      }}
                    />
                  )}
                </div>
              );
            })}
            {nowTop !== null && <div className="cal-now-line" style={{ top: nowTop }} />}
          </div>
        );
      })}
    </div>
  );
}
