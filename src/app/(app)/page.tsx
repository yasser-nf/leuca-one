import Link from "next/link";
import { AlertTriangle, Package, Users, Boxes } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getFxRates } from "@/lib/settings";
import { cnyToDzd, dzdToUsd, formatDzd, formatUsd } from "@/lib/currency";
import type { Product, ProductStock } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const rates = await getFxRates();
  const rate = rates.cnyDzd;

  const [
    { count: productCount },
    { count: supplierCount },
    { data: products },
    { data: stockRows },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .neq("status", "Arrêté"),
    supabase
      .from("suppliers")
      .select("*", { count: "exact", head: true })
      .eq("archived", false),
    supabase
      .from("products")
      .select("id, sku, name, unit_price_cny, min_stock_alert, photos, status")
      .neq("status", "Arrêté"),
    supabase.from("product_stock").select("product_id, color, quantity"),
  ]);

  const stock = (stockRows ?? []) as ProductStock[];
  const productList = (products ?? []) as Pick<
    Product,
    "id" | "sku" | "name" | "unit_price_cny" | "min_stock_alert" | "photos" | "status"
  >[];

  const piecesInStock = stock.reduce((sum, row) => sum + (row.quantity || 0), 0);

  const stockByProduct = new Map<string, number>();
  for (const row of stock) {
    stockByProduct.set(
      row.product_id,
      (stockByProduct.get(row.product_id) ?? 0) + row.quantity
    );
  }

  let stockValueDzd = 0;
  for (const p of productList) {
    const qty = stockByProduct.get(p.id) ?? 0;
    stockValueDzd += cnyToDzd(Number(p.unit_price_cny), rate) * qty;
  }

  const lowStock = productList
    .map((p) => ({
      ...p,
      qty: stockByProduct.get(p.id) ?? 0,
    }))
    .filter((p) => p.qty <= p.min_stock_alert)
    .sort((a, b) => a.qty - b.qty)
    .slice(0, 8);

  const stats = [
    {
      label: "Modèles actifs",
      value: productCount ?? 0,
      icon: Package,
      href: "/products",
    },
    {
      label: "Fournisseurs",
      value: supplierCount ?? 0,
      icon: Users,
      href: "/suppliers",
    },
    {
      label: "Pièces en stock",
      value: piecesInStock,
      icon: Boxes,
      href: "/stock",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle={`CNY→DZD ${rates.cnyDzd} · CNY→USD ${rates.cnyUsd}`}
      />

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="h-full border-border/80 shadow-none transition hover:border-accent/40">
                <CardContent className="space-y-2 p-3">
                  <Icon className="h-4 w-4 text-accent" />
                  <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-3 border-border/80 shadow-none">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base">Valeur du stock</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-2xl font-semibold tabular-nums">
            {formatDzd(stockValueDzd)}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
            ≈ {formatUsd(dzdToUsd(stockValueDzd, rates))}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Prix d&apos;achat CNY × taux settings (frais non inclus — V2).
          </p>
        </CardContent>
      </Card>

      <section className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold">Sous le seuil d&apos;alerte</h2>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun modèle sous le seuil.</p>
        ) : (
          <ul className="space-y-2">
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border/80 bg-card p-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.photos?.[0] ? `/api/signed-url?path=${encodeURIComponent(p.photos[0])}&bucket=products` : "/placeholder-product.svg"}
                    alt=""
                    className="h-12 w-12 rounded-md object-cover bg-muted"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <Badge variant="destructive" className="tabular-nums">
                    {p.qty}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
