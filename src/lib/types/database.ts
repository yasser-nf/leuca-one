export type SupplierPlatform =
  | "1688"
  | "Alibaba"
  | "Yiwu market"
  | "Guangzhou market"
  | "Autre";

export type ProductCategory = "Soleil" | "Optique" | "Clip-on" | "Accessoire";
export type ProductGender = "Homme" | "Femme" | "Unisexe" | "Enfant";
export type FrameShape =
  | "Rond"
  | "Carré"
  | "Rectangle"
  | "Aviateur"
  | "Cat-eye"
  | "Oversize"
  | "Autre";
export type FrameMaterial =
  | "Acétate"
  | "Métal"
  | "TR90"
  | "Plastique"
  | "Titane"
  | "Mixte";
export type ProductStatus = "Actif" | "À recommander" | "Arrêté";

export type StockMovementType =
  | "Entrée"
  | "Vente boutique"
  | "Vente en ligne"
  | "Retour"
  | "Casse/défaut"
  | "Ajustement";

export interface Supplier {
  id: string;
  name: string;
  company_name: string | null;
  contact_person: string | null;
  wechat: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  platform: SupplierPlatform | null;
  store_url: string | null;
  city: string | null;
  address: string | null;
  business_card_front_url: string | null;
  business_card_back_url: string | null;
  rating: number | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  supplier_ref: string | null;
  supplier_id: string;
  name: string;
  category: ProductCategory;
  gender: ProductGender | null;
  frame_shape: FrameShape | null;
  frame_material: FrameMaterial | null;
  lens_type: string | null;
  colors: string[];
  size_mm: string | null;
  photos: string[];
  unit_price_cny: number;
  unit_price_usd: number | null;
  unit_weight_g: number;
  moq: number;
  packaging: string | null;
  retail_price_dzd: number | null;
  status: ProductStatus;
  min_stock_alert: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  suppliers?: Pick<Supplier, "id" | "name"> | null;
}

export interface ProductStock {
  product_id: string;
  color: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  product_id: string;
  color: string;
  type: StockMovementType;
  quantity: number;
  reference_id: string | null;
  created_by: string;
  created_at: string;
  note: string | null;
}

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}
