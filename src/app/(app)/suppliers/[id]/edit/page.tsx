import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { createClient } from "@/lib/supabase/server";
import type { Supplier } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <PageHeader
        title="Modifier le fournisseur"
        backHref={`/suppliers/${params.id}`}
      />
      <SupplierForm supplier={data as Supplier} />
    </div>
  );
}
