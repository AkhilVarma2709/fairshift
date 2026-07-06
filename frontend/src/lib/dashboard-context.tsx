import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  aiActivity,
  burdenTrend,
  costDistribution,
  employees,
  fairnessTrend,
  initialConstraints,
  kpis,
  riskDistribution,
  shiftDistribution,
} from "@/lib/mock/data";
import {
  fetchDashboard,
  parseConstraint,
  solveOptimization,
  uploadDataset,
  type ConstraintChip,
  type DashboardSnapshot,
} from "@/lib/api/client";

type DashboardContextValue = DashboardSnapshot & {
  loading: boolean;
  optimizing: boolean;
  hasOptimized: boolean;
  optimize: (
    fairnessWeight: number,
    minWorkDays?: number,
    maxWorkDays?: number,
  ) => Promise<DashboardSnapshot["solverSummary"]>;
  addConstraint: (text: string) => Promise<ConstraintChip[]>;
  removeConstraint: (id: number) => void;
  upload: (files: {
    employeesFile?: File | null;
    historyFile?: File | null;
  },
    onProgress?: (pct: number) => void,
  ) => Promise<{
    uploaded: { employees?: string; shiftHistory?: string };
    rows: { employees: number; shiftHistory: number };
  }>;
  refresh: (fairnessWeight?: number, minWorkDays?: number, maxWorkDays?: number) => Promise<void>;
};

const fallbackSnapshot: DashboardSnapshot = {
  employees,
  baselineEmployees: employees,
  analysisSummary: {
    employees: employees.length,
    avgBurden: 70,
    fairnessScore: 78,
    fairnessGap: 22,
    morale: 69,
    flagged: 9,
    critical: 2,
  },
  kpis,
  burdenTrend,
  shiftDistribution,
  costDistribution,
  riskDistribution,
  fairnessTrend,
  aiActivity,
  constraints: initialConstraints,
  crisisAdvice: {
    fairnessGap: 8.4,
    attritionCost: 284000,
    impact: "3 senior RNs projected to leave within 60 days at current burden trajectory.",
    recommendedSlider: 68,
    confidence: 0.92,
  },
  flightRiskSummary: {
    updated: new Date().toISOString(),
    flagged: 9,
    critical: 2,
  },
  solverSummary: {
    cycle: 34,
    fairness: 88,
    cost: 184200,
    morale: 78,
    conflicts: 0,
    tookMs: 2143,
    fairnessWeight: 65,
    minWorkDays: 0,
    maxWorkDays: 7,
  },
  beforeAfter: {
    before: { burden: 70, fairness: 78, morale: 69 },
    after: { burden: 62, fairness: 88, morale: 78 },
  },
  meta: {
    employeesCsv: "",
    shiftHistoryCsv: "",
    cycle: 34,
  },
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(fallbackSnapshot);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);

  const refresh = async (
    fairnessWeight = snapshot.solverSummary.fairnessWeight || 65,
    minWorkDays = snapshot.solverSummary.minWorkDays || 0,
    maxWorkDays = snapshot.solverSummary.maxWorkDays || 7,
  ) => {
    setLoading(true);
    try {
      const response = await fetchDashboard(fairnessWeight, minWorkDays, maxWorkDays);
      setSnapshot(response.dashboard);
      setHasOptimized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const optimize = async (fairnessWeight: number, minWorkDays = 0, maxWorkDays = 7) => {
    setOptimizing(true);
    try {
      const response = await solveOptimization({
        fairnessWeight,
        constraints: snapshot.constraints,
        minWorkDays,
        maxWorkDays,
      });
      setSnapshot(response.dashboard);
      setHasOptimized(true);
      return response.summary;
    } finally {
      setOptimizing(false);
    }
  };

  const addConstraint = async (text: string) => {
    const response = await parseConstraint(text);
    setSnapshot((current) => ({
      ...current,
      constraints: [...current.constraints, ...response.parsed],
    }));
    return response.parsed;
  };

  const removeConstraint = (id: number) => {
    setSnapshot((current) => ({
      ...current,
      constraints: current.constraints.filter((constraint) => constraint.id !== id),
    }));
  };

  const upload = async (
    files: {
      employeesFile?: File | null;
      historyFile?: File | null;
    },
    onProgress?: (pct: number) => void,
  ) => {
    const response = await uploadDataset(files, onProgress);
    setSnapshot(response.dashboard);
    setHasOptimized(false);
    return {
      uploaded: response.uploaded,
      rows: response.rows,
    };
  };

  return (
    <DashboardContext.Provider
      value={{
        ...snapshot,
        loading,
        optimizing,
        hasOptimized,
        optimize,
        addConstraint,
        removeConstraint,
        upload,
        refresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }
  return context;
}
