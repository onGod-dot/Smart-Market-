import { PredictionPanel } from "@/components/PredictionPanel";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Predictions() {
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h2 className="text-2xl font-heading font-bold">Stock Planner</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Build an order plan from Tarkwa transaction patterns: scale baseline demand across your range, then layer payday/weekend/peak effects,
          perishable spoilage, and your own stock/lead time inputs. Market-demand drivers are auto-applied from historical data and are not user-editable.
        </p>
      </div>
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">What drives the plan</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>
            SmartMarket uses the report’s drivers: <span className="font-medium text-foreground">payday window</span> (days{" "}
            {smartMarketReport.demandDrivers.paydayWindowDays.start}–{smartMarketReport.demandDrivers.paydayWindowDays.end}),{" "}
            <span className="font-medium text-foreground">weekend effects</span>,{" "}
            <span className="font-medium text-foreground">commodity peak months</span>,{" "}
            <span className="font-medium text-foreground">spoilage risk</span> (for perishables with elevated spoilage in the data), and operational
            inventory inputs (buffer, stock on hand, lead time).
          </div>
        </CardContent>
      </Card>
      <PredictionPanel />
    </div>
  );
}
