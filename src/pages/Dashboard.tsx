import { KPICard } from "@/components/KPICard";
import { DemandTrendChart } from "@/components/DemandTrendChart";
import { DemandClassificationPanel } from "@/components/DemandClassificationPanel";
import { ProductTable } from "@/components/ProductTable";
import { kpiData } from "@/lib/mock-data";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { ShoppingCart, TrendingUp, Package, Percent, Calendar } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">
          Driven by the Tarkwa market report ({smartMarketReport.dataset.rows} transactions, {smartMarketReport.dataset.uniqueDates} trading days;{" "}
          {smartMarketReport.dataset.dateRange.start} to {smartMarketReport.dataset.dateRange.end})
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DemandTrendChart />
        </div>
        <DemandClassificationPanel />
      </div>

      <ProductTable />
    </div>
  );
}
