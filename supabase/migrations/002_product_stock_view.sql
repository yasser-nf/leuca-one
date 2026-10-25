-- Derived stock: never store balances — sum of movements per product × color
create or replace view public.product_stock
with (security_invoker = true)
as
select
  product_id,
  color,
  coalesce(sum(quantity), 0)::integer as quantity
from public.stock_movements
group by product_id, color;

comment on view public.product_stock is
  'Current stock per product × color = sum(stock_movements.quantity)';
