import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-context-DP2qLhQ0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAMES = [
	["Amelia", "Chen"],
	["Marcus", "Rodriguez"],
	["Priya", "Patel"],
	["Ethan", "Nakamura"],
	["Sofia", "Volkov"],
	["Jamal", "Washington"],
	["Isabella", "Rossi"],
	["Liam", "O'Connor"],
	["Nia", "Okafor"],
	["Charlie", "Bennett"],
	["Yuki", "Tanaka"],
	["Rafael", "Silva"],
	["Hannah", "Goldberg"],
	["Dmitri", "Petrov"],
	["Zara", "Ahmed"],
	["Oliver", "Schmidt"],
	["Maya", "Kapoor"],
	["Diego", "Alvarez"],
	["Chloe", "Dubois"],
	["Kenji", "Yamamoto"]
];
var ROLES = [
	"RN Charge",
	"RN Floor",
	"LPN",
	"Tech",
	"Nurse Aide",
	"Coordinator",
	"Supervisor"
];
var TEAMS = [
	"ICU-3",
	"ER North",
	"Ward 4B",
	"OR Wing",
	"Recovery"
];
var RECS = [
	"Rebalance nights across peers; offer flex Friday.",
	"Schedule 1:1 with manager; reduce weekend load by 20%.",
	"Rotate off consecutive nights; suggested wellness stipend.",
	"Fairness swap with peer opens 6h; auto-propose in Optimizer.",
	"No action required — trajectory stable this cycle."
];
var seed = (i) => {
	let x = Math.sin(i * 9973) * 1e4;
	return x - Math.floor(x);
};
NAMES.map(([first, last], i) => {
	const r = seed(i + 1);
	const risk = Math.round(15 + r * 82);
	const burden = Math.round(30 + seed(i + 30) * 65);
	return {
		id: `E-${1e3 + i}`,
		name: `${first} ${last}`,
		role: ROLES[i % ROLES.length],
		avatar: `${first[0]}${last[0]}`,
		team: TEAMS[i % TEAMS.length],
		hours: 24 + Math.round(seed(i + 7) * 24),
		cost: 1200 + Math.round(seed(i + 12) * 2400),
		burden,
		riskScore: risk,
		riskTrend: Array.from({ length: 8 }, (_, k) => Math.round(risk * .6 + seed(i * 8 + k) * 40)),
		morale: Math.max(20, 100 - Math.round(burden * .6 + seed(i + 45) * 20)),
		shifts: Array.from({ length: 7 }, (_, d) => {
			const v = seed(i * 7 + d);
			if (v < .25) return 0;
			if (v < .55) return 1;
			if (v < .8) return 2;
			return 3;
		}),
		recommendation: RECS[i % RECS.length]
	};
});
Array.from({ length: 12 }, (_, i) => ({
	week: `W${i + 1}`,
	burden: 70 - i * .9 + Math.sin(i) * 2,
	fairness: 82 + i * 1.1 + Math.cos(i) * 1.5,
	morale: 68 + i * .9 + Math.sin(i / 2) * 2
}));
Array.from({ length: 7 }, (_, i) => ({
	day: [
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat",
		"Sun"
	][i],
	regular: 18 + Math.sin(i) * 3 + i * .4,
	overtime: 4 + Math.abs(Math.cos(i)) * 3
}));
Array.from({ length: 10 }, (_, i) => ({
	cycle: `C${i + 1}`,
	before: 76 - i * .3 + Math.cos(i) * 2,
	after: 88 + i * .6 + Math.sin(i) * 1.2
}));
var initialConstraints = [
	{
		id: 1,
		text: "Amelia prefers no back-to-back nights",
		type: "preference"
	},
	{
		id: 2,
		text: "ICU-3 requires 2 senior RNs per shift",
		type: "hard"
	},
	{
		id: 3,
		text: "Marcus available weekends only",
		type: "hard"
	}
];
var API_BASE = "";
async function apiFetch(path, init) {
	const response = await fetch(`${API_BASE}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers ?? {}
		}
	});
	if (!response.ok) throw new Error(`API request failed: ${response.status}`);
	return response.json();
}
async function fetchDashboard(fairnessWeight = 65, minWorkDays = 0, maxWorkDays = 7, dataset) {
	return apiFetch("/api/dashboard", {
		method: "POST",
		body: JSON.stringify({
			fairnessWeight,
			minWorkDays,
			maxWorkDays,
			dataset
		})
	});
}
async function solveOptimization(payload) {
	return apiFetch("/api/solve", {
		method: "POST",
		body: JSON.stringify(payload)
	});
}
async function uploadDataset(files, currentDataset, onProgress) {
	const formData = new FormData();
	if (files.employeesFile) formData.append("employeesFile", files.employeesFile);
	if (files.historyFile) formData.append("historyFile", files.historyFile);
	if (currentDataset) {
		formData.append("currentEmployeesCsvText", currentDataset.employeesCsvText);
		formData.append("currentShiftHistoryCsvText", currentDataset.shiftHistoryCsvText);
		formData.append("currentEmployeesFilename", currentDataset.employeesFilename);
		formData.append("currentShiftHistoryFilename", currentDataset.shiftHistoryFilename);
	}
	for (let pct = 10; pct <= 90; pct += 20) {
		onProgress?.(pct);
		await new Promise((resolve) => setTimeout(resolve, 120));
	}
	const response = await fetch(`${API_BASE}/api/upload-dataset`, {
		method: "POST",
		body: formData
	});
	if (!response.ok) {
		let message = `Upload failed: ${response.status}`;
		try {
			const payload = await response.json();
			if (payload.message) message = payload.message;
		} catch {}
		throw new Error(message);
	}
	onProgress?.(100);
	return response.json();
}
async function parseConstraint(text) {
	return apiFetch("/api/parse-constraint", {
		method: "POST",
		body: JSON.stringify({ text })
	});
}
var fallbackSnapshot = {
	employees: [],
	baselineEmployees: [],
	analysisSummary: {
		employees: 0,
		avgBurden: 0,
		fairnessScore: 0,
		fairnessGap: 0,
		morale: 0,
		flagged: 0,
		critical: 0
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
		confidence: 0
	},
	flightRiskSummary: {
		updated: (/* @__PURE__ */ new Date()).toISOString(),
		flagged: 0,
		critical: 0
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
		maxWorkDays: 5
	},
	beforeAfter: {
		before: {
			burden: 0,
			fairness: 0,
			morale: 0
		},
		after: {
			burden: 0,
			fairness: 0,
			morale: 0
		}
	},
	meta: {
		employeesCsv: "",
		shiftHistoryCsv: "",
		cycle: 0
	}
};
var DashboardContext = (0, import_react.createContext)(null);
var DATASET_STORAGE_KEY = "fairshift.datasetBundle";
function DashboardDataProvider({ children }) {
	const [snapshot, setSnapshot] = (0, import_react.useState)(fallbackSnapshot);
	const [datasetBundle, setDatasetBundle] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return null;
		try {
			const raw = window.sessionStorage.getItem(DATASET_STORAGE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	});
	const [loading, setLoading] = (0, import_react.useState)(Boolean(datasetBundle));
	const [optimizing, setOptimizing] = (0, import_react.useState)(false);
	const [hasOptimized, setHasOptimized] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (datasetBundle) {
			window.sessionStorage.setItem(DATASET_STORAGE_KEY, JSON.stringify(datasetBundle));
			return;
		}
		window.sessionStorage.removeItem(DATASET_STORAGE_KEY);
	}, [datasetBundle]);
	const refresh = async (fairnessWeight = snapshot.solverSummary.fairnessWeight || 65, minWorkDays = snapshot.solverSummary.minWorkDays || 0, maxWorkDays = snapshot.solverSummary.maxWorkDays || 7) => {
		setLoading(true);
		try {
			const response = await fetchDashboard(fairnessWeight, minWorkDays, maxWorkDays, datasetBundle);
			setSnapshot(response.dashboard);
			setHasOptimized(false);
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!datasetBundle) {
			setLoading(false);
			return;
		}
		refresh();
	}, []);
	const optimize = async (fairnessWeight, minWorkDays = 0, maxWorkDays = 7) => {
		setOptimizing(true);
		try {
			const response = await solveOptimization({
				fairnessWeight,
				constraints: snapshot.constraints,
				minWorkDays,
				maxWorkDays,
				dataset: datasetBundle
			});
			setSnapshot(response.dashboard);
			setHasOptimized(true);
			return response.summary;
		} finally {
			setOptimizing(false);
		}
	};
	const addConstraint = async (text) => {
		const response = await parseConstraint(text);
		setSnapshot((current) => ({
			...current,
			constraints: [...current.constraints, ...response.parsed]
		}));
		return response.parsed;
	};
	const removeConstraint = (id) => {
		setSnapshot((current) => ({
			...current,
			constraints: current.constraints.filter((constraint) => constraint.id !== id)
		}));
	};
	const upload = async (files, onProgress) => {
		const response = await uploadDataset(files, datasetBundle, onProgress);
		setSnapshot(response.dashboard);
		setDatasetBundle(response.dataset);
		setHasOptimized(false);
		return {
			uploaded: response.uploaded,
			rows: response.rows
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardContext.Provider, {
		value: {
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
			refresh
		},
		children
	});
}
function useDashboardData() {
	const context = (0, import_react.useContext)(DashboardContext);
	if (!context) throw new Error("useDashboardData must be used within DashboardDataProvider");
	return context;
}
//#endregion
export { useDashboardData as n, DashboardDataProvider as t };
