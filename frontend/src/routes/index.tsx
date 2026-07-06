import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, Upload } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/lib/dashboard-context";
import type { Employee } from "@/lib/mock/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FairGuard" },
      {
        name: "description",
        content:
          "Upload CSV files, compare fairness before and after optimization, and view next week's schedule.",
      },
    ],
  }),
  component: HomePage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFT_LABELS = ["Off", "Morning", "Day", "Night"];

function HomePage() {
  const {
    analysisSummary,
    baselineEmployees,
    beforeAfter,
    employees,
    hasOptimized,
    loading,
    meta,
    optimize,
    optimizing,
    refresh,
    solverSummary,
    upload,
  } = useDashboardData();
  const [employeesFile, setEmployeesFile] = useState<File | null>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fairnessWeight, setFairnessWeight] = useState([65]);
  const [minWorkDays, setMinWorkDays] = useState([2]);
  const [maxWorkDays, setMaxWorkDays] = useState([5]);

  const currentRiskCount = useMemo(
    () => employees.filter((employee) => employee.riskScore >= 55).length,
    [employees],
  );
  const currentCriticalCount = useMemo(
    () => employees.filter((employee) => employee.riskScore >= 75).length,
    [employees],
  );
  const baselineMap = useMemo(
    () => new Map(baselineEmployees.map((employee) => [employee.id, employee])),
    [baselineEmployees],
  );
  const dataPreview = useMemo(() => baselineEmployees.slice(0, 10), [baselineEmployees]);
  const scheduleRows = useMemo(
    () => (hasOptimized ? employees : baselineEmployees).slice(0, 12),
    [baselineEmployees, employees, hasOptimized],
  );

  const uploadDataset = async () => {
    if (!employeesFile && !historyFile) {
      toast.error("Choose at least one CSV file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await upload({ employeesFile, historyFile }, setUploadProgress);
      const imported = [
        result.rows.employees ? `${result.rows.employees} employee rows` : null,
        result.rows.shiftHistory ? `${result.rows.shiftHistory} shift rows` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      toast.success(imported || "Dataset uploaded");
      setEmployeesFile(null);
      setHistoryFile(null);
      setUploadProgress(100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const runOptimization = async () => {
    const notice = toast.loading("Creating next week's schedule...");
    try {
      const result = await optimize(fairnessWeight[0], minWorkDays[0], maxWorkDays[0]);
      toast.success(`Schedule ready in ${(result.tookMs / 1000).toFixed(2)}s`, {
        id: notice,
        description: `Fairness ${result.fairness}% · Morale ${result.morale}% · ${minWorkDays[0]}-${maxWorkDays[0]} days`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Optimization failed", {
        id: notice,
      });
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[1.75rem] border border-border/80 bg-card/90 p-6 shadow-[var(--shadow-elevated)] md:p-8">
          <Badge className="rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-primary">
            One page workflow
          </Badge>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Upload the files, compare fairness before and after, then view next week&apos;s
            schedule.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            This page keeps only the essentials. Upload `employees.csv` and `shift_history.csv`,
            review the loaded data, run the optimizer, and see the updated schedule below.
          </p>
        </section>

        <Section
          title="1. Upload Files"
          description="Upload one or both CSV files. The uploaded files become the active dataset for the page."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FileField
              id="employeesFile"
              label="Employees CSV"
              file={employeesFile}
              onChange={setEmployeesFile}
            />
            <FileField
              id="historyFile"
              label="Shift History CSV"
              file={historyFile}
              onChange={setHistoryFile}
            />
          </div>
          <div className="mt-4 rounded-[1.25rem] border border-dashed border-border bg-background/80 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium">Current dataset</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {shortPath(meta.employeesCsv)} · {shortPath(meta.shiftHistoryCsv)} · Week{" "}
                  {meta.cycle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => void refresh(fairnessWeight[0], minWorkDays[0], maxWorkDays[0])}
                  disabled={loading || uploading}
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  className="rounded-full px-5"
                  onClick={() => void uploadDataset()}
                  disabled={uploading || (!employeesFile && !historyFile)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={uploadProgress} />
            </div>
          </div>
        </Section>

        <Section
          title="2. Uploaded Data"
          description="A preview of the employees loaded from the uploaded files."
        >
          <PreviewTable employees={dataPreview} />
        </Section>

        <Section
          title="3. Run Fairness Optimization"
          description="Choose fairness weight plus minimum and maximum working days, then generate next week's schedule."
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-border bg-background/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Fairness weight</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Higher weight focuses more on reducing overload and stress.
                    </p>
                  </div>
                  <div className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                    {fairnessWeight[0]}%
                  </div>
                </div>
                <div className="mt-5 px-1">
                  <Slider
                    value={fairnessWeight}
                    onValueChange={setFairnessWeight}
                    min={30}
                    max={90}
                    step={1}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>Lower fairness focus</span>
                  <span>Higher fairness focus</span>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-border bg-background/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Minimum working days</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Guarantee at least this many working days for each employee in the generated week.
                    </p>
                  </div>
                  <div className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                    {minWorkDays[0]} days
                  </div>
                </div>
                <div className="mt-5 px-1">
                  <Slider
                    value={minWorkDays}
                    onValueChange={(value) => {
                      const nextMin = value[0];
                      setMinWorkDays([nextMin]);
                      if (nextMin > maxWorkDays[0]) {
                        setMaxWorkDays([nextMin]);
                      }
                    }}
                    min={0}
                    max={5}
                    step={1}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>0 days</span>
                  <span>5 days</span>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-border bg-background/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Maximum working days</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Prevent any employee from being scheduled beyond this many days in the week.
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-foreground">
                    {maxWorkDays[0]} days
                  </div>
                </div>
                <div className="mt-5 px-1">
                  <Slider
                    value={maxWorkDays}
                    onValueChange={(value) => {
                      const nextMax = value[0];
                      setMaxWorkDays([nextMax]);
                      if (nextMax < minWorkDays[0]) {
                        setMinWorkDays([nextMax]);
                      }
                    }}
                    min={2}
                    max={7}
                    step={1}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>2 days</span>
                  <span>7 days</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                className="h-12 w-full rounded-full text-base"
                onClick={() => void runOptimization()}
                disabled={optimizing || loading}
              >
                {optimizing ? "Generating..." : "Generate Next Week's Schedule"}
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="4. Before vs After"
          description="The comparison below shows the situation before optimization, after optimization, and the difference."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CompareCard
              label="Fairness"
              before={beforeAfter.before.fairness}
              after={beforeAfter.after.fairness}
              betterWhen="higher"
              unit="%"
            />
            <CompareCard
              label="Average Burden"
              before={beforeAfter.before.burden}
              after={beforeAfter.after.burden}
              betterWhen="lower"
              unit="%"
            />
            <CompareCard
              label="Morale"
              before={beforeAfter.before.morale}
              after={beforeAfter.after.morale}
              betterWhen="higher"
              unit="%"
            />
            <CompareCard
              label="At-Risk Employees"
              before={analysisSummary.flagged}
              after={currentRiskCount}
              betterWhen="lower"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SmallCompare
              label="Critical Risk"
              before={analysisSummary.critical}
              after={currentCriticalCount}
              betterWhen="lower"
            />
            <SmallCompare
              label="Fairness Gap"
              before={analysisSummary.fairnessGap}
              after={Math.max(0, 100 - beforeAfter.after.fairness)}
              betterWhen="lower"
              unit="%"
            />
          </div>
        </Section>

        <Section
          title="5. Next Week's Schedule"
          description={
            hasOptimized
              ? `This is the optimized next-week schedule for cycle ${solverSummary.cycle}.`
              : "Upload the files and run the optimizer to generate the next week's schedule."
          }
        >
          <ScheduleTable
            employees={scheduleRows}
            baselineMap={baselineMap}
            showDelta={hasOptimized}
          />
          {hasOptimized ? (
            <div className="mt-4 flex items-center gap-2 rounded-[1rem] border border-success/25 bg-success/8 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Updated schedule generated with fairness weight {solverSummary.fairnessWeight}% and working-day range {solverSummary.minWorkDays ?? minWorkDays[0]} to {solverSummary.maxWorkDays ?? maxWorkDays[0]}.
            </div>
          ) : null}
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-border/80 bg-card/90 p-5 shadow-[var(--shadow-soft)] md:p-6">
      <div className="mb-5">
        <h2 className="font-display text-2xl leading-tight">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FileField({
  id,
  label,
  file,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label htmlFor={id} className="block rounded-[1.25rem] border border-border bg-background/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">CSV only.</p>
        </div>
        {file ? (
          <Badge variant="secondary" className="rounded-full">
            {file.name}
          </Badge>
        ) : null}
      </div>
      <Input
        id={id}
        type="file"
        accept=".csv"
        className="mt-4 rounded-xl bg-card"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function PreviewTable({ employees }: { employees: Employee[] }) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-secondary/70 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Team</th>
              <th className="px-4 py-3 font-medium">Burden</th>
              <th className="px-4 py-3 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t border-border bg-card/80">
                <td className="px-4 py-3 font-medium">{employee.name}</td>
                <td className="px-4 py-3">{employee.role}</td>
                <td className="px-4 py-3">{employee.team}</td>
                <td className="px-4 py-3">{employee.burden}%</td>
                <td className="px-4 py-3">{employee.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareCard({
  label,
  before,
  after,
  betterWhen,
  unit = "",
}: {
  label: string;
  before: number;
  after: number;
  betterWhen: "higher" | "lower";
  unit?: string;
}) {
  const diff = after - before;
  const improved = betterWhen === "higher" ? diff >= 0 : diff <= 0;

  return (
    <div
      className={cn(
        "rounded-[1.25rem] border p-4",
        improved ? "border-success/30 bg-success/8" : "border-warning/30 bg-warning/10",
      )}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <MetricBlock label="Before" value={`${formatNumber(before)}${unit}`} />
        <MetricBlock label="After" value={`${formatNumber(after)}${unit}`} />
        <MetricBlock
          label="Difference"
          value={`${diff > 0 ? "+" : ""}${formatNumber(diff)}${unit}`}
          accent={improved ? "text-success" : "text-warning"}
        />
      </div>
    </div>
  );
}

function SmallCompare({
  label,
  before,
  after,
  betterWhen,
  unit = "",
}: {
  label: string;
  before: number;
  after: number;
  betterWhen: "higher" | "lower";
  unit?: string;
}) {
  const diff = after - before;
  const improved = betterWhen === "higher" ? diff >= 0 : diff <= 0;

  return (
    <div className="rounded-[1.25rem] border border-border bg-background/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Before {formatNumber(before)}
            {unit} · After {formatNumber(after)}
            {unit}
          </p>
        </div>
        <div className={cn("text-sm font-semibold", improved ? "text-success" : "text-warning")}>
          {diff > 0 ? "+" : ""}
          {formatNumber(diff)}
          {unit}
        </div>
      </div>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold text-foreground", accent)}>{value}</p>
    </div>
  );
}

function ScheduleTable({
  baselineMap,
  employees,
  showDelta,
}: {
  baselineMap: Map<string, Employee>;
  employees: Employee[];
  showDelta: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-secondary/70 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Before / After</th>
              <th className="px-4 py-3 font-medium">Next Week</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const baseline = baselineMap.get(employee.id);
              return (
                <tr key={employee.id} className="border-t border-border bg-card/80 align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{employee.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {employee.role} · {employee.team}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium">
                      {baseline?.burden ?? employee.burden}% burden {"->"} {employee.burden}% burden
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {baseline?.riskScore ?? employee.riskScore} risk {"->"} {employee.riskScore} risk
                    </p>
                    {showDelta && baseline ? (
                      <p className="mt-1 text-xs text-success">
                        {(baseline.burden - employee.burden).toFixed(1)} burden points lower
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {employee.shifts.map((shift, index) => (
                        <div
                          key={`${employee.id}-${DAYS[index]}`}
                          className={cn(
                            "min-w-20 rounded-xl px-3 py-2 text-center text-xs font-medium",
                            shift === 0 && "bg-muted text-muted-foreground",
                            shift === 1 && "bg-primary-soft text-primary",
                            shift === 2 && "bg-success/12 text-success",
                            shift === 3 && "bg-warning/15 text-warning",
                          )}
                        >
                          <div>{DAYS[index]}</div>
                          <div className="mt-1">{SHIFT_LABELS[shift]}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function shortPath(value: string) {
  if (!value) {
    return "Not loaded";
  }
  const parts = value.split("/");
  return parts.slice(-2).join("/");
}
