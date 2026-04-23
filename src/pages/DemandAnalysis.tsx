import { useEffect, useMemo, useState } from "react";
import { smartMarketReport } from "@/lib/tarkwa-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function DemandAnalysis() {
  const [selectedCommodity, setSelectedCommodity] = useState(smartMarketReport.productsTotals[0]?.product ?? "");
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

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

  const monthName = (month: number) => new Date(2024, month - 1).toLocaleString("default", { month: "short" });

  const commodityInsights = useMemo(() => {
    const mapped = smartMarketReport.productsTotals.map((p) => {
      const peaks = smartMarketReport.commodityPeakMonths.find((m) => m.product.toLowerCase() === p.product.toLowerCase())?.peakMonths ?? [];
      const isPerishable = p.category === "Perishable";
      const spoilageRisk = p.spoilageRisk === 1 ? "High" : isPerishable ? "Moderate" : "Low";
      const paydayEffect = Math.max(0, smartMarketReport.demandDrivers.findings.paydayLiftPct - (p.spoilageRisk === 1 ? 7 : 0));
      const weekendEffect = Math.max(0, smartMarketReport.demandDrivers.findings.weekendLiftPct - (p.spoilageRisk === 1 ? 3 : 0));
      const seasonalEffect =
        peaks.length > 0
          ? `Peak demand in ${peaks.map(monthName).join(", ")}; lift expected when planning around those months.`
          : "No strong seasonal peak months captured in this report window.";

      return {
        ...p,
        image: commodityImageMap[p.product.toLowerCase()],
        peaks,
        spoilageRisk,
        paydayEffect,
        weekendEffect,
        seasonalEffect,
      };
    });

    // Interleave Staple and Perishable commodities to make category differences visible while sliding.
    const staples = mapped.filter((m) => m.category === "Staple");
    const perishables = mapped.filter((m) => m.category === "Perishable");
    const mixed: typeof mapped = [];
    const maxLen = Math.max(staples.length, perishables.length);
    for (let i = 0; i < maxLen; i += 1) {
      if (staples[i]) mixed.push(staples[i]);
      if (perishables[i]) mixed.push(perishables[i]);
    }
    return mixed;
  }, []);

  const selectedCommodityData =
    commodityInsights.find((item) => item.product.toLowerCase() === selectedCommodity.toLowerCase()) ?? commodityInsights[0];

  useEffect(() => {
    if (!carouselApi) return;
    const timer = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 2800);
    return () => window.clearInterval(timer);
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      const idx = carouselApi.selectedScrollSnap();
      setSelectedIdx(idx);
      const item = commodityInsights[idx];
      if (item) setSelectedCommodity(item.product);
    };
    onSelect();
    carouselApi.on("select", onSelect);
    return () => carouselApi.off("select", onSelect);
  }, [carouselApi, commodityInsights]);


  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Demand Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Key drivers: payday cycles (+{smartMarketReport.demandDrivers.findings.paydayLiftPct}%), weekends (+{smartMarketReport.demandDrivers.findings.weekendLiftPct}%), and spoilage risk (−{smartMarketReport.demandDrivers.findings.spoilageReductionPct}%).
        </p>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">Commodity impact explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-3">
                Slide through commodities and click any card to inspect spoilage risk, payday effect, weekend effect, and seasonal impact.
              </p>
              <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent>
                  {commodityInsights.map((item, idx) => (
                    <CarouselItem key={item.product} className="basis-1/1 sm:basis-1/2 xl:basis-1/3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCommodity(item.product);
                          setSelectedIdx(idx);
                          carouselApi?.scrollTo(idx);
                        }}
                        className={`w-full text-left rounded-xl border overflow-hidden transition-all ${
                          selectedCommodityData?.product === item.product
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="h-36 w-full bg-muted/40">
                          <img
                            src={item.image}
                            alt={item.product}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm">{item.product}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-3 top-[42%]" />
                <CarouselNext className="-right-3 top-[42%]" />
              </Carousel>
              <p className="mt-3 text-xs text-muted-foreground">
                {selectedIdx + 1} / {commodityInsights.length} commodities
              </p>
            </div>

            <div className="lg:col-span-5 rounded-xl border bg-card p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Selected commodity</p>
                <p className="text-lg font-heading font-bold">{selectedCommodityData.product}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selectedCommodityData.category}</Badge>
                <Badge variant={selectedCommodityData.spoilageRisk === "High" ? "destructive" : "outline"}>
                  Spoilage risk: {selectedCommodityData.spoilageRisk}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Pay effect</p>
                  <p className="text-xl font-heading font-bold">+{selectedCommodityData.paydayEffect.toFixed(1)}%</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Applied around days {smartMarketReport.demandDrivers.paydayWindowDays.start}–{smartMarketReport.demandDrivers.paydayWindowDays.end}.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Weekend effect</p>
                  <p className="text-xl font-heading font-bold">+{selectedCommodityData.weekendEffect.toFixed(1)}%</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Lift observed when demand falls on Saturday/Sunday market activity.</p>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Seasonal effect</p>
                <p className="text-sm mt-1">{selectedCommodityData.seasonalEffect}</p>
                {selectedCommodityData.peaks.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">Peak months: {selectedCommodityData.peaks.map(monthName).join(", ")}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
