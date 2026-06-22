import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Productivity Suite" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggleTheme } = useApp();

  const clearAll = () => {
    localStorage.removeItem("aips-stats");
    localStorage.removeItem("aips-activity");
    toast.success("Activity & stats cleared. Refresh to see changes.");
  };

  return (
    <>
      <AppHeader title="Settings" />
      <main className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Dark mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Data</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Activity history</Label>
              <p className="text-xs text-muted-foreground">Stored locally in your browser.</p>
            </div>
            <Button variant="outline" onClick={clearAll}>Clear history</Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>AI Productivity Suite — emails, summaries, and plans powered by AI.</p>
            <p>AI-generated content may contain inaccuracies. Always review before acting.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
