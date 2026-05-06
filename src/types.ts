export type Project = {
  id: string;
  client: string;
  name: string;
  color: string;
  rate: number;
  target: number;
  note: string;
};

export type Entry = {
  id: string;
  projectId: string;
  start: string;
  end: string | null;
  note: string;
  _running?: boolean;
};

export type ActiveSession = { projectId: string; start: number };

export type Theme = "light" | "dark";
export type Density = "comfortable" | "compact";
export type Typography = "serif-mono" | "mono" | "sans";
export type TimerStyle = "digits" | "bar" | "radial";

export type Tweaks = {
  theme: Theme;
  density: Density;
  typography: Typography;
  timerStyle: TimerStyle;
};

export type Route = "dashboard" | "calendar";
