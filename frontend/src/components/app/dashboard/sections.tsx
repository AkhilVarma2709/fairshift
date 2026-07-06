import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Wand2,
  X,
  CheckCircle2,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FileText as FileIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee } from "@/lib/mock/data";
import { useDashboardData } from "@/lib/dashboard-context";
import { toast } from "sonner";

// ============================================================================
// Section wrapper
// ============================================================================
export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      <header className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

// ============================================================================
// Heatmap
// ============================================================================
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function qolColor(burden: number, shift: number) {
  // combine burden + shift type; night on high burden = red
  const score = burden * 0.7 + shift * 12;
  if (score < 45) return { bg: "bg-success/15", ring: "ring-success/30", txt: "text-success" };
  if (score < 65) return { bg: "bg-warning/15", ring: "ring-warning/30", txt: "text-warning" };
  if (score < 82)
    return {
      bg: "bg-[oklch(0.7_0.18_45)]/15",
      ring: "ring-[oklch(0.7_0.18_45)]/30",
      txt: "text-[oklch(0.55_0.2_45)]",
    };
  return { bg: "bg-danger/15", ring: "ring-danger/30", txt: "text-danger" };
}
const shiftLabel = ["Off", "M", "D", "N"];

export function QolHeatmap() {
  const { employees } = useDashboardData();
  const rows = employees.slice(0, 12);
  return (
    <Section
      title="Quality of Life Heatmap"
      description="Cell color combines burden score with shift type — click a cell to preview rebalance suggestions."
      actions={
        <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground">
          <LegendDot cls="bg-success" label="Healthy" />
          <LegendDot cls="bg-warning" label="Elevated" />
          <LegendDot cls="bg-[oklch(0.7_0.18_45)]" label="Strained" />
          <LegendDot cls="bg-danger" label="Critical" />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[220px_repeat(7,minmax(0,1fr))] gap-1.5 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="pl-1">Employee</div>
            {DAYS.map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {rows.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-[220px_repeat(7,minmax(0,1fr))] gap-1.5 items-center"
              >
                <div className="flex items-center gap-2.5 py-1 pr-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                      {e.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{e.name}</div>
                    <div className="text-[10.5px] text-muted-foreground truncate">
                      {e.role} · {e.team}
                    </div>
                  </div>
                </div>
                {e.shifts.map((s, d) => {
                  const c = qolColor(e.burden, s);
                  return (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={cn(
                        "h-9 rounded-md grid place-items-center text-[10.5px] font-semibold ring-1 ring-inset",
                        c.bg,
                        c.ring,
                        c.txt,
                      )}
                    >
                      {shiftLabel[s]}
                    </motion.button>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", cls)} /> {label}
    </div>
  );
}

// ============================================================================
// Fairness Slider + Morale Gauge (side by side)
// ============================================================================
export function FairnessAndMorale() {
  const { solverSummary, beforeAfter } = useDashboardData();
  const [val, setVal] = useState([Math.round(solverSummary.fairnessWeight)]);
  const span = val[0] - solverSummary.fairnessWeight;
  const fairness = Math.max(
    0,
    Math.min(100, Number((solverSummary.fairness + span * 0.12).toFixed(1))),
  );
  const morale = Math.max(0, Math.min(100, Number((solverSummary.morale + span * 0.1).toFixed(1))));
  const cost = Math.max(0, Number((solverSummary.cost - span * 40).toFixed(1)));
  const moraleLabel = morale >= 70 ? "Healthy" : morale >= 45 ? "Watchlist" : "Critical";

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
      <Section
        title="Fairness Optimizer"
        description="Move the slider to rebalance the objective. Metrics update live."
        actions={
          <Badge variant="secondary" className="font-medium">
            Live preview
          </Badge>
        }
      >
        <div className="flex items-baseline gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Objective
          </div>
          <div className="text-[13px] font-medium">
            {val[0]}% Fairness · {100 - val[0]}% Cost
          </div>
        </div>
        <div className="mt-6 px-1">
          <Slider value={val} onValueChange={setVal} min={0} max={100} step={1} />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground font-medium">
            <span>Cost Focus</span>
            <span>Fairness Focus</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <MetricTile
            label="Fairness"
            value={`${fairness}%`}
            accent="text-success"
            trend={`${(fairness - beforeAfter.before.fairness).toFixed(1)}pts`}
          />
          <MetricTile
            label="Team Morale"
            value={`${morale}%`}
            accent="text-primary"
            trend={`${(morale - beforeAfter.before.morale).toFixed(1)}pts`}
          />
          <MetricTile
            label="Weekly Cost"
            value={`$${(cost / 1000).toFixed(1)}K`}
            accent="text-foreground"
            trend={`${(((cost - beforeAfter.before.burden * 100) / Math.max(cost, 1)) * 100).toFixed(1)}%`}
            trendGood={cost <= solverSummary.cost}
          />
        </div>
      </Section>

      <Section title="Team Morale" description="Rolling 14-day composite index.">
        <MoraleGauge value={morale} label={moraleLabel} />
      </Section>
    </div>
  );
}
function MetricTile({
  label,
  value,
  accent,
  trend,
  trendGood = true,
}: {
  label: string;
  value: string;
  accent: string;
  trend: string;
  trendGood?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-[22px] font-semibold tracking-tight leading-none", accent)}>
        {value}
      </div>
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-0.5 text-[10.5px] font-semibold",
          trendGood ? "text-success" : "text-danger",
        )}
      >
        {trendGood ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {trend}
      </div>
    </div>
  );
}

function MoraleGauge({ value, label }: { value: number; label: string }) {
  const size = 200;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="grid place-items-center py-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            fill="none"
            className="stroke-muted"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * pct) / 100 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            stroke="url(#g1)"
          />
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.19 258)" />
              <stop offset="100%" stopColor="oklch(0.65 0.16 155)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Morale
            </div>
            <div className="text-4xl font-semibold tracking-tight tabular-nums">{pct}</div>
            <div
              className={cn(
                "text-[11px] font-medium mt-0.5",
                pct >= 70 ? "text-success" : pct >= 45 ? "text-warning" : "text-danger",
              )}
            >
              {label} · live backend score
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> Above target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50" /> Target 70%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Flight Risk Table + Modal
// ============================================================================
function riskLevel(score: number) {
  if (score >= 75) return { label: "Critical", cls: "bg-danger/10 text-danger border-danger/20" };
  if (score >= 55)
    return {
      label: "High",
      cls: "bg-[oklch(0.7_0.18_45)]/10 text-[oklch(0.55_0.2_45)] border-[oklch(0.7_0.18_45)]/25",
    };
  if (score >= 35)
    return { label: "Moderate", cls: "bg-warning/10 text-warning border-warning/25" };
  return { label: "Low", cls: "bg-success/10 text-success border-success/20" };
}

export function FlightRiskTable() {
  const { employees, flightRiskSummary } = useDashboardData();
  const [open, setOpen] = useState<Employee | null>(null);
  const rows = useMemo(
    () => [...employees].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8),
    [],
  );

  return (
    <>
      <Section
        title="Flight Risk Predictor"
        description="AI-projected attrition risk across your workforce. High risk rows are highlighted."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> {flightRiskSummary.flagged} flagged
          </Button>
        }
      >
        <div className="overflow-x-auto -mx-6 -mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left py-2.5 px-6 font-semibold">Employee</th>
                <th className="text-left py-2.5 font-semibold">Risk Score</th>
                <th className="text-left py-2.5 font-semibold">Level</th>
                <th className="text-left py-2.5 font-semibold w-32">Trend</th>
                <th className="text-left py-2.5 font-semibold">Recommendation</th>
                <th className="py-2.5 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const level = riskLevel(e.riskScore);
                const critical = e.riskScore >= 75;
                return (
                  <tr
                    key={e.id}
                    onClick={() => setOpen(e)}
                    className={cn(
                      "border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                      critical && "bg-danger/[0.03]",
                    )}
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-[11px] font-semibold">
                            {e.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[13px]">{e.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {e.role} · {e.team}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 w-40">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              e.riskScore >= 75
                                ? "bg-danger"
                                : e.riskScore >= 55
                                  ? "bg-[oklch(0.7_0.18_45)]"
                                  : e.riskScore >= 35
                                    ? "bg-warning"
                                    : "bg-success",
                            )}
                            style={{ width: `${e.riskScore}%` }}
                          />
                        </div>
                        <span className="text-[12.5px] font-semibold tabular-nums w-8">
                          {e.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold",
                          level.cls,
                        )}
                      >
                        {critical && <AlertTriangle className="h-3 w-3" />} {level.label}
                      </span>
                    </td>
                    <td className="py-3 w-32 pr-4">
                      <div className="h-8">
                        <ResponsiveContainer>
                          <LineChart data={e.riskTrend.map((v, i) => ({ i, v }))}>
                            <Line
                              dataKey="v"
                              stroke={critical ? "var(--color-danger)" : "var(--color-primary)"}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                    <td className="py-3 text-[12.5px] text-muted-foreground max-w-md">
                      <div className="truncate">{e.recommendation}</div>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white font-semibold">
                      {open.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-lg">{open.name}</DialogTitle>
                    <DialogDescription>
                      {open.role} · {open.team} · {open.id}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <MiniStat
                  label="Risk"
                  value={`${open.riskScore}`}
                  accent={riskLevel(open.riskScore).cls}
                />
                <MiniStat label="Burden" value={`${open.burden}`} />
                <MiniStat label="Morale" value={`${open.morale}`} />
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary-soft/50 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> FairGuard Recommendation
                </div>
                <p className="mt-2 text-sm leading-relaxed">{open.recommendation}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Projected risk reduction:{" "}
                  <span className="font-semibold text-foreground">
                    -{Math.round(open.riskScore * 0.35)}pts
                  </span>{" "}
                  within 2 cycles
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(null)}>
                  Dismiss
                </Button>
                <Button
                  className="gap-1.5"
                  onClick={() => {
                    toast.success(`Recommendation applied for ${open.name}`);
                    setOpen(null);
                  }}
                >
                  <Zap className="h-4 w-4" /> Apply Now
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
function MiniStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-xl font-semibold tracking-tight",
          accent && !accent.includes("bg-") && accent,
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================================
// Crisis Agent
// ============================================================================
export function CrisisAgent({ onApply }: { onApply: (v: number) => void }) {
  const { crisisAdvice } = useDashboardData();
  return (
    <section className="relative overflow-hidden rounded-2xl border border-danger/20 bg-gradient-to-br from-danger/[0.06] via-card to-warning/[0.05] p-6">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-danger/10 blur-3xl" />
      <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight">
                Crisis Agent detected an early-warning pattern
              </h3>
              <Badge className="bg-danger text-danger-foreground hover:bg-danger">
                Action required
              </Badge>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl">
              {crisisAdvice.impact} Rebalancing now avoids an estimated{" "}
              <span className="font-semibold text-foreground">
                ${(crisisAdvice.attritionCost / 1000).toFixed(0)}K
              </span>{" "}
              in attrition cost.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <CrisisStat
                label="Fairness Gap"
                value={`${crisisAdvice.fairnessGap}%`}
                trend="Live optimizer"
                bad
              />
              <CrisisStat
                label="Attrition Cost"
                value={`$${(crisisAdvice.attritionCost / 1000).toFixed(0)}K`}
                trend="60-day proj."
                bad
              />
              <CrisisStat label="Business Impact" value="High" trend="ICU-3, ER-N" bad />
              <CrisisStat
                label="Recommended Slider"
                value={`${crisisAdvice.recommendedSlider}%`}
                trend={`Confidence ${(crisisAdvice.confidence * 100).toFixed(0)}%`}
              />
            </div>
          </div>
        </div>
        <Button
          size="lg"
          className="h-11 gap-2 shadow-sm"
          onClick={() => onApply(crisisAdvice.recommendedSlider)}
        >
          <Wand2 className="h-4 w-4" /> Apply Recommendation
        </Button>
      </div>
    </section>
  );
}
function CrisisStat({
  label,
  value,
  trend,
  bad = false,
}: {
  label: string;
  value: string;
  trend: string;
  bad?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/70 backdrop-blur p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tracking-tight">{value}</div>
      <div className={cn("text-[10.5px] font-medium mt-0.5", bad ? "text-danger" : "text-primary")}>
        {trend}
      </div>
    </div>
  );
}

// ============================================================================
// Natural Language Constraint Box
// ============================================================================
export function ConstraintBox() {
  const { constraints, addConstraint, removeConstraint } = useDashboardData();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addConstraint(text);
      setText("");
      toast.success("Constraint parsed and added");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section
      title="Natural Language Constraints"
      description="Describe scheduling rules in plain English — FairGuard parses them into hard rules or soft preferences."
    >
      <div className="rounded-xl border border-border bg-background p-3 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/8 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder="Charlie cannot work nights because he is burnt out."
          className="w-full min-h-[76px] bg-transparent outline-none resize-none text-sm placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Powered by FairGuard NL Reasoner
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden md:inline-flex items-center h-5 px-1.5 rounded border border-border bg-card text-[10px] font-medium text-muted-foreground">
              ⌘ ↵
            </kbd>
            <Button
              size="sm"
              onClick={submit}
              disabled={loading || !text.trim()}
              className="gap-1.5"
            >
              {loading ? (
                "Parsing…"
              ) : (
                <>
                  Apply <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Active constraints ({constraints.length})
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {constraints.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]",
                  c.type === "hard"
                    ? "border-primary/25 bg-primary-soft text-primary"
                    : "border-border bg-muted text-foreground/80",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    c.type === "hard" ? "bg-primary" : "bg-muted-foreground",
                  )}
                />
                <span className="font-medium">{c.type === "hard" ? "Rule" : "Pref"}</span>
                <span className="opacity-80">{c.text}</span>
                <button
                  onClick={() => removeConstraint(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

// ============================================================================
// Schedule Table (search, sort, paginate)
// ============================================================================
type SortKey = "name" | "hours" | "cost" | "burden";
export function ScheduleTable() {
  const { employees } = useDashboardData();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "burden",
    dir: "desc",
  });
  const [page, setPage] = useState(0);
  const per = 8;

  const filtered = useMemo(() => {
    let r = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q.toLowerCase()) ||
        e.role.toLowerCase().includes(q.toLowerCase()),
    );
    r = [...r].sort((a, b) => {
      const va = a[sort.key] as any;
      const vb = b[sort.key] as any;
      const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [q, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / per));
  const view = filtered.slice(page * per, page * per + per);

  const toggle = (k: SortKey) =>
    setSort((s) =>
      s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "desc" },
    );

  return (
    <Section
      title="Schedule"
      description="Assigned shifts, hours, and workload cost for the current cycle."
      actions={
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search employees…"
            className="h-8 pl-8 w-56 text-[12.5px] bg-background"
          />
        </div>
      }
    >
      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <Th onClick={() => toggle("name")} sort={sort} k="name" className="px-6 text-left">
                Employee
              </Th>
              <Th className="text-left">Assigned Shifts</Th>
              <Th onClick={() => toggle("hours")} sort={sort} k="hours" className="text-left">
                Hours
              </Th>
              <Th onClick={() => toggle("cost")} sort={sort} k="cost" className="text-left">
                Cost
              </Th>
              <Th
                onClick={() => toggle("burden")}
                sort={sort}
                k="burden"
                className="text-left pr-6"
              >
                Burden
              </Th>
            </tr>
          </thead>
          <tbody>
            {view.map((e) => (
              <tr
                key={e.id}
                className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
              >
                <td className="py-3 px-6">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-muted text-[10.5px] font-semibold">
                        {e.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-[13px]">{e.name}</div>
                      <div className="text-[11px] text-muted-foreground">{e.role}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex gap-0.5">
                    {e.shifts.map((s, i) => (
                      <div
                        key={i}
                        title={DAYS[i]}
                        className={cn(
                          "h-5 w-5 rounded grid place-items-center text-[9px] font-semibold",
                          s === 0 && "bg-muted text-muted-foreground",
                          s === 1 && "bg-primary-soft text-primary",
                          s === 2 && "bg-success/15 text-success",
                          s === 3 && "bg-warning/15 text-warning",
                        )}
                      >
                        {shiftLabel[s]}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-3 text-[13px] tabular-nums">{e.hours}h</td>
                <td className="py-3 text-[13px] tabular-nums">${e.cost.toLocaleString()}</td>
                <td className="py-3 pr-6">
                  <div className="flex items-center gap-2 w-32">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          e.burden > 75 ? "bg-danger" : e.burden > 55 ? "bg-warning" : "bg-success",
                        )}
                        style={{ width: `${e.burden}%` }}
                      />
                    </div>
                    <span className="text-[11.5px] font-semibold tabular-nums w-7">{e.burden}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
        <div>
          Showing {view.length} of {filtered.length}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2 tabular-nums">
            {page + 1} / {pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Section>
  );
}
function Th({
  children,
  className,
  onClick,
  sort,
  k,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  sort?: any;
  k?: SortKey;
}) {
  const active = sort?.key === k;
  return (
    <th
      className={cn(
        "py-2.5 font-semibold select-none",
        onClick && "cursor-pointer hover:text-foreground",
        className,
      )}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {onClick &&
          (active ? (
            sort.dir === "asc" ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )
          ) : (
            <ChevronDown className="h-3 w-3 opacity-30" />
          ))}
      </span>
    </th>
  );
}

// ============================================================================
// Before / After comparison
// ============================================================================
export function BeforeAfter() {
  const { burdenTrend, beforeAfter } = useDashboardData();
  const [mode, setMode] = useState<"before" | "after">("after");
  const data = burdenTrend.map((d, i) => ({
    ...d,
    burden:
      mode === "before"
        ? d.burden
        : Math.max(0, d.burden - (beforeAfter.before.burden - beforeAfter.after.burden)),
    fairness:
      mode === "before"
        ? Math.max(0, d.fairness - (beforeAfter.after.fairness - beforeAfter.before.fairness))
        : d.fairness,
    morale:
      mode === "before"
        ? Math.max(0, d.morale - (beforeAfter.after.morale - beforeAfter.before.morale))
        : d.morale,
  }));

  return (
    <Section
      title="Before vs After"
      description="How AI-optimized schedules change your key operating metrics."
      actions={
        <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
          {(["before", "after"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 h-7 rounded-md text-[12px] font-medium capitalize transition-all",
                mode === m
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-3 mb-4">
        <ComparisonTile
          label="Burden"
          value={`${mode === "after" ? beforeAfter.after.burden : beforeAfter.before.burden}%`}
          delta={`${(beforeAfter.after.burden - beforeAfter.before.burden).toFixed(1)}pts`}
          good={beforeAfter.after.burden <= beforeAfter.before.burden}
        />
        <ComparisonTile
          label="Fairness"
          value={`${mode === "after" ? beforeAfter.after.fairness : beforeAfter.before.fairness}%`}
          delta={`${(beforeAfter.after.fairness - beforeAfter.before.fairness).toFixed(1)}pts`}
          good={beforeAfter.after.fairness >= beforeAfter.before.fairness}
        />
        <ComparisonTile
          label="Morale"
          value={`${mode === "after" ? beforeAfter.after.morale : beforeAfter.before.morale}%`}
          delta={`${(beforeAfter.after.morale - beforeAfter.before.morale).toFixed(1)}pts`}
          good={beforeAfter.after.morale >= beforeAfter.before.morale}
        />
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="fairness"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#ga)"
            />
            <Area
              type="monotone"
              dataKey="morale"
              stroke="var(--color-success)"
              strokeWidth={2}
              fill="url(#gb)"
            />
            <Area
              type="monotone"
              dataKey="burden"
              stroke="var(--color-warning)"
              strokeWidth={2}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}
function ComparisonTile({
  label,
  value,
  delta,
  good,
}: {
  label: string;
  value: string;
  delta: string;
  good: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className={cn("text-[11px] font-semibold", good ? "text-success" : "text-danger")}>
          {delta}
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 8px 24px -12px oklch(0.2 0.04 265 / 0.2)",
} as const;

// ============================================================================
// Analytics grid
// ============================================================================
export function AnalyticsGrid() {
  const { burdenTrend, shiftDistribution, costDistribution, riskDistribution, fairnessTrend } =
    useDashboardData();
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Section title="Weekly Burden Trend" description="12-week rolling average across all teams.">
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={burdenTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line dataKey="burden" stroke="var(--color-primary)" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Shift Distribution" description="Weekly assignment mix.">
        <div className="h-56 grid grid-cols-[1fr_1fr] items-center">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={shiftDistribution}
                dataKey="value"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
              >
                {shiftDistribution.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 pr-2">
            {shiftDistribution.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[12.5px]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className="font-medium">{s.name}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Cost Distribution" description="Regular vs overtime spend by day.">
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={costDistribution} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="regular"
                stackId="a"
                fill="var(--color-primary)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="overtime"
                stackId="a"
                fill="var(--color-warning)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Risk Distribution" description="Workforce segmented by flight-risk band.">
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart
              data={riskDistribution}
              layout="vertical"
              margin={{ top: 8, right: 20, bottom: 0, left: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="level"
                type="category"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {riskDistribution.map((r, i) => (
                  <Cell key={i} fill={r.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section
        title="Fairness Trend"
        description="Before vs after AI optimization across 10 cycles."
        className="lg:col-span-2"
      >
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={fairnessTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="gf1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="cycle"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="after"
                stroke="var(--color-success)"
                strokeWidth={2.2}
                fill="url(#gf1)"
              />
              <Line
                type="monotone"
                dataKey="before"
                stroke="var(--color-muted-foreground)"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// AI Activity timeline
// ============================================================================
const activityIcon: Record<string, any> = {
  optimize: Sparkles,
  constraint: Wand2,
  risk: AlertTriangle,
  crisis: AlertTriangle,
  apply: CheckCircle2,
};
const activityTint: Record<string, string> = {
  optimize: "bg-primary-soft text-primary",
  constraint: "bg-accent text-accent-foreground",
  risk: "bg-warning/15 text-warning",
  crisis: "bg-danger/10 text-danger",
  apply: "bg-success/15 text-success",
};

export function ActivityTimeline() {
  const { aiActivity } = useDashboardData();
  return (
    <Section title="Recent AI Activity" description="Everything FairGuard has done for you today.">
      <ol className="relative space-y-4">
        <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        {aiActivity.map((a, i) => {
          const Icon = activityIcon[a.type];
          return (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative flex gap-4"
            >
              <div
                className={cn(
                  "relative z-10 h-8 w-8 rounded-full grid place-items-center ring-4 ring-card",
                  activityTint[a.type],
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <div className="text-[13.5px] font-semibold">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">· {a.time}</div>
                </div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Section>
  );
}

// ============================================================================
// CSV Upload dialog
// ============================================================================

export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { employees, upload } = useDashboardData();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);

  const start = async (f: File) => {
    setFile(f);
    setProgress(0);
    setDone(false);
    const result = await upload(f, setProgress);
    setDone(true);
    toast.success(`Uploaded ${f.name} · ${result.rows} rows imported`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setFile(null);
          setProgress(0);
          setDone(false);
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload workforce CSV</DialogTitle>
          <DialogDescription>
            Import employees, shifts, and availability. FairGuard will validate and normalize
            columns.
          </DialogDescription>
        </DialogHeader>
        {!file ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) start(f);
            }}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors",
              dragging
                ? "border-primary bg-primary-soft"
                : "border-border hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Drop your CSV here or click to browse</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">
                Up to 50MB · UTF-8 encoded
              </div>
            </div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) start(f);
              }}
            />
          </label>
        ) : (
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <FileIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              {done && <CheckCircle2 className="h-5 w-5 text-success" />}
            </div>
            <div className="mt-4">
              <Progress value={progress} />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>
                  {done
                    ? `Import complete · ${employees.length} employees`
                    : "Uploading and validating…"}
                </span>
                <span className="tabular-nums">{progress}%</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
