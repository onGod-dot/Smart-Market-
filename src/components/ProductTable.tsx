import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { productsData } from "@/lib/mock-data";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Search } from "lucide-react";
import AnimatedList from "@/components/AnimatedList";

const demandBadgeClass: Record<"High" | "Medium" | "Low", string> = {
  High: "bg-success text-success-foreground border-success/30",
  Medium: "bg-warning text-warning-foreground border-warning/30",
  Low: "bg-destructive text-destructive-foreground border-destructive/30",
};

const commodityImageMap: Record<string, string> = {
  yam: "/commodities/yam.png",
  okra: "/commodities/okra.png",
  plantain: "/commodities/plantain.png",
  cassava: "/commodities/cassava.png",
  beans: "/commodities/beans.png",
  rice: "/commodities/rice.png",
  "garden eggs": "/commodities/garden-eggs.png",
  "fresh pepper": "/commodities/fresh-pepper.png",
  tomatoes: "/commodities/tomatoes.png",
};

export function ProductTable() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const categories = ["All", ...new Set(productsData.map((p) => p.category))];

  const filtered = productsData.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const selectedProduct = filtered[selectedIndex] ?? filtered[0] ?? null;
  const selectedProductImage = selectedProduct ? commodityImageMap[selectedProduct.name.toLowerCase()] : undefined;
  const peakMonthsByProduct = Object.fromEntries(
    smartMarketReport.commodityPeakMonths.map((p) => [p.product.toLowerCase(), p.peakMonths])
  ) as Record<string, readonly number[]>;
  const monthName = (month: number) => new Date(2024, month - 1).toLocaleString("default", { month: "short" });
  const listItems = filtered.map((p) => p.name);

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">Product-Level Insights</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  categoryFilter === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-xl border bg-card p-2">
            <AnimatedList
              items={listItems}
              onItemSelect={(_, index) => setSelectedIndex(index)}
              showGradients={true}
              enableArrowNavigation={true}
              itemClassName="cursor-target"
              displayScrollbar={true}
              initialSelectedIndex={0}
            />
          </div>
          <div className="lg:col-span-2 rounded-xl border bg-card p-4">
            {selectedProduct ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Selected commodity</p>
                <p className="text-lg font-heading font-bold">{selectedProduct.name}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedProduct.category}</Badge>
                  <Badge className={demandBadgeClass[selectedProduct.demandLevel]}>{selectedProduct.demandLevel} Demand</Badge>
                </div>
                <div className="rounded-lg bg-accent/50 border border-accent p-3">
                  <p className="text-xs text-muted-foreground">Average sales</p>
                  <p className="text-2xl font-heading font-bold">{selectedProduct.avgSales.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">units</p>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Peak month(s)</p>
                  <p className="text-sm font-medium">
                    {(peakMonthsByProduct[selectedProduct.name.toLowerCase()] ?? []).map(monthName).join(", ") || "Not available"}
                  </p>
                </div>
                <p className="text-sm">
                  Trend:{" "}
                  {selectedProduct.trend === "up" ? (
                    <span className="text-success font-medium">Increasing ↑</span>
                  ) : (
                    <span className="text-destructive font-medium">Decreasing ↓</span>
                  )}
                </p>
                {selectedProductImage && (
                  <img
                    src={selectedProductImage}
                    alt={selectedProduct.name}
                    className="w-full h-44 object-cover rounded-md"
                    loading="lazy"
                  />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No product matches your current filters.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
