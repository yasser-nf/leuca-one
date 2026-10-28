"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { StockMovementType } from "@/lib/types/database";

type Row = {
  product_id: string;
  color: string;
  quantity: number;
  name: string;
  sku: string;
  colors: string[];
};

const QUICK: {
  label: string;
  type: StockMovementType;
  sign: 1 | -1;
}[] = [
  { label: "Vente", type: "Vente boutique", sign: -1 },
  { label: "Retour", type: "Retour", sign: 1 },
  { label: "Casse", type: "Casse/défaut", sign: -1 },
  { label: "Ajuster", type: "Ajustement", sign: 1 },
];

export function StockActions({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [action, setAction] = useState<(typeof QUICK)[number] | null>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [adjustSign, setAdjustSign] = useState<"in" | "out">("in");
  const [loading, setLoading] = useState(false);

  function openAction(row: Row, a: (typeof QUICK)[number]) {
    setSelected(row);
    setAction(a);
    setQty(1);
    setNote("");
    setAdjustSign("in");
    setOpen(true);
  }

  async function submit() {
    if (!selected || !action) return;
    if (qty <= 0) {
      toast.error("Quantité > 0 requise.");
      return;
    }

    let quantity = qty * action.sign;
    if (action.type === "Ajustement") {
      quantity = adjustSign === "in" ? qty : -qty;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("stock_movements").insert({
        product_id: selected.product_id,
        color: selected.color,
        type: action.type,
        quantity,
        created_by: user.id,
        note: note.trim() || null,
      });
      if (error) throw error;
      toast.success("Mouvement enregistré.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(
        msg.includes("Stock insuffisant") ? "Stock insuffisant — sortie refusée." : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={`${row.product_id}-${row.color}`}
            className="rounded-xl border border-border/80 bg-card p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.sku} · {row.color}
                </p>
              </div>
              <span
                className={`text-lg font-semibold tabular-nums ${
                  row.quantity <= 0 ? "text-destructive" : ""
                }`}
              >
                {row.quantity}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {QUICK.map((a) => (
                <Button
                  key={a.label}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-1 text-[11px]"
                  onClick={() => openAction(row, a)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.label} — {selected?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Couleur : <strong>{selected?.color}</strong> · Stock actuel :{" "}
              <strong>{selected?.quantity}</strong>
            </p>
            {action?.type === "Ajustement" ? (
              <div className="space-y-2">
                <Label>Sens</Label>
                <Select
                  value={adjustSign}
                  onValueChange={(v) => setAdjustSign(v as "in" | "out")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrée (+)</SelectItem>
                    <SelectItem value="out">Sortie (−)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? "…" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
