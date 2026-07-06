import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { FlightRiskTable, CrisisAgent } from "@/components/app/dashboard/sections";
import { PageHeader } from "./schedule";
import { toast } from "sonner";
import { useDashboardData } from "@/lib/dashboard-context";

export const Route = createFileRoute("/flight-risk")({
  head: () => ({
    meta: [
      { title: "Flight Risk · FairGuard" },
      { name: "description", content: "Predict and prevent employee attrition." },
    ],
  }),
  component: FlightRiskPage,
});

function FlightRiskPage() {
  const { optimize } = useDashboardData();

  return (
    <AppShell>
      <PageHeader
        title="Flight Risk"
        description="AI-predicted attrition risk with recommended interventions."
      />
      <div className="space-y-6">
        <CrisisAgent
          onApply={async (value) => {
            const t = toast.loading("Applying recommendation…");
            try {
              const result = await optimize(value);
              toast.success(`Recommendation applied · fairness ${result.fairness.toFixed(1)}%`, {
                id: t,
              });
            } catch {
              toast.error("Recommendation failed", { id: t });
            }
          }}
        />
        <FlightRiskTable />
      </div>
    </AppShell>
  );
}
