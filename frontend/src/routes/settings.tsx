import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "./schedule";
import { EmptyState } from "@/components/app/EmptyState";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · FairGuard" }, { name: "description", content: "Configure your FairGuard workspace." }] }),
  component: () => (
    <AppShell>
      <PageHeader title="Settings" description="Configure teams, roles, integrations and AI behavior." />
      <EmptyState icon={SettingsIcon} title="Workspace settings" description="Manage teams, integrations, notification rules and AI model preferences." cta="Configure" />
    </AppShell>
  ),
});
