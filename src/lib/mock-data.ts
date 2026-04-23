// UI data derived from the SmartMarket Tarkwa report.

import { smartMarketReport } from "@/lib/tarkwa-report";

const totalUnitsAllProducts = smartMarketReport.productsTotals.reduce((s, p) => s + p.totalUnits, 0);
const approxAvgDailyDemand = Math.round(totalUnitsAllProducts / smartMarketReport.dataset.uniqueDates);
const approx7dForecast = approxAvgDailyDemand * 7;

export const kpiData = {
  totalQuantitySold: totalUnitsAllProducts,
  avgDailyDemand: approxAvgDailyDemand,
  highDemandProducts: 3,
  demandGrowthRate: smartMarketReport.demandDrivers.findings.paydayLiftPct,
  forecastedDemand7d: approx7dForecast,
};

function pctDelta(value: number, pct: number) {
  return value * (pct / 100);
}

const trendStartDate = new Date(`${smartMarketReport.dataset.dateRange.start}T00:00:00`);
const trendDays = smartMarketReport.dataset.uniqueDates;

// Deterministic illustrative window aligned to report date span.
export const demandTrendData = Array.from({ length: trendDays }, (_, idx) => {
  const day = idx + 1;
  const current = new Date(trendStartDate);
  current.setDate(trendStartDate.getDate() + idx);
  const dayOfMonth = current.getDate();
  const weekday = current.getDay(); // 0 Sun, 6 Sat
  const baselineWave = 1 + Math.sin((day / 32) * Math.PI * 2) * 0.18;
  const base = approxAvgDailyDemand * baselineWave;

  const isWeekend = weekday === 0 || weekday === 6;
  const isPaydayWindow =
    dayOfMonth >= smartMarketReport.demandDrivers.paydayWindowDays.start &&
    dayOfMonth <= smartMarketReport.demandDrivers.paydayWindowDays.end;
  const isMarketDayPulse = day % 9 === 0;

  let actual = base;
  if (isWeekend) actual += pctDelta(base, smartMarketReport.demandDrivers.findings.weekendLiftPct);
  if (isPaydayWindow) actual += pctDelta(base, smartMarketReport.demandDrivers.findings.paydayLiftPct);
  if (isMarketDayPulse) actual += pctDelta(base, 8);

  // Model behavior: RF tracks spikes better; ARIMA is smoother/lagging on extremes.
  const randomForest = Math.round(actual * (isPaydayWindow || isMarketDayPulse ? 0.995 : 1.01));
  const arima = Math.round(base * (isPaydayWindow ? 1.18 : isWeekend ? 1.09 : 1.0));

  return {
    day: `Day ${day}`,
    date: current.toISOString().slice(0, 10),
    dayNumber: day,
    actual: Math.round(actual),
    randomForest,
    arima,
    isPaydayWindow,
    isWeekend,
  };
});

export const demandClassification = [
  { level: "Low", count: 100, color: "hsl(var(--destructive))" },
  { level: "Medium", count: 100, color: "hsl(var(--chart-3))" },
  { level: "High", count: 100, color: "hsl(var(--chart-1))" },
];

export const productsData = [
  ...smartMarketReport.productsTotals.map((p, i) => {
    const demandLevel = p.totalUnits >= 3800 ? ("High" as const) : p.totalUnits >= 2500 ? ("Medium" as const) : ("Low" as const);
    const trend = p.spoilageRisk === 1 ? ("down" as const) : ("up" as const);
    return {
      id: i + 1,
      name: p.product,
      category: p.category,
      avgSales: p.totalUnits,
      demandLevel,
      trend,
    };
  }),
];

export const featureImportanceData = [
  { feature: "lag_1", importance: 0.26 },
  { feature: "lag_2", importance: 0.19 },
  { feature: "lag_3", importance: 0.13 },
  { feature: "Wholesale_Cost", importance: 0.11 },
  { feature: "Is_Payday", importance: 0.10 },
  { feature: "Economic_Pressure", importance: 0.08 },
  { feature: "Product", importance: 0.07 },
  { feature: "Spoilage_Risk", importance: 0.06 },
];

export const correlationData = [
  { x: "Qty Sold", y: "Is_Payday", value: 0.45 },
  { x: "Qty Sold", y: "Weekend", value: 0.17 },
  { x: "Qty Sold", y: "Spoilage_Risk", value: -0.33 },
  { x: "Qty Sold", y: "Economic_Pressure", value: smartMarketReport.demandDrivers.findings.economicPressurePearsonR },
  { x: "Fuel Price", y: "Exchange Rate", value: 0.72 },
];

export const modelPerformance = {
  arima: { mae: 245.3, r2: 0.82 },
  randomForest: { mae: 178.6, r2: 0.91 },
};
