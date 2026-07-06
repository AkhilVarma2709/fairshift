import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { AnalyticsGrid } from "@/components/app/dashboard/sections";
import { KpiGrid } from "@/components/app/dashboard/HeroKpis";
import { PageHeader } from "./schedule";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · FairGuard" }, { name: "description", content: "Trends across burden, morale, cost and risk." }] }),
  component: () => (
    <AppShell>
      <PageHeader title="Analytics" description="Deep-dive metrics across your workforce and operations." />
      <div className="space-y-6">
        <KpiGrid />
        <AnalyticsGrid />
      </div>
    </AppShell>
  ),
});
