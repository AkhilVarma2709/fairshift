import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "./schedule";
import { EmptyState } from "@/components/app/EmptyState";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · FairGuard" }, { name: "description", content: "Exportable compliance and workforce reports." }] }),
  component: () => (
    <AppShell>
      <PageHeader title="Reports" description="Generate exportable compliance, fairness and cost reports." />
      <EmptyState icon={FileText} title="No reports yet" description="Generate your first report from any dashboard view. Reports export as PDF or CSV." cta="Generate report" />
    </AppShell>
  ),
});
