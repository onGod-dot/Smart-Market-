import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { computeStockPlan, type StockPlannerResult } from "@/lib/stock-planner";
import {
  Brain,
  CalendarDays,
  ChevronDown,
  Clipboard,
  Database,
  Info,
  Printer,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmtSignedPct(fraction: number) {
  const pct = fraction * 100;
  const rounded = Math.abs(pct) < 0.05 ? 0 : Math.round(pct * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

function confidenceScore(c: StockPlannerResult["confidence"]) {
  if (c === "High") return 86;
  if (c === "Medium") return 62;
  return 38;
}

function buildPlanText(result: StockPlannerResult) {
  return [
    `SmartMarket — Stock Planning Report`,
    `Commodity: ${result.product} (${result.category})`,
    `Period: ${result.periodLabel} (${result.days} day(s))`,
    ``,
    `Demand Assessment`,
    `- Demand level: ${result.demandLevel}`,
    `- Confidence: ${result.confidence}`,
    `- Weekend days in period: ${result.weekendDaysInPeriod}`,
    `- Payday-window days in period: ${result.paydayDaysInPeriod}`,
    ``,
    `Recommended Procurement`,
    `- Buffered order range: ${result.orderMin.toLocaleString()}–${result.orderMax.toLocaleString()} units`,
    `- Net buy range: ${result.netOrderMin.toLocaleString()}–${result.netOrderMax.toLocaleString()} units`,
    ``,
    `Sales-Boost Rationale`,
    `- Weekend uplift applies because shoppers typically increase market purchases on weekends.`,
    `- Payday uplift applies for days 25–30 when disposable income and basket size historically increase.`,
    `- Peak-month overlap increases likely turnover when commodity demand is seasonally stronger.`,
    ``,
    `Recommended order (buffered): ${result.orderMin.toLocaleString()}–${result.orderMax.toLocaleString()} units`,
    `Net to buy (after stock + lead time): ${result.netOrderMin.toLocaleString()}–${result.netOrderMax.toLocaleString()} units`,
    `Demand: ${result.demandLevel} • Confidence: ${result.confidence}`,
    `Drivers:`,
    `- Baseline: ${result.baselineExpectedUnits.toLocaleString()} units`,
    `- Weekend effect (approx): ${fmtSignedPct(result.weekendBoostPct)}`,
    `- Payday effect (approx): ${fmtSignedPct(result.paydayBoostPct)}`,
    `- Peak seasonality (approx): ${fmtSignedPct(result.peakBoostPct)}`,
    `- Spoilage adjustment: ${fmtSignedPct(result.spoilageAdjustmentPct)}`,
    ``,
    `Notes:`,
    ...result.notes.map((n) => `- ${n}`),
  ].join("\n");
}

export function PredictionPanel() {
  const { toast } = useToast();
  const analyzedProducts = useMemo(() => smartMarketReport.productsTotals.map((p) => p.product), []);
  const productMeta = useMemo(
    () => Object.fromEntries(smartMarketReport.productsTotals.map((p) => [p.product.toLowerCase(), p])),
    [],
  );
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const monthName = (month: number) => new Date(2024, month - 1).toLocaleString("default", { month: "long" });

  const [product, setProduct] = useState(analyzedProducts[0] ?? "");
  const [startMonth, setStartMonth] = useState("1");
  const [startDay, setStartDay] = useState("1");
  const [endMonth, setEndMonth] = useState("4");
  const [endDay, setEndDay] = useState("2");

  const [safetyBufferPct, setSafetyBufferPct] = useState("8");
  const [currentStock, setCurrentStock] = useState("0");
  const [leadTimeDays, setLeadTimeDays] = useState("0");
  const [plannerNotes, setPlannerNotes] = useState("");

  const [result, setResult] = useState<StockPlannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [outputDetailsOpen, setOutputDetailsOpen] = useState(false);
  const [reportBuilt, setReportBuilt] = useState(false);

  const knownCategory = product ? productMeta[product.trim().toLowerCase()]?.category : undefined;
  const runPlan = (buildReport = false) => {
    const normalized = product.trim().toLowerCase();
    const matched = analyzedProducts.find((p) => p.toLowerCase() === normalized);
    if (!matched) {
      const alternatives = analyzedProducts
        .filter((p) => p.toLowerCase().startsWith((product.trim()[0] || "").toLowerCase()))
        .slice(0, 3);
      setResult(null);
      toast({
        variant: "destructive",
        title: "No prior analysis for this product",
        description: `SmartMarket has no Tarkwa report history for “${product.trim() || "Unknown"}”. ${
          alternatives.length ? `Closest known commodities: ${alternatives.join(", ")}.` : `Try one of: ${analyzedProducts.join(", ")}.`
        }`,
      });
      return;
    }

    const sm = Number(startMonth);
    const sd = Number(startDay);
    const em = Number(endMonth);
    const ed = Number(endDay);
    const startDate = new Date(2026, sm - 1, sd);
    const endDate = new Date(2026, em - 1, ed);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || sd < 1 || sd > 31 || ed < 1 || ed > 31) {
      setResult(null);
      toast({ variant: "destructive", title: "Invalid day value", description: "Please choose day values between 1 and 31." });
      return;
    }

    if (startDate > endDate) {
      setResult(null);
      toast({ variant: "destructive", title: "Invalid period range", description: "Start date must be before or equal to end date." });
      return;
    }

    const buffer = Number(safetyBufferPct);
    const stock = Number(currentStock);
    const lead = Number(leadTimeDays);
    if (!Number.isFinite(buffer) || buffer < 0 || buffer > 50) {
      setResult(null);
      toast({ variant: "destructive", title: "Invalid buffer", description: "Safety buffer should be between 0% and 50%." });
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setResult(null);
      toast({ variant: "destructive", title: "Invalid stock on hand", description: "Use 0 or a positive number." });
      return;
    }
    if (!Number.isFinite(lead) || lead < 0 || lead > 60) {
      setResult(null);
      toast({ variant: "destructive", title: "Invalid lead time", description: "Use 0–60 days." });
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      try {
        const plan = computeStockPlan({
          productName: matched,
          start: startDate,
          end: endDate,
          currentStock: stock,
          leadTimeDays: lead,
          safetyBufferPct: buffer,
        });
        setResult(plan);
        setReportBuilt(buildReport);
        setOutputDetailsOpen(buildReport);
      } catch {
        setResult(null);
        toast({ variant: "destructive", title: "Couldn’t build plan", description: "Please try again." });
      } finally {
      setLoading(false);
      }
    }, 350);
  };

  const reset = () => {
    setStartMonth("1");
    setStartDay("1");
    setEndMonth("4");
    setEndDay("2");
    setSafetyBufferPct("8");
    setCurrentStock("0");
    setLeadTimeDays("0");
    setPlannerNotes("");
    setResult(null);
    setReportBuilt(false);
    setOutputDetailsOpen(false);
  };

  const copy = async () => {
    if (!result) return;
    const text = [buildPlanText(result), plannerNotes.trim() ? `\nLocal notes:\n${plannerNotes.trim()}` : ""].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Plan summary copied to your clipboard." });
    } catch {
      toast({ variant: "destructive", title: "Copy failed", description: "Your browser blocked clipboard access." });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="card-shadow lg:col-span-7">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
            Plan inputs
        </CardTitle>
      </CardHeader>
        <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs">Commodity</Label>
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
                {knownCategory && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Category</p>
                    <Badge variant="secondary" className="mt-1">
                      {knownCategory}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

          <div className="space-y-1.5">
              <Label className="text-xs">Start (month / day)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={startMonth} onValueChange={setStartMonth}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={`start-${m}`} value={String(m)}>
                        {monthName(m)}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
                <Input type="number" min={1} max={31} value={startDay} onChange={(e) => setStartDay(e.target.value)} className="h-9" />
              </div>
          </div>

          <div className="space-y-1.5">
              <Label className="text-xs">End (month / day)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={endMonth} onValueChange={setEndMonth}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={`end-${m}`} value={String(m)}>
                        {monthName(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                <Input type="number" min={1} max={31} value={endDay} onChange={(e) => setEndDay(e.target.value)} className="h-9" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-sm font-medium">Payday window boost</p>
              <p className="text-xs text-muted-foreground">
                Locked by dataset: applies to days {smartMarketReport.demandDrivers.paydayWindowDays.start}–{smartMarketReport.demandDrivers.paydayWindowDays.end} in your selected range.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-sm font-medium">Weekend boost</p>
              <p className="text-xs text-muted-foreground">Locked by dataset: scales with weekend-day share in your selected range.</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-medium">Spoilage adjustment</p>
            <p className="text-xs text-muted-foreground">
              Locked by commodity profile: SmartMarket applies spoilage handling automatically for perishable items using historical spoilage behavior.
            </p>
          </div>

          <Separator />

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                <span className="text-sm font-medium">Inventory &amp; buffer</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Safety buffer (%)</Label>
                  <Input value={safetyBufferPct} onChange={(e) => setSafetyBufferPct(e.target.value)} className="h-9" inputMode="decimal" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Current stock (units)</Label>
                  <Input value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="h-9" inputMode="numeric" />
          </div>
          <div className="space-y-1.5">
                  <Label className="text-xs">Lead time (days)</Label>
                  <Input value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} className="h-9" inputMode="numeric" />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button onClick={() => runPlan(false)} disabled={loading} className="min-w-[160px]">
                {loading ? "Predicting..." : "Predict demand"}
              </Button>
              <Button type="button" variant="outline" onClick={() => runPlan(true)} disabled={loading}>
                Build plan report
              </Button>
              <Button type="button" variant="secondary" onClick={reset} disabled={loading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
          </div>
            <p className="text-[11px] text-muted-foreground">Dates are evaluated in 2026 for consistent month/day planning.</p>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-5 space-y-4">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>Grounded in the Tarkwa dataset</AlertTitle>
          <AlertDescription>
            {smartMarketReport.dataset.file} — {smartMarketReport.dataset.rows} rows, {smartMarketReport.dataset.uniqueDates} unique days, window{" "}
            {smartMarketReport.dataset.dateRange.start} → {smartMarketReport.dataset.dateRange.end}.
          </AlertDescription>
        </Alert>

        <Card className="card-shadow" id="stock-planner-print">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Plan output
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Demand prediction summary appears here. Build report for full breakdown.</p>
              </div>
              {result && reportBuilt && (
                <div className="flex gap-2 print:hidden">
                  <Button type="button" size="sm" variant="secondary" onClick={copy}>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result && (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground flex gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Set your commodity and range, then click Predict demand.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{result.product}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{result.periodLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">{result.days} day horizon • Avg {result.avgUnitsPerTransaction.toFixed(1)} units/tx in dataset</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={cn(
                        result.demandLevel === "High" && "bg-emerald-600 hover:bg-emerald-600",
                        result.demandLevel === "Medium" && "bg-amber-500 hover:bg-amber-500",
                        result.demandLevel === "Low" && "bg-rose-600 hover:bg-rose-600",
                      )}
                    >
                      {result.demandLevel} demand
                    </Badge>
                    <Badge variant="secondary">Confidence: {result.confidence}</Badge>
                    {result.category === "Perishable" && <Badge variant="outline">Perishable</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Recommended order (buffered)</p>
                    <p className="text-2xl font-heading font-bold">
                      {result.orderMin.toLocaleString()} – {result.orderMax.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">units</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Net to buy (after stock + lead time)</p>
                    <p className="text-2xl font-heading font-bold">
                      {result.netOrderMin.toLocaleString()} – {result.netOrderMax.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">units</p>
                  </div>
                </div>
                {!reportBuilt && (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    Need the full report? Click <span className="font-medium text-foreground">Build plan report</span> from the left panel.
                  </div>
                )}

                {reportBuilt && (
                <Collapsible open={outputDetailsOpen} onOpenChange={setOutputDetailsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                      <span>{outputDetailsOpen ? "Hide detailed report section" : "Show detailed report section"}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", outputDetailsOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Confidence (heuristic)</span>
                        <span>{confidenceScore(result.confidence)} / 100</span>
                      </div>
                      <Progress value={confidenceScore(result.confidence)} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border p-3 space-y-2">
                        <p className="text-sm font-medium">Baseline &amp; expected</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between gap-3">
                            <span>Baseline (no adjustments)</span>
                            <span className="text-foreground font-medium">{result.baselineExpectedUnits.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span>Expected (all toggles applied)</span>
                            <span className="text-foreground font-medium">{result.expectedUnits.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border p-3 space-y-2">
                        <p className="text-sm font-medium">Driver deltas (approx.)</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between gap-3">
                            <span>Weekend</span>
                            <span className="text-foreground font-medium">{fmtSignedPct(result.weekendBoostPct)}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span>Payday</span>
                            <span className="text-foreground font-medium">{fmtSignedPct(result.paydayBoostPct)}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span>Peak overlap</span>
                            <span className="text-foreground font-medium">{fmtSignedPct(result.peakBoostPct)}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span>Spoilage</span>
                            <span className="text-foreground font-medium">{fmtSignedPct(result.spoilageAdjustmentPct)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3 space-y-3">
                      <p className="text-sm font-medium">Professional report details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                        <div className="rounded-md border p-2">
                          <p className="font-medium text-foreground">Demand level</p>
                          <p className="mt-1">
                            {result.demandLevel} demand, based on dataset-aligned demand banding and period-adjusted expected transaction volume.
                          </p>
                        </div>
                        <div className="rounded-md border p-2">
                          <p className="font-medium text-foreground">Range activity</p>
                          <p className="mt-1">
                            Weekend days: {result.weekendDaysInPeriod} of {result.days}; Payday-window days: {result.paydayDaysInPeriod} of{" "}
                            {result.days}.
                          </p>
                        </div>
                      </div>
                      <div className="rounded-md border p-2 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Why these periods boost sales</p>
                        <p className="mt-1">
                          Weekend periods typically carry higher shopper traffic, while payday-window periods (days{" "}
                          {smartMarketReport.demandDrivers.paydayWindowDays.start}–{smartMarketReport.demandDrivers.paydayWindowDays.end}) historically
                          align with stronger purchasing power. SmartMarket applies both factors proportionally to the selected date range.
                        </p>
                      </div>
                    </div>

                    {result.peakMonthsInPeriod.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <p className="text-sm font-medium">Peak months in range</p>
                        <p className="text-xs text-muted-foreground mt-1">{result.peakMonthsInPeriod.join(", ")}</p>
                      </div>
                    )}

                    <div className="rounded-lg border p-3 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Why these numbers
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                        {result.notes.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Local notes (not used in the math)</Label>
                      <Textarea
                        value={plannerNotes}
                        onChange={(e) => setPlannerNotes(e.target.value)}
                        placeholder="Supplier lead times, promos, known shocks…"
                        className="min-h-[90px] resize-y"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                )}
              </div>
        )}
      </CardContent>
    </Card>
      </div>
    </div>
  );
}
