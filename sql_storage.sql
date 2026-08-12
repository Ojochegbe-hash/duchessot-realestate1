-- Create a storage bucket for property images if you haven't already
-- You will need to run this in your Supabase SQL editor:

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'property-images' );

create policy "Auth Insert"
on storage.objects for insert
with check ( bucket_id = 'property-images' and auth.role() = 'authenticated' );

create policy "Auth Update"
on storage.objects for update
with check ( bucket_id = 'property-images' and auth.role() = 'authenticated' );
