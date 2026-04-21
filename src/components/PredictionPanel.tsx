import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Brain } from "lucide-react";

export function PredictionPanel() {
  const { toast } = useToast();
  const analyzedProducts = smartMarketReport.productsTotals.map((p) => p.product);

  const [product, setProduct] = useState(analyzedProducts[0] ?? "");
  const [result, setResult] = useState<{ quantity: number; level: "Low" | "Medium" | "High"; product: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    const normalized = product.trim().toLowerCase();
    const matched = analyzedProducts.find((p) => p.toLowerCase() === normalized);
    if (!matched) {
      setResult(null);
      toast({
        variant: "destructive",
        title: "No prior analysis for this product",
        description: `SmartMarket has no Tarkwa report history for “${product.trim() || "Unknown"}”. Try one of: ${analyzedProducts.join(", ")}.`,
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setResult({
        quantity: Math.round(800 + Math.random() * 600),
        level: (["Low", "Medium", "High"] as const)[Math.floor(Math.random() * 3)],
        product: matched,
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Prediction Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Product</Label>
            <Input
              list="smartmarket-products"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g., Yam"
              className="h-9"
            />
            <datalist id="smartmarket-products">
              {analyzedProducts.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select defaultValue="grains">
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grains">Grains</SelectItem>
                <SelectItem value="oils">Oils</SelectItem>
                <SelectItem value="sweeteners">Sweeteners</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Month</Label>
            <Select defaultValue="6">
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {new Date(2024, i).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Day of Week</Label>
            <Select defaultValue="mon">
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                  <SelectItem key={d} value={d.toLowerCase().slice(0, 3)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fuel Price</Label>
            <Input type="number" placeholder="e.g., 650" defaultValue="650" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Exchange Rate</Label>
            <Input type="number" placeholder="e.g., 1550" defaultValue="1550" className="h-9" />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Switch id="payday" />
            <Label htmlFor="payday" className="text-xs">Is Payday</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="weekend" />
            <Label htmlFor="weekend" className="text-xs">Is Weekend</Label>
          </div>
        </div>
        <Button onClick={handlePredict} className="w-full" disabled={loading}>
          {loading ? "Predicting..." : "Predict Demand"}
        </Button>

        {result && (
          <div className="p-4 rounded-lg bg-accent/50 border border-accent-foreground/10 animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">Prediction Result</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{result.product}</p>
                <p className="text-2xl font-heading font-bold">{result.quantity}</p>
                <p className="text-xs text-muted-foreground">units predicted</p>
              </div>
              <Badge variant={result.level === "High" ? "default" : result.level === "Medium" ? "secondary" : "destructive"}>
                {result.level} Demand
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
