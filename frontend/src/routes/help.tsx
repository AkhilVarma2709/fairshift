import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "./schedule";
import { EmptyState } from "@/components/app/EmptyState";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help · FairGuard" }, { name: "description", content: "Docs, guides and enterprise support." }] }),
  component: () => (
    <AppShell>
      <PageHeader title="Help & Support" description="Docs, product tours and 24/7 enterprise support." />
      <EmptyState icon={LifeBuoy} title="How can we help?" description="Browse guides or reach a specialist. Enterprise plans include 24/7 named support." cta="Contact support" />
    </AppShell>
  ),
});
