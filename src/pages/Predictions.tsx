import { PredictionPanel } from "@/components/PredictionPanel";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Predictions() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-heading font-bold">Predictions</h2>
        <p className="text-sm text-muted-foreground">Transaction-level predictions guided by the Tarkwa report features</p>
      </div>
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">What drives predictions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>
            SmartMarket uses the report’s drivers: <span className="font-medium text-foreground">payday window</span> (days{" "}
            {smartMarketReport.demandDrivers.paydayWindowDays.start}–{smartMarketReport.demandDrivers.paydayWindowDays.end}),{" "}
            <span className="font-medium text-foreground">weekend effects</span>,{" "}
            <span className="font-medium text-foreground">spoilage risk</span>, and{" "}
            <span className="font-medium text-foreground">economic pressure</span> (Fuel + Exchange Rate).
          </div>
        </CardContent>
      </Card>
      <PredictionPanel />
    </div>
  );
}
