-- Leuca Sourcing — Phase 0 schema
-- Apply in Supabase SQL Editor or via supabase db push.
-- Review with Yasser before applying to production.

-- Enums
create type supplier_platform as enum (
  '1688',
  'Alibaba',
  'Yiwu market',
  'Guangzhou market',
  'Autre'
);

create type product_category as enum (
  'Soleil',
  'Optique',
  'Clip-on',
  'Accessoire'
);

create type product_gender as enum (
  'Homme',
  'Femme',
  'Unisexe',
  'Enfant'
);

create type frame_shape as enum (
  'Rond',
  'Carré',
  'Rectangle',
  'Aviateur',
  'Cat-eye',
  'Oversize',
  'Autre'
);

create type frame_material as enum (
  'Acétate',
  'Métal',
  'TR90',
  'Plastique',
  'Titane',
  'Mixte'
);

create type product_status as enum (
  'Actif',
  'À recommander',
  'Arrêté'
);

create type purchase_order_status as enum (
  'Commandé',
  'Payé',
  'Expédié',
  'Reçu',
  'Annulé'
);

create type shipment_mode as enum (
  'Avion',
  'Bateau',
  'Express',
  'Bagage'
);

create type shipment_status as enum (
  'En préparation',
  'En transit',
  'À la douane',
  'Arrivé'
);

create type stock_movement_type as enum (
  'Entrée',
  'Vente boutique',
  'Vente en ligne',
  'Retour',
  'Casse/défaut',
  'Ajustement'
);

-- suppliers
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  contact_person text,
  wechat text,
  whatsapp text,
  phone text,
  email text,
  platform supplier_platform,
  store_url text,
  city text,
  address text,
  business_card_front_url text,
  business_card_back_url text,
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_at_least_one_contact check (
    coalesce(wechat, '') <> ''
    or coalesce(whatsapp, '') <> ''
    or coalesce(phone, '') <> ''
    or coalesce(email, '') <> ''
  )
);

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  supplier_ref text,
  supplier_id uuid not null references public.suppliers (id),
  name text not null,
  category product_category not null,
  gender product_gender,
  frame_shape frame_shape,
  frame_material frame_material,
  lens_type text,
  colors text[] not null default '{}',
  size_mm text,
  photos text[] not null default '{}',
  unit_price_cny numeric(10, 2) not null check (unit_price_cny > 0),
  unit_price_usd numeric(10, 2),
  unit_weight_g numeric(8, 1) not null check (unit_weight_g > 0),
  moq integer not null check (moq > 0),
  packaging text,
  retail_price_dzd numeric(10, 2),
  status product_status not null default 'Actif',
  min_stock_alert integer not null default 3,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_has_photo check (cardinality(photos) >= 1),
  constraint products_photos_max check (cardinality(photos) <= 6)
);

create index products_supplier_id_idx on public.products (supplier_id);
create index products_status_idx on public.products (status);
create index products_category_idx on public.products (category);

-- shipments (V2 UI, schema ready)
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  reference text,
  forwarder text,
  mode shipment_mode,
  total_weight_kg numeric(10, 2),
  freight_cost_dzd numeric(12, 2) default 0,
  customs_cost_dzd numeric(12, 2) default 0,
  other_costs_dzd numeric(12, 2) default 0,
  ship_date date,
  arrival_date date,
  status shipment_status not null default 'En préparation',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- purchase_orders (V2 UI, schema ready)
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  supplier_id uuid not null references public.suppliers (id),
  shipment_id uuid references public.shipments (id),
  order_date date not null default current_date,
  status purchase_order_status not null default 'Commandé',
  payment_method text,
  exchange_rate_cny_dzd numeric(12, 4) not null,
  invoice_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchase_orders_supplier_id_idx on public.purchase_orders (supplier_id);
create index purchase_orders_shipment_id_idx on public.purchase_orders (shipment_id);

-- purchase_order_items
create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  color text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cny numeric(10, 2) not null check (unit_price_cny > 0),
  landed_unit_cost_dzd numeric(10, 2),
  created_at timestamptz not null default now()
);

create index purchase_order_items_po_idx on public.purchase_order_items (purchase_order_id);
create index purchase_order_items_product_idx on public.purchase_order_items (product_id);

-- stock_movements
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id),
  color text not null,
  type stock_movement_type not null,
  quantity integer not null,
  reference_id uuid,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  note text,
  constraint stock_movements_quantity_nonzero check (quantity <> 0)
);

create index stock_movements_product_color_idx on public.stock_movements (product_id, color);
create index stock_movements_created_at_idx on public.stock_movements (created_at desc);

-- settings (key/value; CNY→DZD rate)
create table public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

insert into public.settings (key, value)
values ('exchange_rate_cny_dzd', '27.5');

-- SKU sequence helper
create sequence public.product_sku_seq start 1;

create or replace function public.next_product_sku(p_category product_category)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  prefix text;
  n bigint;
begin
  prefix := case p_category
    when 'Soleil' then 'SUN'
    when 'Optique' then 'OPT'
    when 'Clip-on' then 'CLP'
    when 'Accessoire' then 'ACC'
    else 'GEN'
  end;
  n := nextval('public.product_sku_seq');
  return 'LEU-' || prefix || '-' || lpad(n::text, 4, '0');
end;
$$;

grant execute on function public.next_product_sku(product_category) to authenticated;
grant usage, select on sequence public.product_sku_seq to authenticated;

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger suppliers_updated_at before update on public.suppliers
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger shipments_updated_at before update on public.shipments
  for each row execute function public.set_updated_at();
create trigger purchase_orders_updated_at before update on public.purchase_orders
  for each row execute function public.set_updated_at();
