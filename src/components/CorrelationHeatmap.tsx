import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { correlationData } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const variables = ["Qty Sold", "Fuel Price", "Exchange Rate", "Payday", "Weekend", "Season"];

function getColor(value: number) {
  if (value > 0.5) return "hsl(var(--chart-1))";
  if (value > 0.2) return "hsl(174 62% 40% / 0.5)";
  if (value > -0.2) return "hsl(var(--muted))";
  if (value > -0.5) return "hsl(0 72% 55% / 0.4)";
  return "hsl(var(--destructive))";
}

function getCorrelation(x: string, y: string): number {
  if (x === y) return 1;
  const found = correlationData.find(
    (d) => (d.x === x && d.y === y) || (d.x === y && d.y === x)
  );
  return found?.value ?? 0;
}

export function CorrelationHeatmap() {
  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">Correlation Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `100px repeat(${variables.length}, 1fr)` }}>
            <div />
            {variables.map((v) => (
              <div key={v} className="text-[10px] text-muted-foreground text-center font-medium px-1 truncate">
                {v}
              </div>
            ))}
            {variables.map((row) => (
              <>
                <div key={`label-${row}`} className="text-[10px] text-muted-foreground font-medium flex items-center truncate">
                  {row}
                </div>
                {variables.map((col) => {
                  const val = getCorrelation(row, col);
                  return (
                    <Tooltip key={`${row}-${col}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110 min-w-[32px]"
                          style={{ backgroundColor: getColor(val) }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{row} × {col}: <strong>{val.toFixed(2)}</strong></p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground">
          <span>Strong -</span>
          <div className="flex gap-0.5">
            {[-0.8, -0.3, 0, 0.3, 0.8].map((v) => (
              <div key={v} className="h-3 w-6 rounded-sm" style={{ backgroundColor: getColor(v) }} />
            ))}
          </div>
          <span>Strong +</span>
        </div>
      </CardContent>
    </Card>
  );
}
