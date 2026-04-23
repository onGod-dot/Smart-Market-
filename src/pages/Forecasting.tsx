import { useState } from "react";
import { KPICard } from "@/components/KPICard";
import { kpiData } from "@/lib/mock-data";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, TrendingUp } from "lucide-react";

const monthName = (month: number) => new Date(2024, month - 1).toLocaleString("default", { month: "short" });

export default function Forecasting() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [activeCommodity, setActiveCommodity] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredCommodities = smartMarketReport.commodityPeakMonths.filter((item) => {
    const matchesSearch = item.product.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = selectedMonth === null || item.peakMonths.includes(selectedMonth);
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Demand Outlook</h2>
        <p className="text-sm text-muted-foreground">
          Weekly and monthly demand outlook for better stock planning in Tarkwa market.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard title="7-Day Forecast" value={kpiData.forecastedDemand7d.toLocaleString()} icon={Calendar} trend={{ value: 1.8, positive: true }} />
        <KPICard title="Payday Lift" value={`${smartMarketReport.demandDrivers.findings.paydayLiftPct}%`} icon={TrendingUp} trend={{ value: smartMarketReport.demandDrivers.findings.paydayLiftPct, positive: true }} />
      </div>
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">Commodity peak months</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Total commodities</p>
              <p className="text-xl font-heading font-bold">{smartMarketReport.commodityPeakMonths.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Filtered view</p>
              <p className="text-xl font-heading font-bold">{filteredCommodities.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Selected month</p>
              <p className="text-xl font-heading font-bold">{selectedMonth ? monthName(selectedMonth) : "All"}</p>
            </div>
          </div>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commodity..."
            className="h-10"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedMonth(null)}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                selectedMonth === null ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              All months
            </button>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                  selectedMonth === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {monthName(m)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCommodities.map((item) => {
              const matchesSelected = selectedMonth === null || item.peakMonths.includes(selectedMonth);
              const isActive = activeCommodity === item.product;
              return (
                <button
                  key={item.product}
                  type="button"
                  onClick={() => setActiveCommodity(isActive ? null : item.product)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    matchesSelected ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "border-border bg-card/50 opacity-65"
                  } ${isActive ? "ring-2 ring-primary/35" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold">{item.product}</div>
                    {matchesSelected ? (
                      <Badge variant="default">High Peak Sales</Badge>
                    ) : (
                      <Badge variant="secondary">Out of range</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.peakMonths.map((month) => (
                      <span
                        key={`${item.product}-${month}`}
                        className={`text-[11px] px-2 py-1 rounded-full border ${
                          selectedMonth === month
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border"
                        }`}
                      >
                        {monthName(month)}
                      </span>
                    ))}
                  </div>
                  {isActive && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Peak month{item.peakMonths.length > 1 ? "s" : ""}: {item.peakMonths.map(monthName).join(", ")}.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          {filteredCommodities.length === 0 && (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No commodities match your current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
