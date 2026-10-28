"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  colors: string[];
};

export function StockEntryForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productId || !color || qty <= 0) {
      toast.error("Modèle, couleur et quantité requis.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");
      const { error } = await supabase.from("stock_movements").insert({
        product_id: productId,
        color,
        type: "Entrée",
        quantity: qty,
        created_by: user.id,
        note: "Réception manuelle",
      });
      if (error) throw error;
      toast.success("Entrée enregistrée.");
      setQty(1);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 space-y-3 rounded-xl border border-border/80 bg-card p-3"
    >
      <p className="text-sm font-semibold">Entrée stock (réception)</p>
      <div className="space-y-2">
        <Label>Modèle</Label>
        <Select
          value={productId}
          onValueChange={(v) => {
            setProductId(v);
            setColor("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir…" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Couleur</Label>
          <Select value={color} onValueChange={setColor} disabled={!selected}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {(selected?.colors ?? []).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Quantité</Label>
          <Input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "…" : "Enregistrer l'entrée"}
      </Button>
    </form>
  );
}
