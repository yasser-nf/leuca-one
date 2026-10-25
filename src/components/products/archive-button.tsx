"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ProductStatus } from "@/lib/types/database";

export function ArchiveProductButton({
  id,
  status,
}: {
  id: string;
  status: ProductStatus;
}) {
  const router = useRouter();
  const stopped = status === "Arrêté";

  async function toggle() {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ status: stopped ? "Actif" : "Arrêté" })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(stopped ? "Modèle réactivé." : "Modèle arrêté.");
    router.push("/products");
    router.refresh();
  }

  return (
    <Button variant="outline" className="w-full text-destructive" onClick={toggle}>
      {stopped ? "Réactiver" : "Passer en Arrêté (pas de suppression)"}
    </Button>
  );
}
