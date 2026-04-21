import { DemandClassificationPanel } from "@/components/DemandClassificationPanel";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DemandAnalysis() {
  const paydayVsNon = [
    { label: "Non‑Payday", avg: smartMarketReport.demandDrivers.findings.nonPaydayAvgUnits, color: "hsl(var(--muted-foreground))" },
    { label: "Payday", avg: smartMarketReport.demandDrivers.findings.paydayAvgUnits, color: "hsl(var(--primary))" },
  ];

  const weekendVsWeekday = [
    { label: "Weekday", avg: smartMarketReport.demandDrivers.findings.weekdayAvgUnits, color: "hsl(var(--muted-foreground))" },
    { label: "Weekend", avg: smartMarketReport.demandDrivers.findings.weekendAvgUnits, color: "hsl(var(--primary))" },
  ];

  const seasonAvg = [
    { label: "Dry", avg: smartMarketReport.seasonality.findings.drySeasonAvgUnits, color: "hsl(var(--primary))" },
    { label: "Rainy", avg: smartMarketReport.seasonality.findings.rainySeasonAvgUnits, color: "hsl(var(--chart-2))" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Demand Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Key drivers: payday cycles (+{smartMarketReport.demandDrivers.findings.paydayLiftPct}%), weekends (+{smartMarketReport.demandDrivers.findings.weekendLiftPct}%), and spoilage risk (−{smartMarketReport.demandDrivers.findings.spoilageReductionPct}%).
        </p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">Average demand comparisons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium">Payday vs Non‑Payday</div>
              <div className="text-xs text-muted-foreground">
                +{smartMarketReport.demandDrivers.findings.paydayLiftPct}% during days {smartMarketReport.demandDrivers.paydayWindowDays.start}–{smartMarketReport.demandDrivers.paydayWindowDays.end}
              </div>
              <div className="mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paydayVsNon} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--accent))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="avg" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                      {paydayVsNon.map((d) => (
                        <Cell key={d.label} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium">Weekend vs Weekdays</div>
              <div className="text-xs text-muted-foreground">+{smartMarketReport.demandDrivers.findings.weekendLiftPct}% weekend lift</div>
              <div className="mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekendVsWeekday} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--accent))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="avg" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                      {weekendVsWeekday.map((d) => (
                        <Cell key={d.label} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium">Dry vs Rainy season</div>
              <div className="text-xs text-muted-foreground">{smartMarketReport.seasonality.findings.note}</div>
              <div className="mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonAvg} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--accent))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="avg" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                      {seasonAvg.map((d) => (
                        <Cell key={d.label} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">Demand level thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="text-sm font-medium">Low</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Units per transaction</div>
              <div className="text-lg font-heading font-bold">≤ {smartMarketReport.demandLevels.thresholds.lowMax}</div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
                <span className="text-sm font-medium">Medium</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Units per transaction</div>
              <div className="text-lg font-heading font-bold">
                {smartMarketReport.demandLevels.thresholds.mediumMin}–{smartMarketReport.demandLevels.thresholds.mediumMax}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-sm font-medium">High</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Units per transaction</div>
              <div className="text-lg font-heading font-bold">≥ {smartMarketReport.demandLevels.thresholds.highMin}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DemandClassificationPanel />
        <FeatureImportanceChart />
      </div>
    </div>
  );
}
