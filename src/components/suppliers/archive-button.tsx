"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ArchiveSupplierButton({
  id,
  archived,
}: {
  id: string;
  archived: boolean;
}) {
  const router = useRouter();

  async function toggle() {
    const supabase = createClient();
    const { error } = await supabase
      .from("suppliers")
      .update({ archived: !archived })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(archived ? "Fournisseur réactivé." : "Fournisseur archivé.");
    router.push("/suppliers");
    router.refresh();
  }

  return (
    <Button variant="outline" className="w-full text-destructive" onClick={toggle}>
      {archived ? "Réactiver" : "Archiver (pas de suppression)"}
    </Button>
  );
}
