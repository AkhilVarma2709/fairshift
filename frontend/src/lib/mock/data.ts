export type Employee = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  team: string;
  hours: number;
  cost: number;
  burden: number; // 0-100
  riskScore: number; // 0-100
  riskTrend: number[]; // sparkline
  morale: number; // 0-100
  shifts: (0 | 1 | 2 | 3)[]; // 7 days: 0 off, 1 morning, 2 day, 3 night
  recommendation: string;
};

const NAMES = [
  ["Amelia", "Chen"], ["Marcus", "Rodriguez"], ["Priya", "Patel"], ["Ethan", "Nakamura"],
  ["Sofia", "Volkov"], ["Jamal", "Washington"], ["Isabella", "Rossi"], ["Liam", "O'Connor"],
  ["Nia", "Okafor"], ["Charlie", "Bennett"], ["Yuki", "Tanaka"], ["Rafael", "Silva"],
  ["Hannah", "Goldberg"], ["Dmitri", "Petrov"], ["Zara", "Ahmed"], ["Oliver", "Schmidt"],
  ["Maya", "Kapoor"], ["Diego", "Alvarez"], ["Chloe", "Dubois"], ["Kenji", "Yamamoto"],
];
const ROLES = ["RN Charge", "RN Floor", "LPN", "Tech", "Nurse Aide", "Coordinator", "Supervisor"];
const TEAMS = ["ICU-3", "ER North", "Ward 4B", "OR Wing", "Recovery"];
const RECS = [
  "Rebalance nights across peers; offer flex Friday.",
  "Schedule 1:1 with manager; reduce weekend load by 20%.",
  "Rotate off consecutive nights; suggested wellness stipend.",
  "Fairness swap with peer opens 6h; auto-propose in Optimizer.",
  "No action required — trajectory stable this cycle.",
];

const seed = (i: number) => {
  let x = Math.sin(i * 9973) * 10000;
  return x - Math.floor(x);
};

export const employees: Employee[] = NAMES.map(([first, last], i) => {
  const r = seed(i + 1);
  const risk = Math.round(15 + r * 82);
  const burden = Math.round(30 + seed(i + 30) * 65);
  return {
    id: `E-${1000 + i}`,
    name: `${first} ${last}`,
    role: ROLES[i % ROLES.length],
    avatar: `${first[0]}${last[0]}`,
    team: TEAMS[i % TEAMS.length],
    hours: 24 + Math.round(seed(i + 7) * 24),
    cost: 1200 + Math.round(seed(i + 12) * 2400),
    burden,
    riskScore: risk,
    riskTrend: Array.from({ length: 8 }, (_, k) => Math.round(risk * 0.6 + seed(i * 8 + k) * 40)),
    morale: Math.max(20, 100 - Math.round(burden * 0.6 + seed(i + 45) * 20)),
    shifts: Array.from({ length: 7 }, (_, d) => {
      const v = seed(i * 7 + d);
      if (v < 0.25) return 0;
      if (v < 0.55) return 1;
      if (v < 0.8) return 2;
      return 3;
    }) as (0|1|2|3)[],
    recommendation: RECS[i % RECS.length],
  };
});

export const kpis = [
  { key: "employees", label: "Total Employees", value: "127", trend: +3.2, spark: [42,44,45,46,48,49,52,54] },
  { key: "burden", label: "Average Burden", value: "62", trend: -4.1, unit: "%", spark: [70,68,66,66,64,63,62,62] },
  { key: "fairness", label: "Fairness Gap", value: "8.4", trend: -12.5, unit: "%", spark: [14,13,12,11,10,9,9,8.4] },
  { key: "morale", label: "Team Morale", value: "78", trend: +2.6, unit: "%", spark: [72,73,74,75,75,76,77,78] },
  { key: "cost", label: "Weekly Cost", value: "$184.2K", trend: -1.8, spark: [188,187,186,186,185,184.6,184.4,184.2] },
  { key: "risk", label: "Employees at Risk", value: "9", trend: -25, spark: [16,15,14,13,12,11,10,9] },
];

export const burdenTrend = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  burden: 70 - i * 0.9 + Math.sin(i) * 2,
  fairness: 82 + i * 1.1 + Math.cos(i) * 1.5,
  morale: 68 + i * 0.9 + Math.sin(i / 2) * 2,
}));

export const shiftDistribution = [
  { name: "Morning", value: 42, color: "var(--color-primary)" },
  { name: "Day", value: 33, color: "var(--color-success)" },
  { name: "Night", value: 18, color: "var(--color-warning)" },
  { name: "Off", value: 7, color: "var(--color-muted-foreground)" },
];

export const costDistribution = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  regular: 18 + Math.sin(i) * 3 + i * 0.4,
  overtime: 4 + Math.abs(Math.cos(i)) * 3,
}));

export const riskDistribution = [
  { level: "Low", count: 84, color: "var(--color-success)" },
  { level: "Moderate", count: 34, color: "var(--color-warning)" },
  { level: "High", count: 7, color: "oklch(0.7 0.18 45)" },
  { level: "Critical", count: 2, color: "var(--color-danger)" },
];

export const fairnessTrend = Array.from({ length: 10 }, (_, i) => ({
  cycle: `C${i + 1}`,
  before: 76 - i * 0.3 + Math.cos(i) * 2,
  after: 88 + i * 0.6 + Math.sin(i) * 1.2,
}));

export const aiActivity = [
  { id: 1, type: "optimize", title: "Optimization complete", desc: "Cycle 34 solved in 2.1s · Fairness +6.2%", time: "2m ago" },
  { id: 2, type: "constraint", title: "Constraint parsed", desc: "\"Charlie cannot work nights\" → hard rule added", time: "8m ago" },
  { id: 3, type: "risk", title: "Flight risk refreshed", desc: "9 employees flagged · 2 critical", time: "22m ago" },
  { id: 4, type: "crisis", title: "Crisis Agent warning", desc: "Projected 12% attrition in ICU-3 without action", time: "1h ago" },
  { id: 5, type: "apply", title: "Recommendation applied", desc: "Slider moved to 68% fairness · Cost +1.4%", time: "3h ago" },
  { id: 6, type: "optimize", title: "Draft schedule generated", desc: "Week of Dec 8 · 127 employees · 3 conflicts", time: "5h ago" },
];

export const initialConstraints = [
  { id: 1, text: "Amelia prefers no back-to-back nights", type: "preference" as const },
  { id: 2, text: "ICU-3 requires 2 senior RNs per shift", type: "hard" as const },
  { id: 3, text: "Marcus available weekends only", type: "hard" as const },
];
