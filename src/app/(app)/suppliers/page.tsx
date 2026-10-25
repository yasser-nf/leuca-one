import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignedImage } from "@/components/signed-image";
import { createClient } from "@/lib/supabase/server";
import type { Supplier } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("*")
    .eq("archived", false)
    .order("name");

  const suppliers = (data ?? []) as Supplier[];

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        subtitle={`${suppliers.length} actifs`}
        action={
          <Button asChild size="sm">
            <Link href="/suppliers/new">
              <Plus className="mr-1 h-4 w-4" />
              Ajouter
            </Link>
          </Button>
        }
      />

      {suppliers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Aucun fournisseur encore.</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/suppliers/new">Créer le premier</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {suppliers.map((s) => (
            <li key={s.id}>
              <Link
                href={`/suppliers/${s.id}`}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3 transition hover:border-accent/40"
              >
                <SignedImage
                  path={s.business_card_front_url}
                  bucket="business-cards"
                  className="h-14 w-14 rounded-lg"
                  alt={s.name}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[s.city, s.platform, s.contact_person].filter(Boolean).join(" · ") ||
                      "—"}
                  </p>
                </div>
                {s.rating ? (
                  <Badge variant="secondary" className="tabular-nums">
                    {s.rating}/5
                  </Badge>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
