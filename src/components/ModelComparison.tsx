import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { modelPerformance } from "@/lib/mock-data";

export function ModelComparison() {
  const models = [
    { name: "Random Forest", ...modelPerformance.randomForest, color: "hsl(var(--chart-2))" },
    { name: "ARIMA", ...modelPerformance.arima, color: "hsl(var(--chart-3))" },
  ];

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">Model Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {models.map((m) => (
            <div key={m.name} className="p-4 rounded-lg border bg-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                <p className="font-heading font-semibold text-sm">{m.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">MAE</span>
                  <span className="font-heading font-bold text-lg">{m.mae}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">R² Score</span>
                  <span className="font-heading font-bold text-lg">{m.r2}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
