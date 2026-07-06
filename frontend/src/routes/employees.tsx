import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { ScheduleTable } from "@/components/app/dashboard/sections";
import { PageHeader } from "./schedule";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees · FairGuard" }, { name: "description", content: "Manage your workforce roster and workload." }] }),
  component: () => (
    <AppShell>
      <PageHeader title="Employees" description="Your workforce roster with real-time workload signals." />
      <ScheduleTable />
    </AppShell>
  ),
});
