-- Row Level Security: authenticated associates only (no public signup)

alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.shipments enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.settings enable row level security;

-- suppliers
create policy "suppliers_select_authenticated"
  on public.suppliers for select to authenticated using (true);
create policy "suppliers_insert_authenticated"
  on public.suppliers for insert to authenticated with check (true);
create policy "suppliers_update_authenticated"
  on public.suppliers for update to authenticated using (true) with check (true);

-- products
create policy "products_select_authenticated"
  on public.products for select to authenticated using (true);
create policy "products_insert_authenticated"
  on public.products for insert to authenticated with check (true);
create policy "products_update_authenticated"
  on public.products for update to authenticated using (true) with check (true);

-- shipments
create policy "shipments_select_authenticated"
  on public.shipments for select to authenticated using (true);
create policy "shipments_insert_authenticated"
  on public.shipments for insert to authenticated with check (true);
create policy "shipments_update_authenticated"
  on public.shipments for update to authenticated using (true) with check (true);

-- purchase_orders
create policy "purchase_orders_select_authenticated"
  on public.purchase_orders for select to authenticated using (true);
create policy "purchase_orders_insert_authenticated"
  on public.purchase_orders for insert to authenticated with check (true);
create policy "purchase_orders_update_authenticated"
  on public.purchase_orders for update to authenticated using (true) with check (true);

-- purchase_order_items
create policy "poi_select_authenticated"
  on public.purchase_order_items for select to authenticated using (true);
create policy "poi_insert_authenticated"
  on public.purchase_order_items for insert to authenticated with check (true);
create policy "poi_update_authenticated"
  on public.purchase_order_items for update to authenticated using (true) with check (true);
create policy "poi_delete_authenticated"
  on public.purchase_order_items for delete to authenticated using (true);

-- stock_movements (no delete — audit trail)
create policy "stock_movements_select_authenticated"
  on public.stock_movements for select to authenticated using (true);
create policy "stock_movements_insert_authenticated"
  on public.stock_movements for insert to authenticated
  with check (created_by = auth.uid());

-- settings
create policy "settings_select_authenticated"
  on public.settings for select to authenticated using (true);
create policy "settings_update_authenticated"
  on public.settings for update to authenticated using (true) with check (true);
create policy "settings_insert_authenticated"
  on public.settings for insert to authenticated with check (true);

-- Prevent negative stock on outbound movements
create or replace function public.enforce_non_negative_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_qty integer;
begin
  if new.quantity >= 0 then
    return new;
  end if;

  select coalesce(sum(quantity), 0)::integer into current_qty
  from public.stock_movements
  where product_id = new.product_id and color = new.color;

  if current_qty + new.quantity < 0 then
    raise exception 'Stock insuffisant : stock actuel %, mouvement %',
      current_qty, new.quantity
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger stock_movements_non_negative
  before insert on public.stock_movements
  for each row execute function public.enforce_non_negative_stock();
