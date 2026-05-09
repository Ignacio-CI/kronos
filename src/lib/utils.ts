import type { Entry, Project } from "@/types";

export const MS = 1000;
export const MIN = 60 * MS;
export const HOUR = 60 * MIN;

export function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

// 02:34:11 (always shows hours)
export function formatHMS(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  ms = Math.max(0, Math.abs(ms));
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / MIN);
  const s = Math.floor((ms % MIN) / MS);
  return sign + pad(h) + ":" + pad(m) + ":" + pad(s);
}

// 4h 32m  (compact, for figures)
export function formatHM(ms: number): string {
  ms = Math.max(0, ms);
  const h = Math.floor(ms / HOUR);
  const m = Math.round((ms % HOUR) / MIN);
  if (h === 0 && m === 0) return "0m";
  if (h === 0) return m + "m";
  if (m === 0) return h + "h";
  return h + "h " + pad(m) + "m";
}

// 4.32 (decimal hours, for revenue calcs)
export function decimalHours(ms: number): number {
  return ms / HOUR;
}

export function entryDuration(e: Entry, nowOverride: number | null = null): number {
  const start = new Date(e.start).getTime();
  const end = e.end ? new Date(e.end).getTime() : (nowOverride ?? Date.now());
  return Math.max(0, end - start);
}

export function startOfDay(d: Date | number | string): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeekMon(d: Date = new Date()): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
}

export function dayKey(d: Date): string {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function formatDate(d: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...opts });
}

export function formatDateLong(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

export function formatRange(a: Date, b: Date): string {
  // "Apr 28 — May 4"
  const sm = a.toLocaleDateString("en-US", { month: "short" });
  const em = b.toLocaleDateString("en-US", { month: "short" });
  if (sm === em) return sm + " " + a.getDate() + "–" + b.getDate();
  return sm + " " + a.getDate() + " – " + em + " " + b.getDate();
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
}

// markdown-lite: **bold**, *italic*, `code`, line breaks
export function renderMD(text: string | undefined): string {
  if (!text) return "";
  let s = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/`(.+?)`/g, "<code>$1</code>");
  s = s.replace(/\n/g, "<br/>");
  return s;
}

// CSV export
export function toCSV(entries: Entry[], projects: Project[]): string {
  const rows: (string | number)[][] = [
    ["id", "client", "project", "date", "start", "end", "duration_h", "rate", "revenue", "note"],
  ];
  const projMap = Object.fromEntries(projects.map(p => [p.id, p]));
  
  let totalHours = 0;
  let totalRevenue = 0;

  entries.forEach(e => {
    const p = projMap[e.projectId];
    if (!p) return;
    const start = new Date(e.start);
    const end = e.end ? new Date(e.end) : new Date();
    const dur = entryDuration(e);
    const hours = decimalHours(dur);
    const revenue = hours * p.rate;
    
    totalHours += hours;
    totalRevenue += revenue;

    rows.push([
      e.id,
      p.client,
      p.name,
      start.toISOString().slice(0, 10),
      formatTime(start),
      formatTime(end),
      hours.toFixed(2),
      p.rate.toFixed(2),
      revenue.toFixed(2),
      (e.note || "").replace(/[\r\n]+/g, " ").replace(/"/g, '""'),
    ]);
  });
  
  // Add total row
  rows.push([
    "TOTAL", "", "", "", "", "", 
    totalHours.toFixed(2), "", totalRevenue.toFixed(2), ""
  ]);

  return rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
