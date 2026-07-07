import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  initialConstraints,
} from "@/lib/mock/data";
import {
  type DatasetBundle,
  fetchDashboard,
  parseConstraint,
  solveOptimization,
  uploadDataset,
  type ConstraintChip,
  type DashboardSnapshot,
} from "@/lib/api/client";

type DashboardContextValue = DashboardSnapshot & {
  currentDataset: DatasetBundle | null;
  hasDataset: boolean;
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
  employees: [],
  baselineEmployees: [],
  analysisSummary: {
    employees: 0,
    avgBurden: 0,
    fairnessScore: 0,
    fairnessGap: 0,
    morale: 0,
    flagged: 0,
    critical: 0,
  },
  kpis: [],
  burdenTrend: [],
  shiftDistribution: [],
  costDistribution: [],
  riskDistribution: [],
  fairnessTrend: [],
  aiActivity: [],
  constraints: initialConstraints,
  crisisAdvice: {
    fairnessGap: 0,
    attritionCost: 0,
    impact: "",
    recommendedSlider: 65,
    confidence: 0,
  },
  flightRiskSummary: {
    updated: new Date().toISOString(),
    flagged: 0,
    critical: 0,
  },
  solverSummary: {
    cycle: 0,
    fairness: 0,
    cost: 0,
    morale: 0,
    conflicts: 0,
    tookMs: 0,
    fairnessWeight: 65,
    minWorkDays: 2,
    maxWorkDays: 5,
  },
  beforeAfter: {
    before: { burden: 0, fairness: 0, morale: 0 },
    after: { burden: 0, fairness: 0, morale: 0 },
  },
  meta: {
    employeesCsv: "",
    shiftHistoryCsv: "",
    cycle: 0,
  },
};

const DashboardContext = createContext<DashboardContextValue | null>(null);
const DATASET_STORAGE_KEY = "fairshift.datasetBundle";

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(fallbackSnapshot);
  const [datasetBundle, setDatasetBundle] = useState<DatasetBundle | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const raw = window.sessionStorage.getItem(DATASET_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DatasetBundle) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(datasetBundle));
  const [optimizing, setOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (datasetBundle) {
      window.sessionStorage.setItem(DATASET_STORAGE_KEY, JSON.stringify(datasetBundle));
      return;
    }
    window.sessionStorage.removeItem(DATASET_STORAGE_KEY);
  }, [datasetBundle]);

  const refresh = async (
    fairnessWeight = snapshot.solverSummary.fairnessWeight || 65,
    minWorkDays = snapshot.solverSummary.minWorkDays || 0,
    maxWorkDays = snapshot.solverSummary.maxWorkDays || 7,
  ) => {
    setLoading(true);
    try {
      const response = await fetchDashboard(fairnessWeight, minWorkDays, maxWorkDays, datasetBundle);
      setSnapshot(response.dashboard);
      setHasOptimized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!datasetBundle) {
      setLoading(false);
      return;
    }
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
        dataset: datasetBundle,
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
    const response = await uploadDataset(files, datasetBundle, onProgress);
    setSnapshot(response.dashboard);
    setDatasetBundle(response.dataset);
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
        currentDataset: datasetBundle,
        hasDataset: Boolean(datasetBundle),
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
