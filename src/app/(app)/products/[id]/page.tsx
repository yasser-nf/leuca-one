import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignedImage } from "@/components/signed-image";
import { PriceCnyDzd } from "@/components/price-display";
import { createClient } from "@/lib/supabase/server";
import { getFxRates } from "@/lib/settings";
import { formatUsd } from "@/lib/currency";
import type { Product, ProductStock, StockMovement } from "@/lib/types/database";
import { ArchiveProductButton } from "@/components/products/archive-button";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const rates = await getFxRates();

  const { data: product } = await supabase
    .from("products")
    .select("*, suppliers(id, name)")
    .eq("id", params.id)
    .maybeSingle();

  if (!product) notFound();
  const p = product as Product;

  const [{ data: stockRows }, { data: movements }] = await Promise.all([
    supabase
      .from("product_stock")
      .select("product_id, color, quantity")
      .eq("product_id", p.id),
    supabase
      .from("stock_movements")
      .select("*")
      .eq("product_id", p.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const stock = (stockRows ?? []) as ProductStock[];
  const moves = (movements ?? []) as StockMovement[];

  return (
    <div>
      <PageHeader
        title={p.name}
        subtitle={p.sku}
        backHref="/products"
        action={
          <div className="flex gap-1.5">
            <Button asChild size="sm" variant="outline">
              <Link href={`/products/new?duplicate=${p.id}`}>Dupliquer</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/products/${p.id}/edit`}>Modifier</Link>
            </Button>
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(p.photos ?? []).map((photo, i) => (
          <SignedImage
            key={`${photo}-${i}`}
            path={photo}
            className="h-40 w-40 shrink-0 rounded-xl"
            alt={`${p.name} ${i + 1}`}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3 rounded-xl border border-border/80 bg-card p-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{p.category}</Badge>
          {p.gender ? <Badge variant="outline">{p.gender}</Badge> : null}
          {p.frame_shape ? <Badge variant="outline">{p.frame_shape}</Badge> : null}
          {p.frame_material ? (
            <Badge variant="outline">{p.frame_material}</Badge>
          ) : null}
          <Badge>{p.status}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Prix achat</dt>
            <dd>
              <PriceCnyDzd cny={Number(p.unit_price_cny)} rates={rates} />
            </dd>
          </div>
          {p.unit_price_usd != null ? (
            <div>
              <dt className="text-muted-foreground">USD catalogue</dt>
              <dd>{formatUsd(Number(p.unit_price_usd))}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted-foreground">Poids</dt>
            <dd>{p.unit_weight_g} g</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">MOQ</dt>
            <dd>{p.moq}</dd>
          </div>
          {p.retail_price_dzd != null ? (
            <div>
              <dt className="text-muted-foreground">Prix vente</dt>
              <dd>{Number(p.retail_price_dzd).toLocaleString("fr-DZ")} DZD</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted-foreground">Fournisseur</dt>
            <dd>
              <Link
                href={`/suppliers/${p.supplier_id}`}
                className="text-accent underline"
              >
                {p.suppliers?.name ?? "—"}
              </Link>
            </dd>
          </div>
          {p.colors?.length ? (
            <div className="col-span-2">
              <dt className="text-muted-foreground">Couleurs</dt>
              <dd>{p.colors.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
        <p className="text-xs text-muted-foreground">
          Coût de revient : prix d&apos;achat (frais non inclus — V2).
        </p>
      </div>

      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Stock par couleur</h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/stock?product=${p.id}`}>Mouvement</Link>
          </Button>
        </div>
        {stock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun mouvement encore.</p>
        ) : (
          <ul className="space-y-1.5">
            {stock.map((row) => (
              <li
                key={row.color}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
              >
                <span>{row.color}</span>
                <Badge
                  variant={
                    row.quantity <= p.min_stock_alert ? "destructive" : "secondary"
                  }
                  className="tabular-nums"
                >
                  {row.quantity}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold">Derniers mouvements</h2>
        {moves.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {moves.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
              >
                <span>
                  {m.type} · {m.color}
                </span>
                <span
                  className={
                    m.quantity > 0 ? "text-accent tabular-nums" : "text-destructive tabular-nums"
                  }
                >
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8">
        <ArchiveProductButton id={p.id} status={p.status} />
      </div>
    </div>
  );
}
