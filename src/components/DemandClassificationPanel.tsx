import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { demandClassification } from "@/lib/mock-data";

export function DemandClassificationPanel() {
  const total = demandClassification.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">Demand Classification</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={demandClassification}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              dataKey="count"
              nameKey="level"
              strokeWidth={2}
              stroke="hsl(var(--card))"
            >
              {demandClassification.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {demandClassification.map((d) => (
            <div key={d.level} className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-muted-foreground">{d.level}</span>
              <span className="font-medium">{Math.round((d.count / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
