import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedImage } from "@/components/signed-image";
import { createClient } from "@/lib/supabase/server";
import { getFxRate } from "@/lib/settings";
import { PriceCnyDzd } from "@/components/price-display";
import type { Product, Supplier } from "@/lib/types/database";
import { ArchiveSupplierButton } from "@/components/suppliers/archive-button";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const rate = await getFxRate();

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!supplier) notFound();
  const s = supplier as Supplier;

  const { data: products } = await supabase
    .from("products")
    .select("id, sku, name, unit_price_cny, photos, status")
    .eq("supplier_id", s.id)
    .order("created_at", { ascending: false });

  const productList = (products ?? []) as Pick<
    Product,
    "id" | "sku" | "name" | "unit_price_cny" | "photos" | "status"
  >[];

  const contacts = [
    s.wechat && { label: "WeChat", value: s.wechat, href: undefined },
    s.whatsapp && {
      label: "WhatsApp",
      value: s.whatsapp,
      href: `https://wa.me/${s.whatsapp.replace(/\D/g, "")}`,
    },
    s.phone && { label: "Tél", value: s.phone, href: `tel:${s.phone}` },
    s.email && { label: "Email", value: s.email, href: `mailto:${s.email}` },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <div>
      <PageHeader
        title={s.name}
        subtitle={[s.company_name, s.city, s.platform].filter(Boolean).join(" · ")}
        backHref="/suppliers"
        action={
          <Button asChild size="sm" variant="outline">
            <Link href={`/suppliers/${s.id}/edit`}>Modifier</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <SignedImage
          path={s.business_card_front_url}
          bucket="business-cards"
          className="aspect-[3/2] w-full rounded-lg"
          alt="Carte recto"
        />
        <SignedImage
          path={s.business_card_back_url}
          bucket="business-cards"
          className="aspect-[3/2] w-full rounded-lg"
          alt="Carte verso"
        />
      </div>

      <section className="mt-4 space-y-2">
        <h2 className="text-sm font-semibold">Contacts</h2>
        <ul className="space-y-1.5">
          {contacts.map((c) => (
            <li key={c.label} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm border border-border/60">
              <span className="text-muted-foreground">{c.label}</span>
              {c.href ? (
                <a href={c.href} className="font-medium text-accent underline">
                  {c.value}
                </a>
              ) : (
                <span className="font-medium">{c.value}</span>
              )}
            </li>
          ))}
        </ul>
        {s.store_url ? (
          <a
            href={s.store_url}
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-accent underline"
          >
            Boutique en ligne
          </a>
        ) : null}
        {s.rating ? (
          <Badge variant="secondary">Note {s.rating}/5</Badge>
        ) : null}
        {s.notes ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.notes}</p>
        ) : null}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Modèles ({productList.length})</h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/products/new?supplier=${s.id}`}>+ Modèle</Link>
          </Button>
        </div>
        {productList.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun modèle lié.</p>
        ) : (
          <ul className="space-y-2">
            {productList.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border/80 bg-card p-2.5"
                >
                  <SignedImage
                    path={p.photos?.[0]}
                    className="h-12 w-12 rounded-md"
                    alt={p.name}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <PriceCnyDzd cny={Number(p.unit_price_cny)} rate={rate} className="text-xs" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8">
        <ArchiveSupplierButton id={s.id} archived={s.archived} />
      </div>
    </div>
  );
}
