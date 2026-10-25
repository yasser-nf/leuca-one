import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";

export default function NewSupplierPage() {
  return (
    <div>
      <PageHeader
        title="Nouveau fournisseur"
        subtitle="Carte de visite + contacts"
        backHref="/suppliers"
      />
      <SupplierForm />
    </div>
  );
}
