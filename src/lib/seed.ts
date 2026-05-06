import type { Entry, Project } from "@/types";

export const PROJECTS: Project[] = [
  {
    id: "p1",
    client: "Halberd & Finch",
    name: "Brand Architecture Refresh",
    color: "oklch(52% 0.16 35)",
    rate: 220,
    target: 18,
    note: "Q2 strategic engagement",
  },
  {
    id: "p2",
    client: "Meridian Capital",
    name: "Quarterly Investor Letters",
    color: "oklch(40% 0.06 240)",
    rate: 280,
    target: 10,
    note: "Recurring writing retainer",
  },
  {
    id: "p3",
    client: "Atelier Voss",
    name: "Studio Operations Audit",
    color: "oklch(45% 0.09 145)",
    rate: 175,
    target: 12,
    note: "Six-week diagnostic",
  },
];

const startOfWeek = (): Date => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const at = (daysFromMonday: number, hh: number, mm: number = 0): string => {
  const d = startOfWeek();
  d.setDate(d.getDate() + daysFromMonday);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};

const atLast = (daysFromMonday: number, hh: number, mm: number = 0): string => {
  const d = startOfWeek();
  d.setDate(d.getDate() + daysFromMonday - 7);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};

const atTwoWeeksAgo = (daysFromMonday: number, hh: number, mm: number = 0): string => {
  const d = startOfWeek();
  d.setDate(d.getDate() + daysFromMonday - 14);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};

let _eid = 0;
const E = (projectId: string, start: string, end: string, note: string = ""): Entry => ({
  id: "e" + (++_eid),
  projectId,
  start,
  end,
  note,
});

const todayDow: number = (() => {
  const d = new Date();
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
})();

export const ENTRIES: Entry[] = [
  // === current week ===
  E("p1", at(0, 9, 15), at(0, 11, 30),
    "**Brand audit kickoff** with leadership. Reviewed competitor positioning matrix; flagged three *gaps* in current narrative."),
  E("p2", at(0, 13, 0), at(0, 15, 45),
    "Drafted opening section of Q2 letter. Working on tone — less *boilerplate*, more `signal`."),
  E("p3", at(0, 16, 0), at(0, 17, 30),
    "Stakeholder interviews — production lead and ops manager. Notes captured in Notion."),

  E("p1", at(1, 9, 0), at(1, 12, 30),
    "Workshop prep: built three positioning territories with example *headlines* and visual references."),
  E("p3", at(1, 14, 0), at(1, 16, 0),
    "Workflow mapping — current state. Identified five **handoff bottlenecks** between studio and finance."),

  ...(todayDow >= 2 ? [
    E("p2", at(2, 9, 30), at(2, 11, 15),
      "Letter revisions per CFO comments. Tightened risk section."),
    E("p1", at(2, 13, 0), at(2, 14, 45),
      "Naming exploration — generated 40 candidates, narrowed to 7."),
  ] : []),

  ...(todayDow >= 3 ? [
    E("p1", at(3, 9, 0), at(3, 12, 0), "Deep work on territory presentation."),
    E("p3", at(3, 14, 30), at(3, 17, 0), "Audit synthesis."),
  ] : []),

  ...(todayDow >= 4 ? [
    E("p2", at(4, 10, 0), at(4, 12, 30), "Final letter pass."),
  ] : []),

  // === last week ===
  E("p1", atLast(0, 9, 0),  atLast(0, 12, 30), "Onboarding and contract finalization."),
  E("p1", atLast(1, 14, 0), atLast(1, 17, 0),  "Discovery research — competitor brands."),
  E("p2", atLast(1, 9, 30), atLast(1, 12, 0),  "Outline and source gathering."),
  E("p3", atLast(2, 9, 0),  atLast(2, 11, 0),  "Initial process map."),
  E("p1", atLast(2, 13, 30), atLast(2, 16, 30), "Customer interview synthesis."),
  E("p2", atLast(3, 10, 0), atLast(3, 13, 0),  "Section drafting."),
  E("p3", atLast(3, 14, 0), atLast(3, 17, 30), "Workshop with ops team."),
  E("p1", atLast(4, 9, 30), atLast(4, 11, 30), "Internal review."),

  // === two weeks ago ===
  E("p1", atTwoWeeksAgo(0, 10, 0), atTwoWeeksAgo(0, 12, 0), "Kickoff."),
  E("p2", atTwoWeeksAgo(1, 9, 0),  atTwoWeeksAgo(1, 11, 30), "Research."),
  E("p3", atTwoWeeksAgo(2, 13, 0), atTwoWeeksAgo(2, 16, 0), "Stakeholder mapping."),
  E("p1", atTwoWeeksAgo(3, 14, 0), atTwoWeeksAgo(3, 17, 0), "Strategy doc."),
  E("p2", atTwoWeeksAgo(4, 10, 0), atTwoWeeksAgo(4, 12, 0), "Editing."),
];
