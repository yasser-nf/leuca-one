"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FRAME_MATERIALS,
  FRAME_SHAPES,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
} from "@/lib/constants";

export function ProductFilters({
  suppliers,
}: {
  suppliers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.push(`/products?${next.toString()}`);
    });
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (params.get("q") ?? "")) update("q", q);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-2">
      <Input
        placeholder="Rechercher nom ou SKU…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={params.get("category") ?? "all"}
          onValueChange={(v) => update("category", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {PRODUCT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={params.get("supplier") ?? "all"}
          onValueChange={(v) => update("supplier", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Fournisseur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous fournisseurs</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={params.get("material") ?? "all"}
          onValueChange={(v) => update("material", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes matières</SelectItem>
            {FRAME_MATERIALS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={params.get("shape") ?? "all"}
          onValueChange={(v) => update("shape", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Forme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes formes</SelectItem>
            {FRAME_SHAPES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={params.get("status") ?? "all"}
          onValueChange={(v) => update("status", v)}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Actifs (hors Arrêté)</SelectItem>
            {PRODUCT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
