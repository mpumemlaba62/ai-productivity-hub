import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarClock, Copy, Download, Loader2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { planTasks } from "@/lib/ai.functions";
import { useApp } from "@/context/app-context";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Productivity Suite" },
      { name: "description", content: "Plan and prioritize tasks with an AI-generated schedule." },
    ],
  }),
  component: PlannerPage,
});

type Plan = {
  prioritizedTasks: { title: string; priority: string; estimateHours: number }[];
  dailyPlan: { day: string; blocks: { time: string; task: string }[] }[];
  weeklyOverview: string;
  recommendations: string[];
};

const priorityTone: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/15 text-foreground border-warning/30",
  Low: "bg-success/15 text-foreground border-success/30",
};

function PlannerPage() {
  const { logActivity } = useApp();
  const fn = useServerFn(planTasks);
  const [form, setForm] = useState({
    goals: "",
    tasks: "",
    deadline: "",
    priority: "Medium",
    hoursPerDay: 6,
  });
  const [plan, setPlan] = useState<Plan | null>(null);

  const mutation = useMutation({
    mutationFn: (data: typeof form) => fn({ data }),
    onSuccess: (res) => {
      setPlan(res as Plan);
      logActivity({ type: "plan", title: form.goals.slice(0, 60) || "Task plan" });
      toast.success("Plan generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.goals.trim() || !form.tasks.trim()) {
      toast.error("Add at least your goals and tasks.");
      return;
    }
    mutation.mutate(form);
  };

  const planText = plan
    ? `Weekly overview:\n${plan.weeklyOverview}\n\nPrioritized tasks:\n${plan.prioritizedTasks.map((t) => `- [${t.priority}] ${t.title} (~${t.estimateHours}h)`).join("\n")}\n\nDaily plan:\n${plan.dailyPlan.map((d) => `${d.day}\n${d.blocks.map((b) => `  ${b.time} — ${b.task}`).join("\n")}`).join("\n\n")}\n\nRecommendations:\n${plan.recommendations.map((r) => `- ${r}`).join("\n")}\n`
    : "";

  const download = () => {
    const blob = new Blob([planText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "task-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AppHeader title="AI Task Planner" />
      <main className="mx-auto grid w-full max-w-7xl gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card className="h-fit shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4" /> Plan inputs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Goals</Label>
                <Textarea id="goals" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} rows={3} placeholder="What do you want to achieve this week?" maxLength={2000} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasks">Tasks</Label>
                <Textarea id="tasks" value={form.tasks} onChange={(e) => setForm({ ...form, tasks: e.target.value })} rows={5} placeholder="List your tasks, one per line..." maxLength={4000} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="e.g. Friday EOD" maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Available working hours / day</Label>
                  <span className="text-sm font-medium">{form.hoursPerDay}h</span>
                </div>
                <Slider value={[form.hoursPerDay]} min={1} max={12} step={1} onValueChange={([v]) => setForm({ ...form, hoursPerDay: v })} />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning...</> : "Generate Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mutation.isPending && (
            <Card className="shadow-soft">
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          )}

          {!mutation.isPending && !plan && (
            <Card className="shadow-soft">
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Your AI-generated schedule will appear here.
              </CardContent>
            </Card>
          )}

          {plan && (
            <>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(planText); toast.success("Copied"); }}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={download}>
                  <Download className="mr-1 h-3.5 w-3.5" /> Download
                </Button>
              </div>

              <Card className="shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Weekly overview</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{plan.weeklyOverview}</p></CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Prioritized tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.prioritizedTasks.map((t, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                        <Badge variant="outline" className={priorityTone[t.priority] ?? ""}>{t.priority}</Badge>
                        <span className="min-w-0 flex-1 text-sm font-medium">{t.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">~{t.estimateHours}h</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Daily plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.dailyPlan.map((d, i) => (
                      <div key={i}>
                        <div className="mb-2 text-sm font-semibold">{d.day}</div>
                        <ul className="space-y-1.5 border-l-2 border-primary/30 pl-3">
                          {d.blocks.map((b, j) => (
                            <li key={j} className="text-sm">
                              <span className="font-mono text-xs text-primary">{b.time}</span>
                              <span className="ml-2">{b.task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.recommendations.map((r, i) => <li key={i} className="flex gap-2"><span className="text-primary">★</span>{r}</li>)}
                  </ul>
                </CardContent>
              </Card>

              <AiDisclaimer />
            </>
          )}
        </div>
      </main>
    </>
  );
}
