import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, RefreshCw, Mail, Loader2 } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { generateEmail } from "@/lib/ai.functions";
import { useApp } from "@/context/app-context";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Productivity Suite" },
      { name: "description", content: "Generate professional emails with AI in any tone." },
    ],
  }),
  component: EmailPage,
});

const TYPES = ["Professional", "Follow-up", "Complaint", "Inquiry", "Marketing", "Thank You"];
const TONES = ["Professional", "Friendly", "Formal", "Persuasive", "Casual"];

function EmailPage() {
  const { logActivity } = useApp();
  const fn = useServerFn(generateEmail);
  const [form, setForm] = useState({
    emailType: "Professional",
    tone: "Professional",
    recipient: "",
    subject: "",
    purpose: "",
  });
  const [output, setOutput] = useState("");

  const mutation = useMutation({
    mutationFn: (data: typeof form) => fn({ data }),
    onSuccess: (res) => {
      setOutput(res.email);
      logActivity({ type: "email", title: form.subject || "Untitled email" });
      toast.success("Email generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient.trim() || !form.subject.trim() || !form.purpose.trim()) {
      toast.error("Please fill in recipient, subject, and purpose.");
      return;
    }
    mutation.mutate(form);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <AppHeader title="Smart Email Generator" />
      <main className="mx-auto grid w-full max-w-7xl gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" /> Compose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email Type</Label>
                  <Select value={form.emailType} onValueChange={(v) => setForm({ ...form, emailType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Name</Label>
                <Input id="recipient" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="e.g. Sarah Johnson" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this email about?" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose / Instructions</Label>
                <Textarea id="purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Describe the key points you want to convey..." rows={6} maxLength={2000} />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Email"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Generated Email</CardTitle>
            {output && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copy}><Copy className="mr-1 h-3.5 w-3.5" /> Copy</Button>
                <Button size="sm" variant="outline" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Regenerate
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {mutation.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : output ? (
              <>
                <Textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  className="min-h-[320px] font-[450]"
                />
                <AiDisclaimer />
              </>
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Fill in the form and your AI-generated email will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
