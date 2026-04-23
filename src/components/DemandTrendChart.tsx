import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { demandTrendData } from "@/lib/mock-data";

export function DemandTrendChart() {
  const [visibleModel, setVisibleModel] = useState<Record<"arima" | "randomForest", boolean>>({
    arima: true,
    randomForest: true,
  });

  const toggleLine = (key: "arima" | "randomForest") => {
    setVisibleModel((v) => ({ ...v, [key]: !v[key] }));
  };

  const splitIndex = Math.floor(demandTrendData.length * 0.8);
  const splitLabel = demandTrendData[splitIndex]?.date ?? "";
  const chartData = demandTrendData.map((point, index) => ({
    ...point,
    train: index < splitIndex ? point.actual : null,
    actualTest: index >= splitIndex ? point.actual : null,
    arimaPred: index >= splitIndex ? point.arima : null,
    randomForestPred: index >= splitIndex ? point.randomForest : null,
  }));

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">Demand Trend Analysis</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          ARIMA rolling 1-step-ahead view with train/test split, plus optional Random Forest comparison.
        </p>
        <div className="flex gap-3 mt-2">
          {[
            { key: "arima" as const, label: "ARIMA Predicted", color: "#be185d" },
            { key: "randomForest" as const, label: "RF Predicted", color: "hsl(var(--chart-2))" },
          ].map((l) => (
            <button
              key={l.key}
              onClick={() => toggleLine(l.key)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                visibleModel[l.key]
                  ? "border-transparent font-medium"
                  : "border-border text-muted-foreground opacity-50"
              }`}
              style={visibleModel[l.key] ? { backgroundColor: l.color, color: "#fff" } : {}}
            >
              {l.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => value.slice(5)}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.32)]}
            />
            <ReferenceLine
              x={splitLabel}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{ value: "Test start", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Math.round(value).toLocaleString()} units`,
                name === "train"
                  ? "Train"
                  : name === "actualTest"
                    ? "Actual (Test)"
                    : name === "arimaPred"
                      ? "ARIMA Predicted"
                      : "RF Predicted",
              ]}
              labelFormatter={(label: string) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
            <Legend verticalAlign="top" align="right" height={24} />
            <Line type="monotone" dataKey="train" name="Train" stroke="#5f9fc2" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="actualTest" name="Actual (Test)" stroke="#111111" strokeWidth={2.4} dot={false} />
            {visibleModel.arima && (
              <Line
                type="monotone"
                dataKey="arimaPred"
                name="ARIMA Predicted"
                stroke="#be185d"
                strokeWidth={2.2}
                strokeDasharray="6 5"
                dot={false}
              />
            )}
            {visibleModel.randomForest && (
              <Line
                type="monotone"
                dataKey="randomForestPred"
                name="RF Predicted"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-3 text-xs text-muted-foreground">
          Action: Increase market stock before payday window (days 25-30) and add weekend buffer quantities to avoid stock-outs.
        </p>
      </CardContent>
    </Card>
  );
}
