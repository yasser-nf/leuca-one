import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignedImage } from "@/components/signed-image";
import { PriceCnyDzd } from "@/components/price-display";
import { createClient } from "@/lib/supabase/server";
import { getFxRates } from "@/lib/settings";
import type { Product, ProductStock } from "@/lib/types/database";
import { ProductFilters } from "@/components/products/product-filters";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    category?: string;
    supplier?: string;
    status?: string;
    material?: string;
    shape?: string;
  };
}) {
  const supabase = createClient();
  const rates = await getFxRates();

  let query = supabase
    .from("products")
    .select("*, suppliers(id, name)")
    .order("created_at", { ascending: false });

  if (searchParams.category) query = query.eq("category", searchParams.category);
  if (searchParams.supplier) query = query.eq("supplier_id", searchParams.supplier);
  if (searchParams.status) query = query.eq("status", searchParams.status);
  else query = query.neq("status", "Arrêté");
  if (searchParams.material) query = query.eq("frame_material", searchParams.material);
  if (searchParams.shape) query = query.eq("frame_shape", searchParams.shape);
  if (searchParams.q) {
    query = query.or(
      `name.ilike.%${searchParams.q}%,sku.ilike.%${searchParams.q}%`
    );
  }

  const [{ data: products }, { data: suppliers }, { data: stockRows }] =
    await Promise.all([
      query,
      supabase.from("suppliers").select("id, name").eq("archived", false).order("name"),
      supabase.from("product_stock").select("product_id, color, quantity"),
    ]);

  const list = (products ?? []) as Product[];
  const stock = (stockRows ?? []) as ProductStock[];
  const stockByProduct = new Map<string, number>();
  for (const row of stock) {
    stockByProduct.set(
      row.product_id,
      (stockByProduct.get(row.product_id) ?? 0) + row.quantity
    );
  }

  return (
    <div>
      <PageHeader
        title="Modèles"
        subtitle={`${list.length} modèles`}
        action={
          <Button asChild size="sm">
            <Link href="/products/new">
              <Plus className="mr-1 h-4 w-4" />
              Ajouter
            </Link>
          </Button>
        }
      />

      <Suspense fallback={null}>
        <ProductFilters suppliers={suppliers ?? []} />
      </Suspense>

      {list.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Aucun modèle.</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/products/new">Créer le premier</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {list.map((p) => {
            const qty = stockByProduct.get(p.id) ?? 0;
            const low = qty <= p.min_stock_alert;
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="overflow-hidden rounded-xl border border-border/80 bg-card transition hover:border-accent/40"
              >
                <SignedImage
                  path={p.photos?.[0]}
                  className="aspect-square w-full"
                  alt={p.name}
                />
                <div className="space-y-1 p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {p.name}
                    </p>
                    <Badge
                      variant={low ? "destructive" : "secondary"}
                      className="shrink-0 tabular-nums"
                    >
                      {qty}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                  <PriceCnyDzd
                    cny={Number(p.unit_price_cny)}
                    rates={rates}
                    className="block text-xs"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
