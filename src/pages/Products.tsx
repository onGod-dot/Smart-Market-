import { ProductTable } from "@/components/ProductTable";

export default function Products() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Commodity Monitor</h2>
        <p className="text-sm text-muted-foreground">Browse commodity demand patterns, trends, and peak months.</p>
      </div>
      <ProductTable />
    </div>
  );
}
