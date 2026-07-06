import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { ScheduleTable, BeforeAfter, FairnessAndMorale } from "@/components/app/dashboard/sections";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule Optimizer · FairGuard" }, { name: "description", content: "AI-powered schedule optimization." }] }),
  component: () => (
    <AppShell>
      <PageHeader title="Schedule Optimizer" description="Balance fairness, cost and burnout across every cycle." />
      <div className="space-y-6">
        <FairnessAndMorale />
        <ScheduleTable />
        <BeforeAfter />
      </div>
    </AppShell>
  ),
});

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">{description}</p>
    </div>
  );
}
