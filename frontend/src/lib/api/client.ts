import type { Employee } from "@/lib/mock/data";

export type DashboardKpi = {
  key: string;
  label: string;
  value: string;
  trend: number;
  unit?: string;
  spark: number[];
};

export type DistributionPoint = {
  name: string;
  value: number;
  color: string;
};

export type CostPoint = {
  day: string;
  regular: number;
  overtime: number;
};

export type RiskPoint = {
  level: string;
  count: number;
  color: string;
};

export type TrendPoint = {
  week: string;
  burden: number;
  fairness: number;
  morale: number;
};

export type FairnessTrendPoint = {
  cycle: string;
  before: number;
  after: number;
};

export type ActivityItem = {
  id: number;
  type: string;
  title: string;
  desc: string;
  time: string;
};

export type ConstraintChip = {
  id: number;
  text: string;
  type: "hard" | "preference";
};

export type CrisisAdvice = {
  fairnessGap: number;
  attritionCost: number;
  impact: string;
  recommendedSlider: number;
  confidence: number;
};

export type FlightRiskSummary = {
  updated: string;
  flagged: number;
  critical: number;
};

export type SolverSummary = {
  cycle: number;
  fairness: number;
  cost: number;
  morale: number;
  conflicts: number;
  tookMs: number;
  fairnessWeight: number;
  minWorkDays?: number;
  maxWorkDays?: number;
};

export type BeforeAfterSummary = {
  before: { burden: number; fairness: number; morale: number };
  after: { burden: number; fairness: number; morale: number };
};

export type AnalysisSummary = {
  employees: number;
  avgBurden: number;
  fairnessScore: number;
  fairnessGap: number;
  morale: number;
  flagged: number;
  critical: number;
};

export type DashboardSnapshot = {
  employees: Employee[];
  baselineEmployees: Employee[];
  analysisSummary: AnalysisSummary;
  kpis: DashboardKpi[];
  burdenTrend: TrendPoint[];
  shiftDistribution: DistributionPoint[];
  costDistribution: CostPoint[];
  riskDistribution: RiskPoint[];
  fairnessTrend: FairnessTrendPoint[];
  aiActivity: ActivityItem[];
  constraints: ConstraintChip[];
  crisisAdvice: CrisisAdvice;
  flightRiskSummary: FlightRiskSummary;
  solverSummary: SolverSummary;
  beforeAfter: BeforeAfterSummary;
  meta: {
    employeesCsv: string;
    shiftHistoryCsv: string;
    cycle: number;
  };
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboard(fairnessWeight = 65, minWorkDays = 0, maxWorkDays = 7) {
  return apiFetch<{ ok: true; dashboard: DashboardSnapshot }>(
    `/api/dashboard?fairnessWeight=${encodeURIComponent(fairnessWeight)}&minWorkDays=${encodeURIComponent(minWorkDays)}&maxWorkDays=${encodeURIComponent(maxWorkDays)}`,
  );
}

export async function solveOptimization(payload: {
  fairnessWeight: number;
  constraints: ConstraintChip[];
  minWorkDays?: number;
  maxWorkDays?: number;
}) {
  return apiFetch<{ ok: true; summary: SolverSummary; dashboard: DashboardSnapshot }>(
    "/api/solve",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function uploadCsv(file: File, onProgress?: (pct: number) => void) {
  return uploadDataset({ employeesFile: file }, onProgress);
}

export async function uploadDataset(
  files: {
    employeesFile?: File | null;
    historyFile?: File | null;
  },
  onProgress?: (pct: number) => void,
) {
  const formData = new FormData();
  if (files.employeesFile) {
    formData.append("employeesFile", files.employeesFile);
  }
  if (files.historyFile) {
    formData.append("historyFile", files.historyFile);
  }

  for (let pct = 10; pct <= 90; pct += 20) {
    onProgress?.(pct);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  const response = await fetch(`${API_BASE}/api/upload-dataset`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    let message = `Upload failed: ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // ignore JSON parse failures and keep status-based error
    }
    throw new Error(message);
  }
  onProgress?.(100);
  return response.json() as Promise<{
    ok: true;
    uploaded: { employees?: string; shiftHistory?: string };
    rows: { employees: number; shiftHistory: number };
    dashboard: DashboardSnapshot;
  }>;
}

export async function parseConstraint(text: string) {
  return apiFetch<{ ok: true; parsed: ConstraintChip[] }>("/api/parse-constraint", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
