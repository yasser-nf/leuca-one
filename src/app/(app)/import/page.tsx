"use client";

import { useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CSV_PRODUCT_COLUMNS, PRODUCT_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ProductCategory, ProductStatus } from "@/lib/types/database";

const TEMPLATE = CSV_PRODUCT_COLUMNS.join(",") + "\n";

type CsvRow = Record<string, string>;

export default function ImportPage() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number; errors: string[] } | null>(
    null
  );

  function downloadTemplate() {
    const blob = new Blob(
      [
        TEMPLATE +
          'Lunettes soleil noir,Fournisseur Exemple,Soleil,Unisexe,Aviateur,Métal,UV400,"Noir,Écaille",52-18-145,45,,85,12,Étui+chiffon,4500,3,REF-001,Actif,Import test\n',
      ],
      { type: "text/csv;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leuca-modeles-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(file: File | null) {
    if (!file) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data);
        setResult(null);
        toast.success(`${res.data.length} lignes lues.`);
      },
      error: (err) => toast.error(err.message),
    });
  }

  async function importRows() {
    if (rows.length === 0) {
      toast.error("Aucune ligne à importer.");
      return;
    }
    setLoading(true);
    const errors: string[] = [];
    let ok = 0;
    let fail = 0;

    try {
      const supabase = createClient();

      // Cache suppliers by name
      const { data: existingSuppliers } = await supabase
        .from("suppliers")
        .select("id, name");
      const supplierMap = new Map(
        (existingSuppliers ?? []).map((s) => [s.name.toLowerCase(), s.id as string])
      );

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const line = i + 2;
        try {
          const name = (row.name || "").trim();
          const supplierName = (row.supplier_name || "").trim();
          const category = (row.category || "").trim() as ProductCategory;
          const unit_price_cny = Number(row.unit_price_cny);
          const unit_weight_g = Number(row.unit_weight_g);
          const moq = Number(row.moq);
          const colors = (row.colors || "")
            .split(/[,;/|]/)
            .map((c) => c.trim())
            .filter(Boolean);

          if (!name || !supplierName) {
            throw new Error("name et supplier_name obligatoires");
          }
          if (!PRODUCT_CATEGORIES.includes(category)) {
            throw new Error(`catégorie invalide: ${category}`);
          }
          if (!(unit_price_cny > 0 && unit_weight_g > 0 && moq > 0)) {
            throw new Error("prix/poids/MOQ > 0 requis");
          }
          if (colors.length === 0) {
            throw new Error("au moins une couleur");
          }

          let supplierId = supplierMap.get(supplierName.toLowerCase());
          if (!supplierId) {
            const { data: created, error: sErr } = await supabase
              .from("suppliers")
              .insert({
                name: supplierName,
                notes: "Créé via import CSV",
                wechat: "à compléter",
              })
              .select("id")
              .single();
            if (sErr) throw sErr;
            supplierId = created.id as string;
            supplierMap.set(supplierName.toLowerCase(), supplierId);
          }

          if (!supplierId) throw new Error("fournisseur introuvable");

          // Placeholder 1×1 jpeg path requirement: products need ≥1 photo.
          // Upload a tiny generated placeholder per product.
          const placeholderPath = await ensurePlaceholderPhoto(supabase);

          const { data: sku, error: skuErr } = await supabase.rpc(
            "next_product_sku",
            { p_category: category }
          );
          if (skuErr) throw skuErr;

          const status = ((row.status || "Actif").trim() || "Actif") as ProductStatus;

          const { error } = await supabase.from("products").insert({
            sku,
            name,
            supplier_id: supplierId,
            supplier_ref: row.supplier_ref?.trim() || null,
            category,
            gender: row.gender?.trim() || null,
            frame_shape: row.frame_shape?.trim() || null,
            frame_material: row.frame_material?.trim() || null,
            lens_type: row.lens_type?.trim() || null,
            colors,
            size_mm: row.size_mm?.trim() || null,
            photos: [placeholderPath],
            unit_price_cny,
            unit_price_usd: row.unit_price_usd ? Number(row.unit_price_usd) : null,
            unit_weight_g,
            moq,
            packaging: row.packaging?.trim() || null,
            retail_price_dzd: row.retail_price_dzd
              ? Number(row.retail_price_dzd)
              : null,
            status,
            min_stock_alert: row.min_stock_alert
              ? Number(row.min_stock_alert)
              : 3,
            notes: row.notes?.trim() || "Import CSV",
          });
          if (error) throw error;
          ok += 1;
        } catch (err) {
          fail += 1;
          errors.push(
            `Ligne ${line}: ${err instanceof Error ? err.message : "erreur"}`
          );
        }
      }
    } finally {
      setLoading(false);
      setResult({ ok, fail, errors: errors.slice(0, 20) });
      if (ok) toast.success(`${ok} modèles importés.`);
      if (fail) toast.error(`${fail} lignes en erreur.`);
    }
  }

  return (
    <div>
      <PageHeader
        title="Import CSV"
        subtitle="Charger ~150 modèles"
        backHref="/more"
      />

      <Alert className="mb-4">
        <AlertTitle>Colonnes attendues</AlertTitle>
        <AlertDescription className="mt-2 break-all text-xs">
          {CSV_PRODUCT_COLUMNS.join(", ")}
        </AlertDescription>
      </Alert>

      <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
        <Button type="button" variant="outline" className="w-full" onClick={downloadTemplate}>
          Télécharger le modèle CSV
        </Button>
        <div className="space-y-2">
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            {rows.length} lignes prêtes. Photos absentes → placeholder (à remplacer
            ensuite). Fournisseurs créés automatiquement s&apos;ils n&apos;existent
            pas (WeChat « à compléter »).
          </p>
        </div>
        <Button
          className="w-full"
          disabled={loading || rows.length === 0}
          onClick={importRows}
        >
          {loading ? "Import en cours…" : `Importer ${rows.length || ""} modèles`}
        </Button>
      </div>

      {result ? (
        <div className="mt-4 space-y-2 text-sm">
          <p>
            OK : <strong>{result.ok}</strong> · Erreurs :{" "}
            <strong>{result.fail}</strong>
          </p>
          {result.errors.length ? (
            <ul className="list-disc space-y-1 pl-5 text-xs text-destructive">
              {result.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

async function ensurePlaceholderPhoto(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<string> {
  const path = `placeholders/import-placeholder.jpg`;
  const { data: listed } = await supabase.storage.from("products").list("placeholders");
  const exists = (listed ?? []).some(
    (f: { name: string }) => f.name === "import-placeholder.jpg"
  );
  if (!exists) {
    // Minimal valid JPEG (1×1)
    const bytes = Uint8Array.from(
      atob(
        "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
      ),
      (c) => c.charCodeAt(0)
    );
    await supabase.storage
      .from("products")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
  }
  return path;
}
