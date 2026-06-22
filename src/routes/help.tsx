import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help — AI Productivity Suite" }] }),
  component: HelpPage,
});

const faqs = [
  { q: "How does the Email Generator work?", a: "Pick a type and tone, describe what you want to convey, and the AI drafts a complete editable email." },
  { q: "Is my data stored anywhere?", a: "Your activity history is stored locally in your browser. No content is persisted server-side." },
  { q: "Can AI make mistakes?", a: "Yes. AI output may contain inaccuracies. Always review before sending or acting on it." },
];

function HelpPage() {
  return (
    <>
      <AppHeader title="Help" />
      <main className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
        {faqs.map((f) => (
          <Card key={f.q} className="shadow-soft">
            <CardHeader className="pb-2"><CardTitle className="text-base">{f.q}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{f.a}</CardContent>
          </Card>
        ))}
      </main>
    </>
  );
}
