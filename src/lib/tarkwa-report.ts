export const smartMarketReport = {
  initiative: {
    name: "SmartMarket",
    tagline: "Where Market Analysis Meets Prediction",
    location: "Tarkwa",
  },
  dataset: {
    file: "TarkwaMarket.csv",
    rows: 300,
    columns: 12,
    dateRange: { start: "2025-12-01", end: "2026-04-02" },
    uniqueDates: 108,
    productsCount: 9,
    categories: ["Perishable", "Staple"] as const,
    targetColumn: "Quantity_Sold",
    fullyBlankRows: 15,
  },
  cleaning: {
    missingRowsStrategy: {
      numerical: "median",
      categorical: "mode",
    },
    dateParsing: "pd.to_datetime(Date) then sort by Date",
    rederivedFlags: ["Is_Payday", "Is_Weekend"] as const,
    engineeredFeatures: ["Month", "Day", "Weekday_Num", "Economic_Pressure"] as const,
    economicPressureDefinition: "Fuel_Price + Exchange_Rate",
  },
  demandDrivers: {
    paydayWindowDays: { start: 25, end: 30 },
    findings: {
      paydayLiftPct: 45.1,
      paydayAvgUnits: 130.6,
      nonPaydayAvgUnits: 90.0,
      weekendLiftPct: 16.6,
      weekendAvgUnits: 107.8,
      weekdayAvgUnits: 92.5,
      spoilageReductionPct: 32.5,
      lowSpoilageAvgUnits: 111.9,
      highSpoilageAvgUnits: 75.6,
      economicPressurePearsonR: -0.0297,
    },
  },
  seasonality: {
    findings: {
      drySeasonAvgUnits: 96.9,
      rainySeasonAvgUnits: 97.3,
      note: "Minimal seasonal difference observed in Tarkwa dataset.",
    },
  },
  demandLevels: {
    method: "qcut(q=3) equal-frequency buckets",
    thresholds: {
      lowMax: 72,
      mediumMin: 73,
      mediumMax: 120,
      highMin: 121,
    },
  },
  models: {
    arima: {
      name: "ARIMA",
      granularity: "Daily total demand (aggregated)",
      config: { p: 5, d: 1, q: 0 },
      forecasting: "Rolling 1-step-ahead re-fit each day",
      split: { trainPct: 80, testPct: 20 },
      preprocessingNote: "Fill date gaps with asfreq('D').interpolate() before fitting",
    },
    randomForest: {
      name: "Random Forest Regressor",
      granularity: "Per-transaction Quantity_Sold",
      config: { n_estimators: 100, random_state: 42, shuffle: false, split: { trainPct: 80, testPct: 20 } },
      temporalFeatures: ["lag_1", "lag_2", "lag_3"] as const,
      target: "Quantity_Sold",
      featureNote: "All encoded columns + lag features, excluding Date and target",
    },
  },
  productsTotals: [
    { product: "Yam", category: "Staple", totalUnits: 4473, spoilageRisk: 0 },
    { product: "Okra", category: "Perishable", totalUnits: 4340, spoilageRisk: 0 },
    { product: "Plantain", category: "Staple", totalUnits: 3874, spoilageRisk: 0 },
    { product: "Cassava", category: "Staple", totalUnits: 3718, spoilageRisk: 0 },
    { product: "Beans", category: "Staple", totalUnits: 3446, spoilageRisk: 0 },
    { product: "Rice", category: "Staple", totalUnits: 2879, spoilageRisk: 0 },
    { product: "Garden Eggs", category: "Perishable", totalUnits: 2579, spoilageRisk: 1 },
    { product: "Fresh Pepper", category: "Perishable", totalUnits: 1909, spoilageRisk: 1 },
    { product: "Tomatoes", category: "Perishable", totalUnits: 1893, spoilageRisk: 1 },
  ] as const,
} as const;

