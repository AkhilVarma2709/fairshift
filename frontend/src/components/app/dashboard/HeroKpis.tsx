import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  Users,
  Gauge,
  Scale,
  Smile,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/lib/dashboard-context";

const iconMap: Record<string, any> = {
  employees: Users,
  burden: Gauge,
  fairness: Scale,
  morale: Smile,
  cost: DollarSign,
  risk: AlertTriangle,
};

export function Hero({ onOptimize, onUpload }: { onOptimize: () => void; onUpload: () => void }) {
  const { employees, solverSummary } = useDashboardData();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,oklch(0.55_0.19_258/0.10),transparent_60%),radial-gradient(ellipse_60%_50%_at_100%_100%,oklch(0.65_0.16_155/0.08),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,oklch(0.92_0.008_265)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.008_265)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <div className="relative px-6 md:px-10 py-10 md:py-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" /> FairGuard AI · Cycle {solverSummary.cycle} solved
          </div>
          <h1 className="mt-4 text-3xl md:text-[38px] font-semibold tracking-tight leading-[1.1]">
            Optimize schedules while <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">
              protecting employee wellbeing.
            </span>
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground max-w-xl">
            FairGuard uses AI to balance fairness, cost and burnout across your workforce — with
            real-time flight-risk prediction and constraint reasoning built in.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onOptimize} className="shadow-sm h-11 px-5 gap-2">
              <Sparkles className="h-4 w-4" /> Run Optimization
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onUpload}
              className="h-11 px-5 gap-2 bg-card"
            >
              <Upload className="h-4 w-4" /> Upload CSV
            </Button>
            <div className="hidden md:flex items-center gap-2 pl-2 text-xs text-muted-foreground">
              <div className="flex -space-x-1.5">
                {employees.slice(0, 3).map((employee) => (
                  <div
                    key={employee.id}
                    className="h-6 w-6 rounded-full ring-2 ring-card bg-gradient-to-br from-primary to-chart-5 grid place-items-center text-[9.5px] font-semibold text-white"
                  >
                    {employee.avatar}
                  </div>
                ))}
              </div>
              <span>{employees.length} employees synced · live backend data</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <MiniInsightCard />
        </div>
      </div>
    </section>
  );
}

function MiniInsightCard() {
  const { solverSummary } = useDashboardData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border border-border bg-card/80 backdrop-blur p-5 shadow-[0_20px_60px_-20px_oklch(0.2_0.04_265/0.15)]"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">Live optimization</div>
        <div className="flex items-center gap-1 text-[10.5px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Solved
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          {
            label: "Fairness",
            value: `${solverSummary.fairness.toFixed(1)}%`,
            accent: "text-success",
          },
          {
            label: "Cost",
            value: `$${(solverSummary.cost / 1000).toFixed(1)}K`,
            accent: "text-primary",
          },
          { label: "Morale", value: `${solverSummary.morale.toFixed(1)}%`, accent: "text-success" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-background/60 p-2.5">
            <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div className={cn("mt-0.5 text-lg font-semibold tracking-tight", s.accent)}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-16">
        <ResponsiveContainer>
          <LineChart
            data={[12, 14, 13, 17, 16, 20, 22, 26, 24, 28, 30, 34].map((v, i) => ({ i, v }))}
          >
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        Convergence · {(solverSummary.tookMs / 1000).toFixed(2)}s to optimal
      </div>
    </motion.div>
  );
}

export function KpiGrid() {
  const { kpis } = useDashboardData();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((k, idx) => {
        const Icon = iconMap[k.key];
        const positive = k.trend >= 0;
        // For cost/burden/risk/fairness gap, a decrease is good
        const goodOnDown = ["cost", "burden", "fairness", "risk"].includes(k.key);
        const good = goodOnDown ? !positive : positive;
        const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;
        return (
          <motion.div
            key={k.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="group relative rounded-xl border border-border bg-card p-4 hover:shadow-[0_8px_24px_-12px_oklch(0.2_0.04_265/0.15)] hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                  good ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(k.trend)}%
              </div>
            </div>
            <div className="mt-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {k.label}
            </div>
            <div className="mt-0.5 text-[22px] font-semibold tracking-tight leading-none">
              {k.value}
              {k.unit ?? ""}
            </div>
            <div className="mt-3 h-8 -mx-1">
              <ResponsiveContainer>
                <LineChart data={k.spark.map((v, i) => ({ i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={good ? "var(--color-success)" : "var(--color-primary)"}
                    strokeWidth={1.75}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
