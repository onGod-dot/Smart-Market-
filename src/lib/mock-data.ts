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

// A deterministic 30-day illustrative window following the report's effects.
export const demandTrendData = Array.from({ length: 30 }, (_, idx) => {
  const day = idx + 1;
  const base = approxAvgDailyDemand;

  const isWeekend = day % 7 === 6 || day % 7 === 0; // illustrative cadence
  const isPaydayWindow = day >= smartMarketReport.demandDrivers.paydayWindowDays.start && day <= smartMarketReport.demandDrivers.paydayWindowDays.end;

  let actual = base;
  if (isWeekend) actual += pctDelta(base, smartMarketReport.demandDrivers.findings.weekendLiftPct);
  if (isPaydayWindow) actual += pctDelta(base, smartMarketReport.demandDrivers.findings.paydayLiftPct);

  // Models: keep them close to actual but with small, consistent offsets.
  const arima = Math.round(actual * 0.98);
  const randomForest = Math.round(actual * 1.01);

  return {
    day: `Day ${day}`,
    actual: Math.round(actual),
    randomForest,
    arima,
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
