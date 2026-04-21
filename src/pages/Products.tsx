import { ProductTable } from "@/components/ProductTable";

export default function Products() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold">Products</h2>
        <p className="text-sm text-muted-foreground">Product-level demand insights and performance tracking</p>
      </div>
      <ProductTable />
    </div>
  );
}
