import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { Entry, Project } from "@/types";
import { entryDuration, decimalHours, entryType, entryTypeLabel } from "@/lib/utils";

function plainText(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

const hours = (h: number) => h.toFixed(2) + " h";
const sumHours = (es: Entry[]) => es.reduce((s, e) => s + decimalHours(entryDuration(e)), 0);

type RGB = [number, number, number];

// oklch(L% C H) -> sRGB, see https://bottosson.github.io/posts/oklab/
function oklchToRgb(L: number, C: number, H: number): RGB {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map(x => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  }) as RGB;
}

function palette(color: string) {
  const [L = 45, C = 0.1, H = 240] = (color.match(/[\d.]+/g) ?? []).map(Number);
  return {
    title: oklchToRgb(L / 100, C, H),
    head: oklchToRgb(0.86, 0.06, H),
    row: oklchToRgb(0.97, 0.015, H),
    foot: oklchToRgb(0.92, 0.04, H),
  };
}

export function buildPDF(entries: Entry[], projects: Project[], periodLabel: string): jsPDF {
  const doc = new jsPDF();
  const margin = 14;

  doc.setFontSize(18);
  doc.text("Time report", margin, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(periodLabel, margin, 27);
  doc.setTextColor(0);

  let y = 36;
  let grandWork = 0;
  let grandOther = 0;

  for (const p of projects) {
    const projectEntries = entries
      .filter(e => e.projectId === p.id)
      .sort((a, b) => b.start.localeCompare(a.start));
    if (projectEntries.length === 0) continue;

    const work = sumHours(projectEntries.filter(e => entryType(e) === "work"));
    const other = sumHours(projectEntries.filter(e => entryType(e) !== "work"));
    grandWork += work;
    grandOther += other;

    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 20;
    }
    const colors = palette(p.color);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.title);
    doc.text(p.client ? `${p.name} — ${p.client}` : p.name, margin, y);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");

    const normal = { fontStyle: "normal" as const };
    autoTable(doc, {
      startY: y + 3,
      margin: { left: margin, right: margin },
      head: [["Date", "Type", "Description", "Hours"]],
      body: projectEntries.map(e => [
        formatDay(e.start),
        entryTypeLabel(entryType(e)),
        plainText(e.note) || "—",
        hours(decimalHours(entryDuration(e))),
      ]),
      foot: [
        ...(other > 0
          ? [
              ["", "", { content: "Work", styles: normal }, { content: hours(work), styles: normal }],
              ["", "", { content: "Non-billable", styles: normal }, { content: hours(other), styles: normal }],
            ]
          : []),
        ["", "", "Project total", hours(work + other)],
      ],
      showFoot: "lastPage",
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2, valign: "top", textColor: 40 },
      headStyles: { fillColor: colors.head, textColor: 30 },
      alternateRowStyles: { fillColor: colors.row },
      footStyles: { fillColor: colors.foot, textColor: 20, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 20 },
        3: { cellWidth: 22, halign: "right" },
      },
      didParseCell: data => {
        if (data.column.index === 3) data.cell.styles.halign = "right";
      },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }

  if (y > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    y = 20;
  }
  const right = doc.internal.pageSize.getWidth() - margin;
  if (grandOther > 0) {
    doc.setFontSize(11);
    doc.text("Work", margin, y);
    doc.text(hours(grandWork), right, y, { align: "right" });
    doc.text("Non-billable", margin, y + 6);
    doc.text(hours(grandOther), right, y + 6, { align: "right" });
    y += 14;
  }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Grand total", margin, y);
  doc.text(hours(grandWork + grandOther), right, y, { align: "right" });

  return doc;
}
