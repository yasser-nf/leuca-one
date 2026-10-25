-- Private Storage buckets: products, business-cards
-- Run after creating the project. Buckets are private; use signed URLs in the app.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'products',
    'products',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  ),
  (
    'business-cards',
    'business-cards',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  )
on conflict (id) do nothing;

-- Authenticated users can upload/read/update their paths
create policy "products_storage_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'products');

create policy "products_storage_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products');

create policy "products_storage_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'products');

create policy "products_storage_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products');

create policy "business_cards_storage_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'business-cards');

create policy "business_cards_storage_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'business-cards');

create policy "business_cards_storage_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'business-cards');

create policy "business_cards_storage_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'business-cards');
