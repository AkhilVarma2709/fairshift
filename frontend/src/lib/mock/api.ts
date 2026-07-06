// Mock API — swap with real backend later. All functions return promises.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function upload(file: File, onProgress?: (pct: number) => void) {
  for (let p = 10; p <= 100; p += 10) {
    await delay(120);
    onProgress?.(p);
  }
  return { ok: true, filename: file.name, rows: 127, columns: 14 };
}

export async function solve(params: { fairnessWeight: number }) {
  await delay(900);
  return {
    ok: true,
    cycle: 35,
    fairness: 80 + params.fairnessWeight * 0.15,
    cost: 184200 - params.fairnessWeight * 40,
    morale: 72 + params.fairnessWeight * 0.12,
    conflicts: 0,
    tookMs: 2143,
  };
}

export async function flightRisk() {
  await delay(600);
  return { updated: new Date().toISOString(), flagged: 9, critical: 2 };
}

export async function crisisAdvice() {
  await delay(500);
  return {
    fairnessGap: 8.4,
    attritionCost: 284000,
    impact: "3 senior RNs projected to leave within 60 days at current burden trajectory.",
    recommendedSlider: 68,
    confidence: 0.92,
  };
}

export async function parseConstraint(text: string) {
  await delay(450);
  const lower = text.toLowerCase();
  const type: "hard" | "preference" =
    /cannot|never|must not|forbidden|required|must/.test(lower) ? "hard" : "preference";
  return {
    ok: true,
    parsed: [{ id: Date.now(), text: text.trim(), type }],
  };
}
