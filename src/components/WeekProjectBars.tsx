import type { Project } from "@/types";
import { HOUR, decimalHours, formatHM, pad } from "@/lib/utils";
import type { ProjectHours } from "@/components/WeekSummaryStrip";

type WeekProjectBarsProps = {
  projects: Project[];
  projectsHours: ProjectHours[];
};

export function WeekProjectBars({ projects, projectsHours }: WeekProjectBarsProps) {
  const max = Math.max(
    ...projects.map(p => p.target * HOUR),
    ...projectsHours.map(ph => ph.ms),
    1,
  );
  return (
    <div className="week-projects">
      {projects.map((p, i) => {
        const ph = projectsHours.find(x => x.id === p.id) ?? { id: p.id, ms: 0 };
        const widthPct = (ph.ms / max) * 100;
        const targetPct = (p.target * HOUR / max) * 100;
        const revenue = decimalHours(ph.ms) * p.rate;
        return (
          <div key={p.id} className="week-project">
            <div className="num">{pad(i + 1)}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span className="name">{p.name}</span>
              <span className="muted mono" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
                {p.client.toUpperCase()}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="bar-wrap">
                <div className="bar" style={{ width: widthPct + "%", background: p.color }} />
                <div className="bar-target" style={{ left: targetPct + "%" }} />
              </div>
              <div className="figure mono">{formatHM(ph.ms)} / {p.target}h</div>
            </div>
            <div className="revenue mono">
              ${revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
