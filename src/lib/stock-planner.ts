import { smartMarketReport } from "@/lib/tarkwa-report";

export type StockPlannerInputs = {
  productName: string;
  start: Date;
  end: Date;
  currentStock: number;
  leadTimeDays: number;
  safetyBufferPct: number;
};

export type StockPlannerResult = {
  product: string;
  category: "Staple" | "Perishable";
  periodLabel: string;
  days: number;
  weekendDaysInPeriod: number;
  paydayDaysInPeriod: number;
  avgUnitsPerTransaction: number;
  baselineExpectedUnits: number;
  paydayBoostPct: number;
  weekendBoostPct: number;
  peakBoostPct: number;
  spoilageAdjustmentPct: number;
  economicAdjustmentPct: number;
  expectedUnits: number;
  orderMin: number;
  orderMax: number;
  netOrderMin: number;
  netOrderMax: number;
  demandLevel: "Low" | "Medium" | "High";
  confidence: "Low" | "Medium" | "High";
  peakMonthsInPeriod: string[];
  notes: string[];
};

const monthShort = (month: number) => new Date(2024, month - 1).toLocaleString("default", { month: "short" });

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function countWeekendDaysInclusive(start: Date, end: Date) {
  let count = 0;
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const endCopy = new Date(end);
  endCopy.setHours(0, 0, 0, 0);
  while (d <= endCopy) {
    const wd = d.getDay();
    if (wd === 0 || wd === 6) count += 1;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function countPaydayDaysInclusive(start: Date, end: Date, paydayStart: number, paydayEnd: number) {
  let count = 0;
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const endCopy = new Date(end);
  endCopy.setHours(0, 0, 0, 0);
  while (d <= endCopy) {
    const day = d.getDate();
    if (day >= paydayStart && day <= paydayEnd) count += 1;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function monthNumbersInRange(start: Date, end: Date) {
  const set = new Set<number>();
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const endCopy = new Date(end);
  endCopy.setHours(0, 0, 0, 0);
  while (d <= endCopy) {
    set.add(d.getMonth() + 1);
    d.setDate(d.getDate() + 1);
  }
  return Array.from(set.values()).sort((a, b) => a - b);
}

export function computeStockPlan(input: StockPlannerInputs): StockPlannerResult {
  const p = smartMarketReport.productsTotals.find((x) => x.product.toLowerCase() === input.productName.toLowerCase());
  if (!p) {
    throw new Error("Unknown product");
  }

  const days = Math.max(1, Math.floor((input.end.getTime() - input.start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const periodLabel = `${input.start.toLocaleDateString()} → ${input.end.toLocaleDateString()}`;

  const avgPerTx = p.totalUnits / smartMarketReport.dataset.rows;

  // Baseline: scale expected demand with days, anchored to per-transaction scale.
  const baseline = avgPerTx * days;

  const weekendDays = countWeekendDaysInclusive(input.start, input.end);
  const paydayDays = countPaydayDaysInclusive(
    input.start,
    input.end,
    smartMarketReport.demandDrivers.paydayWindowDays.start,
    smartMarketReport.demandDrivers.paydayWindowDays.end
  );

  const wShare = days > 0 ? weekendDays / days : 0;
  const pShare = days > 0 ? paydayDays / days : 0;

  const wLift = smartMarketReport.demandDrivers.findings.weekendLiftPct / 100;
  const pLift = smartMarketReport.demandDrivers.findings.paydayLiftPct / 100;

  const weekendBoostPct = wShare * wLift;
  const paydayBoostPct = pShare * pLift;

  const months = monthNumbersInRange(input.start, input.end);
  const peak = smartMarketReport.commodityPeakMonths.find((x) => x.product.toLowerCase() === p.product.toLowerCase());
  const peakOverlap = peak ? peak.peakMonths.filter((m) => months.includes(m)) : [];
  const peakBoostPct = peakOverlap.length && months.length > 0 ? 0.06 * (peakOverlap.length / months.length) : 0;

  // Spoilage: perishable + explicit sensitivity + high spoilage products.
  const spoilageBase = p.spoilageRisk === 1 ? smartMarketReport.demandDrivers.findings.spoilageReductionPct / 100 : 0;
  const sensMul = p.spoilageRisk === 1 ? 1 : 0.35;
  const spoilageAdjustmentPct = p.category === "Perishable" ? -clamp(spoilageBase * sensMul, 0, 0.45) : 0;

  // Economic macro factors are held constant in planner output (not user-adjustable).
  const economicAdjustmentPct = 0;

  const expected =
    baseline *
    (1 + weekendBoostPct) *
    (1 + paydayBoostPct) *
    (1 + peakBoostPct) *
    (1 + spoilageAdjustmentPct) *
    (1 + economicAdjustmentPct);

  const spread = Math.max(12, Math.round(expected * 0.1 * (1 + (1 - p.spoilageRisk) * 0.15)));
  const min = Math.max(0, Math.round(expected - spread));
  const max = Math.max(min, Math.round(expected + spread));

  // Demand level uses the same per-transaction cutpoints as the Tarkwa qcut table (see report thresholds).
  const perTx = avgPerTx * (1 + weekendBoostPct) * (1 + paydayBoostPct) * (1 + peakBoostPct) * (1 + spoilageAdjustmentPct) * (1 + economicAdjustmentPct);
  const { mediumMin, highMin } = smartMarketReport.demandLevels.thresholds;
  const level: StockPlannerResult["demandLevel"] = perTx >= highMin ? "High" : perTx >= mediumMin ? "Medium" : "Low";

  const confidence: StockPlannerResult["confidence"] = days > 60 ? "Low" : days <= 35 ? "High" : "Medium";

  const buffer = clamp(input.safetyBufferPct / 100, 0, 0.5);
  const bufferedMin = Math.round(min * (1 + buffer));
  const bufferedMax = Math.round(max * (1 + buffer));

  const lead = Math.max(0, Math.round(input.leadTimeDays));
  const leadAdj = lead > 0 ? Math.round(expected * (lead / Math.max(14, days)) * 0.15) : 0;

  const netMin = Math.max(0, bufferedMin + leadAdj - Math.max(0, input.currentStock));
  const netMax = Math.max(netMin, bufferedMax + leadAdj - Math.max(0, input.currentStock));

  const notes: string[] = [];
  notes.push(
    `Baseline scales from the commodity’s average transaction size in the Tarkwa dataset (${avgPerTx.toFixed(1)} units/tx) across ${days} day(s).`
  );
  notes.push(`Weekend days in range: ${weekendDays} (weekend demand lift applied proportionally).`);
  notes.push(`Payday-window days in range: ${paydayDays} (payday demand lift applied proportionally).`);
  if (peakOverlap.length) notes.push(`Peak month overlap: ${peakOverlap.map(monthShort).join(", ")}.`);
  if (p.category === "Perishable" && p.spoilageRisk === 1) notes.push("Spoilage risk is elevated for this commodity; orders are reduced to limit waste.");
  if (input.currentStock > 0) notes.push("Net order subtracts your current stock from the recommended range (after buffer).");
  if (input.leadTimeDays > 0) notes.push("Lead time adds a small top-up to cover sales while new stock is arriving.");
  return {
    product: p.product,
    category: p.category,
    periodLabel,
    days,
    weekendDaysInPeriod: weekendDays,
    paydayDaysInPeriod: paydayDays,
    avgUnitsPerTransaction: avgPerTx,
    baselineExpectedUnits: Math.round(baseline),
    paydayBoostPct,
    weekendBoostPct,
    peakBoostPct,
    spoilageAdjustmentPct,
    economicAdjustmentPct,
    expectedUnits: Math.round(expected),
    orderMin: bufferedMin,
    orderMax: bufferedMax,
    netOrderMin: netMin,
    netOrderMax: netMax,
    demandLevel: level,
    confidence,
    peakMonthsInPeriod: peakOverlap.map(monthShort),
    notes,
  };
}
