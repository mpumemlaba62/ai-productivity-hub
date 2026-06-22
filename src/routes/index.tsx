import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { Mail, FileText, CalendarClock, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Productivity Suite" },
      {
        name: "description",
        content: "Your AI productivity dashboard: emails generated, meetings summarized, tasks planned.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { stats, activity } = useApp();

  const total = stats.emails + stats.meetings + stats.plans;
  const score = Math.min(100, total * 8);

  const cards = [
    { label: "Emails Generated", value: stats.emails, icon: Mail, color: "from-violet-500 to-fuchsia-500" },
    { label: "Meetings Summarized", value: stats.meetings, icon: FileText, color: "from-sky-500 to-cyan-500" },
    { label: "Tasks Planned", value: stats.plans, icon: CalendarClock, color: "from-emerald-500 to-teal-500" },
    { label: "Productivity Score", value: `${score}`, icon: TrendingUp, color: "from-amber-500 to-orange-500" },
  ];

  const tools = [
    { to: "/email", title: "Smart Email Generator", desc: "Draft polished emails in any tone, instantly.", icon: Mail },
    { to: "/meetings", title: "Meeting Summarizer", desc: "Turn raw notes into action-ready summaries.", icon: FileText },
    { to: "/planner", title: "AI Task Planner", desc: "Prioritize work and build an optimized schedule.", icon: CalendarClock },
  ] as const;

  return (
    <>
      <AppHeader title="Dashboard" />
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
        <section className="overflow-hidden rounded-2xl border border-border bg-gradient-brand p-6 text-primary-foreground shadow-glow sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold sm:text-2xl">Welcome back</h2>
              <p className="text-sm text-white/85">
                Three AI-powered tools to ship faster: emails, summaries, and plans.
              </p>
            </div>
            <Button asChild variant="secondary" className="bg-white text-foreground hover:bg-white/90">
              <Link to="/email">Start with email <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
                  {c.label}
                </CardTitle>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.color} text-white`}>
                  <c.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold sm:text-3xl">{c.value}</div>
                {c.label === "Productivity Score" && (
                  <Progress value={score} className="mt-2 h-1.5" />
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="group">
              <Card className="h-full shadow-soft transition-all group-hover:-translate-y-0.5 group-hover:shadow-glow">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                  <div className="mt-auto inline-flex items-center text-sm font-medium text-primary">
                    Open <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <section>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nothing here yet. Run a tool to see activity.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {activity.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                        {a.type === "email" && <Mail className="h-4 w-4" />}
                        {a.type === "meeting" && <FileText className="h-4 w-4" />}
                        {a.type === "plan" && <CalendarClock className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{a.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(a.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
