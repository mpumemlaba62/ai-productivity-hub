import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

export type ActivityItem = {
  id: string;
  type: "email" | "meeting" | "plan";
  title: string;
  timestamp: number;
};

type Stats = {
  emails: number;
  meetings: number;
  plans: number;
};

type AppCtx = {
  theme: Theme;
  toggleTheme: () => void;
  stats: Stats;
  activity: ActivityItem[];
  logActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void;
};

const Ctx = createContext<AppCtx | null>(null);

const STATS_KEY = "aips-stats";
const ACTIVITY_KEY = "aips-activity";
const THEME_KEY = "aips-theme";

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [stats, setStats] = useState<Stats>({ emails: 0, meetings: 0, plans: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const t = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
    setTheme(t);
    const s = localStorage.getItem(STATS_KEY);
    if (s) setStats(JSON.parse(s));
    const a = localStorage.getItem(ACTIVITY_KEY);
    if (a) setActivity(JSON.parse(a));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const logActivity: AppCtx["logActivity"] = (item) => {
    const entry: ActivityItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setActivity((prev) => {
      const next = [entry, ...prev].slice(0, 20);
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
      return next;
    });
    setStats((prev) => {
      const next = { ...prev };
      if (item.type === "email") next.emails += 1;
      if (item.type === "meeting") next.meetings += 1;
      if (item.type === "plan") next.plans += 1;
      localStorage.setItem(STATS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ theme, toggleTheme, stats, activity, logActivity }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
