"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  PRODUCT_GENDERS,
  PRODUCT_STATUSES,
} from "@/lib/constants";
import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type {
  Product,
  ProductCategory,
  ProductGender,
  FrameMaterial,
  FrameShape,
  ProductStatus,
  Supplier,
} from "@/lib/types/database";
import { PriceCnyDzd } from "@/components/price-display";

export function ProductForm({
  product,
  suppliers,
  fxRate,
  defaultSupplierId,
  duplicateFrom,
}: {
  product?: Product;
  suppliers: Pick<Supplier, "id" | "name">[];
  fxRate: number;
  defaultSupplierId?: string;
  duplicateFrom?: Product;
}) {
  const router = useRouter();
  const base = product ?? duplicateFrom;
  const [loading, setLoading] = useState(false);
  const [supplierId, setSupplierId] = useState(
    product?.supplier_id ?? defaultSupplierId ?? base?.supplier_id ?? ""
  );
  const [category, setCategory] = useState<ProductCategory>(
    base?.category ?? "Soleil"
  );
  const [gender, setGender] = useState<string>(base?.gender ?? "");
  const [frameShape, setFrameShape] = useState<string>(base?.frame_shape ?? "");
  const [frameMaterial, setFrameMaterial] = useState<string>(
    base?.frame_material ?? ""
  );
  const [status, setStatus] = useState<ProductStatus>(base?.status ?? "Actif");
  const [priceCny, setPriceCny] = useState(Number(base?.unit_price_cny ?? 0) || 0);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    product?.photos ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const totalPhotos = existingPhotos.length + newFiles.length;

  const previewUrls = useMemo(() => {
    return [
      ...existingPhotos.map((p) =>
        p.startsWith("http")
          ? p
          : `/api/signed-url?path=${encodeURIComponent(p)}&bucket=products`
      ),
      ...previews,
    ];
  }, [existingPhotos, previews]);

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    const remaining = 6 - totalPhotos;
    if (remaining <= 0) {
      toast.error("Maximum 6 photos.");
      return;
    }
    const slice = Array.from(files).slice(0, remaining);
    const urls = slice.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...slice]);
    setPreviews((prev) => [...prev, ...urls]);
  }

  function removePhoto(index: number) {
    if (index < existingPhotos.length) {
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    const ni = index - existingPhotos.length;
    setNewFiles((prev) => prev.filter((_, i) => i !== ni));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[ni]);
      return prev.filter((_, i) => i !== ni);
    });
  }

  async function uploadPhotos(files: File[]): Promise<string[]> {
    const supabase = createClient();
    const paths: string[] = [];
    for (const file of files) {
      const compressed = await compressImage(file);
      const path = `${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("products")
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (error) throw error;
      paths.push(path);
    }
    return paths;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const colorsRaw = String(fd.get("colors") || "").trim();
    const colors = colorsRaw
      .split(/[,;/|]/)
      .map((c) => c.trim())
      .filter(Boolean);
    const unit_price_cny = Number(fd.get("unit_price_cny"));
    const unit_weight_g = Number(fd.get("unit_weight_g"));
    const moq = Number(fd.get("moq"));

    if (!supplierId) {
      toast.error("Fournisseur obligatoire.");
      return;
    }
    if (!name) {
      toast.error("Nom obligatoire.");
      return;
    }
    if (totalPhotos < 1) {
      toast.error("Au moins une photo est obligatoire.");
      return;
    }
    if (!(unit_price_cny > 0 && unit_weight_g > 0 && moq > 0)) {
      toast.error("Prix, poids et MOQ doivent être > 0.");
      return;
    }
    if (colors.length === 0) {
      toast.error("Indiquez au moins une couleur.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const uploaded = await uploadPhotos(newFiles);
      const photos = [...existingPhotos, ...uploaded].slice(0, 6);

      const payload = {
        name,
        supplier_id: supplierId,
        supplier_ref: String(fd.get("supplier_ref") || "").trim() || null,
        category,
        gender: (gender || null) as ProductGender | null,
        frame_shape: (frameShape || null) as FrameShape | null,
        frame_material: (frameMaterial || null) as FrameMaterial | null,
        lens_type: String(fd.get("lens_type") || "").trim() || null,
        colors,
        size_mm: String(fd.get("size_mm") || "").trim() || null,
        photos,
        unit_price_cny,
        unit_price_usd: fd.get("unit_price_usd")
          ? Number(fd.get("unit_price_usd"))
          : null,
        unit_weight_g,
        moq,
        packaging: String(fd.get("packaging") || "").trim() || null,
        retail_price_dzd: fd.get("retail_price_dzd")
          ? Number(fd.get("retail_price_dzd"))
          : null,
        status,
        min_stock_alert: Number(fd.get("min_stock_alert") || 3),
        notes: String(fd.get("notes") || "").trim() || null,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Modèle mis à jour.");
        router.push(`/products/${product.id}`);
      } else {
        const { data: skuData, error: skuError } = await supabase.rpc(
          "next_product_sku",
          { p_category: category }
        );
        if (skuError) throw skuError;
        const { data, error } = await supabase
          .from("products")
          .insert({ ...payload, sku: skuData as string })
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Modèle créé.");
        router.push(`/products/${data.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Photos first */}
      <div className="space-y-2">
        <Label>Photos * (1–6, première = principale)</Label>
        <div className="grid grid-cols-3 gap-2">
          {previewUrls.map((src, i) => (
            <div key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                aria-label="Retirer"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 ? (
                <span className="absolute bottom-1 left-1 rounded bg-accent px-1.5 py-0.5 text-[10px] text-white">
                  Principale
                </span>
              ) : null}
            </div>
          ))}
          {totalPhotos < 6 ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-card text-muted-foreground hover:border-accent hover:text-accent">
              <Camera className="h-6 w-6" />
              <span className="text-[11px]">Ajouter</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => onFilesSelected(e.target.files)}
              />
            </label>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Compression auto ≤ 1600 px / ~300 Ko.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Fournisseur *</Label>
          <Link href="/suppliers/new" className="text-xs text-accent underline">
            Créer rapidement
          </Link>
        </div>
        <Select value={supplierId} onValueChange={setSupplierId}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir…" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom commercial *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={
            duplicateFrom && !product
              ? `${duplicateFrom.name} (copie)`
              : base?.name
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Catégorie *</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ProductCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Genre</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Forme</Label>
          <Select value={frameShape} onValueChange={setFrameShape}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {FRAME_SHAPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Matière</Label>
          <Select value={frameMaterial} onValueChange={setFrameMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {FRAME_MATERIALS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="lens_type">Verre / lentille</Label>
          <Input
            id="lens_type"
            name="lens_type"
            defaultValue={base?.lens_type ?? ""}
            placeholder="UV400, Polarisé…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size_mm">Taille (mm)</Label>
          <Input
            id="size_mm"
            name="size_mm"
            defaultValue={base?.size_mm ?? ""}
            placeholder="52-18-145"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="colors">Couleurs * (séparées par virgule)</Label>
        <Input
          id="colors"
          name="colors"
          required
          defaultValue={
            duplicateFrom && !product
              ? ""
              : base?.colors?.join(", ") ?? ""
          }
          placeholder="Noir, Écaille, Transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="unit_price_cny">Prix CNY *</Label>
          <Input
            id="unit_price_cny"
            name="unit_price_cny"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={priceCny || ""}
            onChange={(e) => setPriceCny(Number(e.target.value))}
          />
          {priceCny > 0 ? (
            <p className="text-xs text-muted-foreground">
              <PriceCnyDzd cny={priceCny} rate={fxRate} />
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit_price_usd">Prix USD (optionnel)</Label>
          <Input
            id="unit_price_usd"
            name="unit_price_usd"
            type="number"
            step="0.01"
            min="0"
            defaultValue={base?.unit_price_usd ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit_weight_g">Poids g *</Label>
          <Input
            id="unit_weight_g"
            name="unit_weight_g"
            type="number"
            step="0.1"
            min="0.1"
            required
            defaultValue={base?.unit_weight_g ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moq">MOQ *</Label>
          <Input
            id="moq"
            name="moq"
            type="number"
            min="1"
            required
            defaultValue={base?.moq ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retail_price_dzd">Prix vente DZD</Label>
          <Input
            id="retail_price_dzd"
            name="retail_price_dzd"
            type="number"
            step="1"
            min="0"
            defaultValue={base?.retail_price_dzd ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock_alert">Alerte stock</Label>
          <Input
            id="min_stock_alert"
            name="min_stock_alert"
            type="number"
            min="0"
            defaultValue={base?.min_stock_alert ?? 3}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier_ref">Réf. fournisseur</Label>
        <Input
          id="supplier_ref"
          name="supplier_ref"
          defaultValue={base?.supplier_ref ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="packaging">Packaging</Label>
        <Input
          id="packaging"
          name="packaging"
          defaultValue={base?.packaging ?? ""}
          placeholder="Étui, chiffon, boîte…"
        />
      </div>

      <div className="space-y-2">
        <Label>Statut</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={base?.notes ?? ""} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enregistrement…" : product ? "Enregistrer" : "Créer le modèle"}
      </Button>
    </form>
  );
}
