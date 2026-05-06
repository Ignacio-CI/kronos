import { decimalHours, formatHM } from "@/lib/utils";

export type ProjectHours = { id: string; ms: number; longest?: number };

type WeekSummaryStripProps = {
  weekMs: number;
  weekRevenue: number;
  projectsHours: ProjectHours[];
  billableMs: number;
};

export function WeekSummaryStrip({
  weekMs, weekRevenue, projectsHours, billableMs,
}: WeekSummaryStripProps) {
  return (
    <div className="week-summary">
      <div className="cell">
        <div className="label">Week to date</div>
        <div className="value mono">{formatHM(weekMs)}</div>
        <div className="sub">across {projectsHours.filter(p => p.ms > 0).length} projects</div>
      </div>
      <div className="cell">
        <div className="label">Billable</div>
        <div className="value mono">${weekRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
        <div className="sub">{decimalHours(billableMs).toFixed(2)} h logged</div>
      </div>
      <div className="cell">
        <div className="label">Daily average</div>
        <div className="value mono">{formatHM(weekMs / Math.max(1, new Date().getDay() || 7))}</div>
        <div className="sub">Mon–today</div>
      </div>
      <div className="cell">
        <div className="label">Longest session</div>
        <div className="value mono">
          {formatHM(projectsHours.reduce((m, p) => Math.max(m, p.longest ?? 0), 0))}
        </div>
        <div className="sub">this week</div>
      </div>
    </div>
  );
}
