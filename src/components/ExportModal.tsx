import { useState, useMemo } from "react";
import type { Entry, Project } from "@/types";
import { startOfWeekMon, startOfMonth, entryDuration, toCSV, downloadCSV } from "@/lib/utils";
import { buildPDF } from "@/lib/pdf";

type ExportModalProps = {
  projects: Project[];
  entries: Entry[];
  onClose: () => void;
};

type TimePeriod = "all_time" | "this_week" | "this_month" | "last_month" | "custom";
type Format = "pdf" | "csv";

const formatDay = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function ExportModal({ projects, entries, onClose }: ExportModalProps) {
  const [projectId, setProjectId] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all_time");
  const [format, setFormat] = useState<Format>("pdf");
  
  const today = new Date();
  const [customStart, setCustomStart] = useState<string>(today.toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState<string>(today.toISOString().slice(0, 10));

  const { filteredEntries, projectHours, periodLabel } = useMemo(() => {
    let startMs = 0;
    let endMs = Infinity;

    if (timePeriod === "this_week") {
      startMs = startOfWeekMon(today).getTime();
    } else if (timePeriod === "this_month") {
      startMs = startOfMonth(today).getTime();
    } else if (timePeriod === "last_month") {
      const thisMonth = startOfMonth(today);
      startMs = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1).getTime();
      endMs = thisMonth.getTime() - 1;
    } else if (timePeriod === "custom") {
      if (customStart) {
        startMs = new Date(customStart).getTime();
      }
      if (customEnd) {
        const d = new Date(customEnd);
        d.setHours(23, 59, 59, 999);
        endMs = d.getTime();
      }
    }

    const periodEntries = entries.filter(e => {
      const eStart = new Date(e.start).getTime();
      return eStart >= startMs && eStart <= endMs;
    });

    const hoursByProject: Record<string, number> = {};
    for (const p of projects) {
      hoursByProject[p.id] = 0;
    }
    
    for (const e of periodEntries) {
      if (hoursByProject[e.projectId] !== undefined) {
        hoursByProject[e.projectId] += entryDuration(e);
      }
    }

    const finalEntries = projectId === "all" 
      ? periodEntries 
      : periodEntries.filter(e => e.projectId === projectId);

    const label = timePeriod === "all_time"
      ? "All time"
      : `${formatDay(startMs)} – ${formatDay(endMs === Infinity ? today.getTime() : endMs)}`;

    return { filteredEntries: finalEntries, projectHours: hoursByProject, periodLabel: label };
  }, [entries, projects, timePeriod, customStart, customEnd, projectId]);

  const handleExport = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    if (format === "pdf") {
      buildPDF(filteredEntries, projects, periodLabel).save(`kronos-report-${dateStr}.pdf`);
    } else {
      downloadCSV(`kronos-export-${dateStr}.csv`, toCSV(filteredEntries, projects));
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">export data</div>
            <div className="title">Download report</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="muted">
            <div className="icon-x" />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as Format)}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="field">
            <label>Time Period</label>
            <select
              value={timePeriod}
              onChange={e => setTimePeriod(e.target.value as TimePeriod)}
            >
              <option value="all_time">All Time</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {timePeriod === "custom" && (
            <div className="field-row">
              <div className="field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                />
              </div>
              <div className="field">
                <label>End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="field">
            <label>Project</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(p => {
                const hasHours = projectHours[p.id]! > 0;
                return (
                  <option key={p.id} value={p.id} disabled={!hasHours}>
                    {p.name} {hasHours ? "" : "(no hours)"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={filteredEntries.length === 0}
            style={{ 
              opacity: filteredEntries.length === 0 ? 0.4 : 1, 
              cursor: filteredEntries.length === 0 ? "not-allowed" : "pointer" 
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
