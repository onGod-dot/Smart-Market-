import { DemandTrendChart } from "@/components/DemandTrendChart";
import { KPICard } from "@/components/KPICard";
import { kpiData } from "@/lib/mock-data";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";

export default function Forecasting() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Forecasting</h2>
        <p className="text-sm text-muted-foreground">
          Dual-model system: ARIMA for daily totals, Random Forest for per-transaction predictions (Tarkwa dataset).
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard title="7-Day Forecast" value={kpiData.forecastedDemand7d.toLocaleString()} icon={Calendar} trend={{ value: 1.8, positive: true }} />
        <KPICard title="Payday Lift" value={`${smartMarketReport.demandDrivers.findings.paydayLiftPct}%`} icon={TrendingUp} trend={{ value: smartMarketReport.demandDrivers.findings.paydayLiftPct, positive: true }} />
      </div>
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">How it’s implemented</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>
            <span className="font-medium text-foreground">ARIMA</span>: ARIMA({smartMarketReport.models.arima.config.p},{smartMarketReport.models.arima.config.d},{smartMarketReport.models.arima.config.q}) on aggregated daily totals using{" "}
            <span className="font-medium text-foreground">{smartMarketReport.models.arima.forecasting}</span>.
          </div>
          <div>
            <span className="font-medium text-foreground">Random Forest</span>: {smartMarketReport.models.randomForest.config.n_estimators} trees with lag features{" "}
            {smartMarketReport.models.randomForest.temporalFeatures.join(", ")} for transaction-level Quantity_Sold.
          </div>
        </CardContent>
      </Card>
      <DemandTrendChart />
    </div>
  );
}
