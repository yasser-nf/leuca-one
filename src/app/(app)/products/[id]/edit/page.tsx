import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { createClient } from "@/lib/supabase/server";
import { getFxRates } from "@/lib/settings";
import type { Product } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const rates = await getFxRates();

  const [{ data: product }, { data: suppliers }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).maybeSingle(),
    supabase
      .from("suppliers")
      .select("id, name")
      .eq("archived", false)
      .order("name"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <PageHeader title="Modifier le modèle" backHref={`/products/${params.id}`} />
      <ProductForm
        product={product as Product}
        suppliers={suppliers ?? []}
        fxRates={rates}
      />
    </div>
  );
}
