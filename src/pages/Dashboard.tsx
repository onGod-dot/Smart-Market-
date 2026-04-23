import { useEffect, useRef, useState } from "react";
import { KPICard } from "@/components/KPICard";
import { ProductTable } from "@/components/ProductTable";
import { kpiData } from "@/lib/mock-data";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingUp, Package, Percent, Calendar } from "lucide-react";

export default function Dashboard() {
  const topCommodity = smartMarketReport.productsTotals[0]?.product ?? "Yam";
  const actionCards = [
    {
      title: "Increase stock in payday window",
      summary: `Demand rises by about ${smartMarketReport.demandDrivers.findings.paydayLiftPct}% on days 25-30.`,
      detail: "Prepare higher inventory two days before the 25th to avoid late restocking pressure.",
      Icon: Calendar,
    },
    {
      title: "Plan extra weekend supply",
      summary: `Weekend demand is typically ${smartMarketReport.demandDrivers.findings.weekendLiftPct}% higher than weekdays.`,
      detail: "Top up fast-moving staples by Friday evening and keep a reserve buffer for Sunday.",
      Icon: Percent,
    },
    {
      title: "Reduce high spoilage quantities",
      summary: `High-spoilage products average ${smartMarketReport.demandDrivers.findings.spoilageReductionPct}% lower sales.`,
      detail: "Use smaller, more frequent purchase batches for tomatoes, pepper, and garden eggs.",
      Icon: Package,
    },
    {
      title: "Prioritize top commodity",
      summary: `${topCommodity} currently leads the demand ranking in the Tarkwa dataset.`,
      detail: "Set reorder threshold alerts higher for this commodity during payday and weekends.",
      Icon: ShoppingCart,
    },
  ];
  const [activeAction, setActiveAction] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveAction((prev) => (prev + 1) % actionCards.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [actionCards.length]);

  useEffect(() => {
    const slider = sliderRef.current;
    const target = actionRefs.current[activeAction];
    if (!slider || !target) return;

    slider.scrollTo({
      left: Math.max(0, target.offsetLeft - 8),
      behavior: "smooth",
    });
  }, [activeAction]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Market Overview</h2>
        <p className="text-sm text-muted-foreground">
          Driven by the Tarkwa market report ({smartMarketReport.dataset.rows} transactions, {smartMarketReport.dataset.uniqueDates} trading days;{" "}
          {smartMarketReport.dataset.dateRange.start} to {smartMarketReport.dataset.dateRange.end})
        </p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">Today's Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Slide left to right and tap a card to focus action details.</p>
          <div ref={sliderRef} className="overflow-x-auto pb-2 scroll-smooth no-scrollbar">
            <div className="flex gap-4 min-w-max">
              {actionCards.map((action, index) => {
                const isActive = activeAction === index;
                const Icon = action.Icon;
                return (
                  <button
                    key={action.title}
                    type="button"
                    ref={(el) => {
                      actionRefs.current[index] = el;
                    }}
                    onClick={() => setActiveAction(index)}
                    className={`w-[340px] md:w-[420px] rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-primary/45 bg-primary/10 shadow-md"
                        : "border-border bg-card hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-11 w-11 rounded-full border-2 flex items-center justify-center ${
                        isActive ? "border-primary bg-primary/15" : "border-border bg-background"
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{action.summary}</p>
                        {isActive && <p className="text-xs text-foreground/85 mt-2">{action.detail}</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Qty Sold"
          value={kpiData.totalQuantitySold.toLocaleString()}
          icon={ShoppingCart}
        />
        <KPICard
          title="Avg Daily Demand"
          value={kpiData.avgDailyDemand.toLocaleString()}
          icon={TrendingUp}
        />
        <KPICard
          title="Payday Lift (25–30)"
          value={`${smartMarketReport.demandDrivers.findings.paydayLiftPct}%`}
          icon={Calendar}
          trend={{ value: smartMarketReport.demandDrivers.findings.paydayLiftPct, positive: true }}
          subtitle="avg demand uplift"
        />
        <KPICard
          title="Weekend Lift"
          value={`${smartMarketReport.demandDrivers.findings.weekendLiftPct}%`}
          icon={Percent}
          trend={{ value: smartMarketReport.demandDrivers.findings.weekendLiftPct, positive: true }}
          subtitle="Sat/Sun vs weekdays"
        />
        <KPICard
          title="Spoilage Impact"
          value={`-${smartMarketReport.demandDrivers.findings.spoilageReductionPct}%`}
          icon={Package}
          trend={{ value: smartMarketReport.demandDrivers.findings.spoilageReductionPct, positive: false }}
          subtitle="high-risk products"
        />
      </div>

      <ProductTable />
    </div>
  );
}
