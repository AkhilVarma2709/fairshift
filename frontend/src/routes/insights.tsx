import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { ConstraintBox, ActivityTimeline } from "@/components/app/dashboard/sections";
import { PageHeader } from "./schedule";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "AI Insights · FairGuard" }, { name: "description", content: "Natural-language constraints and AI activity." }] }),
  component: () => (
    <AppShell>
      <PageHeader title="AI Insights" description="Natural-language constraints and recent FairGuard reasoning." />
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        <ConstraintBox />
        <ActivityTimeline />
      </div>
    </AppShell>
  ),
});
