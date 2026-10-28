import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { StockActions } from "@/components/stock/stock-actions";
import { StockEntryForm } from "@/components/stock/entry-form";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductStock } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function StockPage({
  searchParams,
}: {
  searchParams: { product?: string };
}) {
  const supabase = createClient();

  const [{ data: products }, { data: stockRows }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku, colors, min_stock_alert, status")
      .neq("status", "Arrêté")
      .order("name"),
    supabase.from("product_stock").select("product_id, color, quantity"),
  ]);

  const productList = (products ?? []) as Pick<
    Product,
    "id" | "name" | "sku" | "colors" | "min_stock_alert" | "status"
  >[];
  const stock = (stockRows ?? []) as ProductStock[];
  const byId = new Map(productList.map((p) => [p.id, p]));

  // Ensure each product×color appears even at 0 if colors defined
  const rowMap = new Map<string, { product_id: string; color: string; quantity: number }>();
  for (const p of productList) {
    for (const color of p.colors ?? []) {
      rowMap.set(`${p.id}::${color}`, {
        product_id: p.id,
        color,
        quantity: 0,
      });
    }
  }
  for (const s of stock) {
    rowMap.set(`${s.product_id}::${s.color}`, s);
  }

  let rows = Array.from(rowMap.values())
    .map((r) => {
      const p = byId.get(r.product_id);
      if (!p) return null;
      return {
        ...r,
        name: p.name,
        sku: p.sku,
        colors: p.colors,
        min_stock_alert: p.min_stock_alert,
      };
    })
    .filter(Boolean) as {
    product_id: string;
    color: string;
    quantity: number;
    name: string;
    sku: string;
    colors: string[];
    min_stock_alert: number;
  }[];

  if (searchParams.product) {
    rows = rows.filter((r) => r.product_id === searchParams.product);
  }

  rows.sort((a, b) => a.name.localeCompare(b.name) || a.color.localeCompare(b.color));

  const lowCount = rows.filter((r) => r.quantity <= r.min_stock_alert).length;

  return (
    <div>
      <PageHeader
        title="Stock"
        subtitle={
          <>
            {rows.length} lignes
            {lowCount > 0 ? (
              <>
                {" "}
                · <Badge variant="destructive">{lowCount} sous seuil</Badge>
              </>
            ) : null}
          </>
        }
      />

      <StockEntryForm
        products={productList.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          colors: p.colors ?? [],
        }))}
      />

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune ligne. Créez des modèles avec des couleurs, puis ajoutez des
          entrées.
        </p>
      ) : (
        <StockActions rows={rows} />
      )}
    </div>
  );
}
