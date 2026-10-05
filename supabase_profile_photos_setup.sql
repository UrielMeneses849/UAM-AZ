-- Foto de perfil persistente por usuario autenticado.
-- Ejecutar una vez en Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_photos_select_own on storage.objects;
create policy profile_photos_select_own on storage.objects
for select to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists profile_photos_insert_own on storage.objects;
create policy profile_photos_insert_own on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists profile_photos_update_own on storage.objects;
create policy profile_photos_update_own on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- No hay política DELETE. El portal permite subir o reemplazar la foto,
-- pero su eliminación se realiza únicamente desde Supabase Storage.
