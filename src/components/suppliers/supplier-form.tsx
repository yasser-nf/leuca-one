"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { SUPPLIER_PLATFORMS } from "@/lib/constants";
import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { Supplier, SupplierPlatform } from "@/lib/types/database";

async function uploadCard(
  file: File,
  side: "front" | "back"
): Promise<string> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const path = `${crypto.randomUUID()}-${side}.jpg`;
  const { error } = await supabase.storage
    .from("business-cards")
    .upload(path, compressed, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return path;
}

export function SupplierForm({
  supplier,
  onCreated,
}: {
  supplier?: Supplier;
  onCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<string>(supplier?.platform ?? "");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const wechat = String(fd.get("wechat") || "").trim() || null;
    const whatsapp = String(fd.get("whatsapp") || "").trim() || null;
    const phone = String(fd.get("phone") || "").trim() || null;
    const email = String(fd.get("email") || "").trim() || null;

    if (!name) {
      toast.error("Nom obligatoire.");
      return;
    }
    if (!wechat && !whatsapp && !phone && !email) {
      toast.error("Au moins un contact (WeChat, WhatsApp, téléphone ou email).");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      let frontUrl = supplier?.business_card_front_url ?? null;
      let backUrl = supplier?.business_card_back_url ?? null;
      if (frontFile) frontUrl = await uploadCard(frontFile, "front");
      if (backFile) backUrl = await uploadCard(backFile, "back");

      const payload = {
        name,
        company_name: String(fd.get("company_name") || "").trim() || null,
        contact_person: String(fd.get("contact_person") || "").trim() || null,
        wechat,
        whatsapp,
        phone,
        email,
        platform: (platform || null) as SupplierPlatform | null,
        store_url: String(fd.get("store_url") || "").trim() || null,
        city: String(fd.get("city") || "").trim() || null,
        address: String(fd.get("address") || "").trim() || null,
        rating: fd.get("rating") ? Number(fd.get("rating")) : null,
        notes: String(fd.get("notes") || "").trim() || null,
        business_card_front_url: frontUrl,
        business_card_back_url: backUrl,
      };

      if (supplier) {
        const { error } = await supabase
          .from("suppliers")
          .update(payload)
          .eq("id", supplier.id);
        if (error) throw error;
        toast.success("Fournisseur mis à jour.");
        router.push(`/suppliers/${supplier.id}`);
        router.refresh();
      } else {
        const { data, error } = await supabase
          .from("suppliers")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Fournisseur créé.");
        if (onCreated) onCreated(data.id);
        else {
          router.push(`/suppliers/${data.id}`);
          router.refresh();
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Carte recto</Label>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFrontFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label>Carte verso</Label>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setBackFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom *</Label>
        <Input id="name" name="name" required defaultValue={supplier?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company_name">Raison sociale</Label>
        <Input
          id="company_name"
          name="company_name"
          defaultValue={supplier?.company_name ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_person">Contact</Label>
        <Input
          id="contact_person"
          name="contact_person"
          defaultValue={supplier?.contact_person ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="wechat">WeChat</Label>
          <Input id="wechat" name="wechat" defaultValue={supplier?.wechat ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={supplier?.whatsapp ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={supplier?.email ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Plateforme</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir…" />
          </SelectTrigger>
          <SelectContent>
            {SUPPLIER_PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="store_url">Lien boutique</Label>
        <Input
          id="store_url"
          name="store_url"
          type="url"
          defaultValue={supplier?.store_url ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={supplier?.city ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Note (1–5)</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min={1}
            max={5}
            defaultValue={supplier?.rating ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" name="address" defaultValue={supplier?.address ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={supplier?.notes ?? ""} rows={3} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enregistrement…" : supplier ? "Enregistrer" : "Créer le fournisseur"}
      </Button>
    </form>
  );
}
