import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { createClient } from "@/lib/supabase/server";
import { getFxRate } from "@/lib/settings";
import type { Product } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { supplier?: string; duplicate?: string };
}) {
  const supabase = createClient();
  const rate = await getFxRate();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("archived", false)
    .order("name");

  let duplicateFrom: Product | undefined;
  if (searchParams.duplicate) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", searchParams.duplicate)
      .maybeSingle();
    if (data) duplicateFrom = data as Product;
  }

  return (
    <div>
      <PageHeader
        title={duplicateFrom ? "Dupliquer le modèle" : "Nouveau modèle"}
        subtitle="Photo d'abord, puis fiche"
        backHref="/products"
      />
      <ProductForm
        suppliers={suppliers ?? []}
        fxRate={rate}
        defaultSupplierId={searchParams.supplier}
        duplicateFrom={duplicateFrom}
      />
    </div>
  );
}
