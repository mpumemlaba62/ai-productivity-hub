import { Info } from "lucide-react";

export function AiDisclaimer() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        AI-generated content may contain inaccuracies. Users should review and verify all
        generated emails, summaries, schedules, and recommendations before taking action. AI is
        intended to assist, not replace, human judgment.
      </p>
    </div>
  );
}
