import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-context-B1gfehe-.js
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
var employees = NAMES.map(([first, last], i) => {
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
var kpis = [
	{
		key: "employees",
		label: "Total Employees",
		value: "127",
		trend: 3.2,
		spark: [
			42,
			44,
			45,
			46,
			48,
			49,
			52,
			54
		]
	},
	{
		key: "burden",
		label: "Average Burden",
		value: "62",
		trend: -4.1,
		unit: "%",
		spark: [
			70,
			68,
			66,
			66,
			64,
			63,
			62,
			62
		]
	},
	{
		key: "fairness",
		label: "Fairness Gap",
		value: "8.4",
		trend: -12.5,
		unit: "%",
		spark: [
			14,
			13,
			12,
			11,
			10,
			9,
			9,
			8.4
		]
	},
	{
		key: "morale",
		label: "Team Morale",
		value: "78",
		trend: 2.6,
		unit: "%",
		spark: [
			72,
			73,
			74,
			75,
			75,
			76,
			77,
			78
		]
	},
	{
		key: "cost",
		label: "Weekly Cost",
		value: "$184.2K",
		trend: -1.8,
		spark: [
			188,
			187,
			186,
			186,
			185,
			184.6,
			184.4,
			184.2
		]
	},
	{
		key: "risk",
		label: "Employees at Risk",
		value: "9",
		trend: -25,
		spark: [
			16,
			15,
			14,
			13,
			12,
			11,
			10,
			9
		]
	}
];
var burdenTrend = Array.from({ length: 12 }, (_, i) => ({
	week: `W${i + 1}`,
	burden: 70 - i * .9 + Math.sin(i) * 2,
	fairness: 82 + i * 1.1 + Math.cos(i) * 1.5,
	morale: 68 + i * .9 + Math.sin(i / 2) * 2
}));
var shiftDistribution = [
	{
		name: "Morning",
		value: 42,
		color: "var(--color-primary)"
	},
	{
		name: "Day",
		value: 33,
		color: "var(--color-success)"
	},
	{
		name: "Night",
		value: 18,
		color: "var(--color-warning)"
	},
	{
		name: "Off",
		value: 7,
		color: "var(--color-muted-foreground)"
	}
];
var costDistribution = Array.from({ length: 7 }, (_, i) => ({
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
var riskDistribution = [
	{
		level: "Low",
		count: 84,
		color: "var(--color-success)"
	},
	{
		level: "Moderate",
		count: 34,
		color: "var(--color-warning)"
	},
	{
		level: "High",
		count: 7,
		color: "oklch(0.7 0.18 45)"
	},
	{
		level: "Critical",
		count: 2,
		color: "var(--color-danger)"
	}
];
var fairnessTrend = Array.from({ length: 10 }, (_, i) => ({
	cycle: `C${i + 1}`,
	before: 76 - i * .3 + Math.cos(i) * 2,
	after: 88 + i * .6 + Math.sin(i) * 1.2
}));
var aiActivity = [
	{
		id: 1,
		type: "optimize",
		title: "Optimization complete",
		desc: "Cycle 34 solved in 2.1s · Fairness +6.2%",
		time: "2m ago"
	},
	{
		id: 2,
		type: "constraint",
		title: "Constraint parsed",
		desc: "\"Charlie cannot work nights\" → hard rule added",
		time: "8m ago"
	},
	{
		id: 3,
		type: "risk",
		title: "Flight risk refreshed",
		desc: "9 employees flagged · 2 critical",
		time: "22m ago"
	},
	{
		id: 4,
		type: "crisis",
		title: "Crisis Agent warning",
		desc: "Projected 12% attrition in ICU-3 without action",
		time: "1h ago"
	},
	{
		id: 5,
		type: "apply",
		title: "Recommendation applied",
		desc: "Slider moved to 68% fairness · Cost +1.4%",
		time: "3h ago"
	},
	{
		id: 6,
		type: "optimize",
		title: "Draft schedule generated",
		desc: "Week of Dec 8 · 127 employees · 3 conflicts",
		time: "5h ago"
	}
];
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
	employees,
	baselineEmployees: employees,
	analysisSummary: {
		employees: employees.length,
		avgBurden: 70,
		fairnessScore: 78,
		fairnessGap: 22,
		morale: 69,
		flagged: 9,
		critical: 2
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
		attritionCost: 284e3,
		impact: "3 senior RNs projected to leave within 60 days at current burden trajectory.",
		recommendedSlider: 68,
		confidence: .92
	},
	flightRiskSummary: {
		updated: (/* @__PURE__ */ new Date()).toISOString(),
		flagged: 9,
		critical: 2
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
		maxWorkDays: 7
	},
	beforeAfter: {
		before: {
			burden: 70,
			fairness: 78,
			morale: 69
		},
		after: {
			burden: 62,
			fairness: 88,
			morale: 78
		}
	},
	meta: {
		employeesCsv: "",
		shiftHistoryCsv: "",
		cycle: 34
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
	const [loading, setLoading] = (0, import_react.useState)(true);
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
