import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, Download, FileText, Loader2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { summarizeMeeting } from "@/lib/ai.functions";
import { useApp } from "@/context/app-context";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Productivity Suite" },
      { name: "description", content: "Turn meeting notes into structured summaries with AI." },
    ],
  }),
  component: MeetingPage,
});

type Summary = {
  executiveSummary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string }[];
  followUps: string[];
};

function MeetingPage() {
  const { logActivity } = useApp();
  const fn = useServerFn(summarizeMeeting);
  const [form, setForm] = useState({ title: "", participants: "", notes: "" });
  const [summary, setSummary] = useState<Summary | null>(null);

  const mutation = useMutation({
    mutationFn: (data: typeof form) => fn({ data }),
    onSuccess: (res) => {
      setSummary(res as Summary);
      logActivity({ type: "meeting", title: form.title || "Untitled meeting" });
      toast.success("Summary ready");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || form.notes.trim().length < 10) {
      toast.error("Add a title and at least a short set of notes.");
      return;
    }
    mutation.mutate(form);
  };

  const text = summary
    ? `# ${form.title}\n\nExecutive Summary:\n${summary.executiveSummary}\n\nKey Points:\n${summary.keyPoints.map((p) => `- ${p}`).join("\n")}\n\nDecisions:\n${summary.decisions.map((p) => `- ${p}`).join("\n")}\n\nAction Items:\n${summary.actionItems.map((a) => `- ${a.task} (${a.owner})`).join("\n")}\n\nFollow-Ups:\n${summary.followUps.map((p) => `- ${p}`).join("\n")}\n`
    : "";

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title || "meeting-summary"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AppHeader title="Meeting Notes Summarizer" />
      <main className="mx-auto grid w-full max-w-7xl gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Meeting input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Q3 product review" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parts">Participants (optional)</Label>
                <Input id="parts" value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} placeholder="Alice, Bob, Carol" maxLength={500} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Transcript / Notes</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={14} placeholder="Paste raw notes or a transcript..." maxLength={20000} />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...</> : "Summarize Meeting"}
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
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          )}

          {!mutation.isPending && !summary && (
            <Card className="shadow-soft">
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Your structured summary will appear here.
              </CardContent>
            </Card>
          )}

          {summary && (
            <>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={copy}><Copy className="mr-1 h-3.5 w-3.5" /> Copy</Button>
                <Button size="sm" variant="outline" onClick={download}><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
              </div>

              <SummaryCard title="Executive Summary">
                <p className="text-sm leading-relaxed">{summary.executiveSummary}</p>
              </SummaryCard>

              <SummaryCard title="Key Discussion Points">
                <ul className="space-y-2 text-sm">
                  {summary.keyPoints.map((p, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>)}
                </ul>
              </SummaryCard>

              <SummaryCard title="Decisions Made">
                <ul className="space-y-2 text-sm">
                  {summary.decisions.map((p, i) => <li key={i} className="flex gap-2"><span className="text-success">✓</span>{p}</li>)}
                </ul>
              </SummaryCard>

              <SummaryCard title="Action Items">
                <ul className="space-y-2 text-sm">
                  {summary.actionItems.map((a, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-2">
                      <span>{a.task}</span>
                      <Badge variant="secondary">{a.owner}</Badge>
                    </li>
                  ))}
                </ul>
              </SummaryCard>

              <SummaryCard title="Follow-Up Tasks">
                <ul className="space-y-2 text-sm">
                  {summary.followUps.map((p, i) => <li key={i} className="flex gap-2"><span className="text-primary">→</span>{p}</li>)}
                </ul>
              </SummaryCard>

              <AiDisclaimer />
            </>
          )}
        </div>
      </main>
    </>
  );
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
