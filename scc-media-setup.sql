-- SCC Studio media library
-- Run once in Supabase Dashboard > SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scc-media',
  'scc-media',
  true,
  52428800,
  array[
    'image/png','image/jpeg','image/gif','image/webp',
    'video/mp4','video/webm',
    'audio/mpeg','audio/ogg','audio/wav','audio/x-wav','audio/mp4'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "SCC media owner can list files" on storage.objects;
create policy "SCC media owner can list files"
on storage.objects for select to authenticated
using (bucket_id = 'scc-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "SCC media owner can upload files" on storage.objects;
create policy "SCC media owner can upload files"
on storage.objects for insert to authenticated
with check (bucket_id = 'scc-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "SCC media owner can update files" on storage.objects;
create policy "SCC media owner can update files"
on storage.objects for update to authenticated
using (bucket_id = 'scc-media' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'scc-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "SCC media owner can delete files" on storage.objects;
create policy "SCC media owner can delete files"
on storage.objects for delete to authenticated
using (bucket_id = 'scc-media' and (storage.foldername(name))[1] = auth.uid()::text);
