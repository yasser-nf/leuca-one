import type {
  FrameMaterial,
  FrameShape,
  ProductCategory,
  ProductGender,
  ProductStatus,
  StockMovementType,
  SupplierPlatform,
} from "@/lib/types/database";

export const SUPPLIER_PLATFORMS: SupplierPlatform[] = [
  "1688",
  "Alibaba",
  "Yiwu market",
  "Guangzhou market",
  "Autre",
];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Soleil",
  "Optique",
  "Clip-on",
  "Accessoire",
];

export const PRODUCT_GENDERS: ProductGender[] = [
  "Homme",
  "Femme",
  "Unisexe",
  "Enfant",
];

export const FRAME_SHAPES: FrameShape[] = [
  "Rond",
  "Carré",
  "Rectangle",
  "Aviateur",
  "Cat-eye",
  "Oversize",
  "Autre",
];

export const FRAME_MATERIALS: FrameMaterial[] = [
  "Acétate",
  "Métal",
  "TR90",
  "Plastique",
  "Titane",
  "Mixte",
];

export const PRODUCT_STATUSES: ProductStatus[] = [
  "Actif",
  "À recommander",
  "Arrêté",
];

export const STOCK_OUTBOUND_TYPES: StockMovementType[] = [
  "Vente boutique",
  "Vente en ligne",
  "Casse/défaut",
];

export const STOCK_INBOUND_TYPES: StockMovementType[] = ["Entrée", "Retour"];

export const DEFAULT_FX_CNY_DZD = 27.5;

/** CSV template columns for product import */
export const CSV_PRODUCT_COLUMNS = [
  "name",
  "supplier_name",
  "category",
  "gender",
  "frame_shape",
  "frame_material",
  "lens_type",
  "colors",
  "size_mm",
  "unit_price_cny",
  "unit_price_usd",
  "unit_weight_g",
  "moq",
  "packaging",
  "retail_price_dzd",
  "min_stock_alert",
  "supplier_ref",
  "status",
  "notes",
] as const;
