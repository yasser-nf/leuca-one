-- USD FX rates (editable in /settings)
-- CNY→DZD already seeded in 001. Add CNY→USD; DZD→USD is derived in the app
-- as cny_usd / cny_dzd (no separate stored rate required).

insert into public.settings (key, value)
values ('exchange_rate_cny_usd', '0.14')
on conflict (key) do nothing;

comment on table public.settings is
  'Key/value settings. FX: exchange_rate_cny_dzd, exchange_rate_cny_usd. DZD→USD = cny_usd / cny_dzd.';
