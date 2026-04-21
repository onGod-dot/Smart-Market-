import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { demandTrendData } from "@/lib/mock-data";

const lines = [
  { key: "actual", label: "Actual", color: "hsl(var(--chart-1))" },
  { key: "randomForest", label: "Random Forest", color: "hsl(var(--chart-2))" },
  { key: "arima", label: "ARIMA", color: "hsl(var(--chart-3))" },
];

export function DemandTrendChart() {
  const [visible, setVisible] = useState<Record<string, boolean>>({
    actual: true,
    randomForest: true,
    arima: true,
  });

  const toggleLine = (key: string) => {
    setVisible((v) => ({ ...v, [key]: !v[key] }));
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">Demand Trend Analysis</CardTitle>
        <div className="flex gap-3 mt-2">
          {lines.map((l) => (
            <button
              key={l.key}
              onClick={() => toggleLine(l.key)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                visible[l.key]
                  ? "border-transparent font-medium"
                  : "border-border text-muted-foreground opacity-50"
              }`}
              style={visible[l.key] ? { backgroundColor: l.color, color: "#fff" } : {}}
            >
              {l.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={demandTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
            {lines.map(
              (l) =>
                visible[l.key] && (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    stroke={l.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
