-- ============================================================
-- Only Beans — Supabase Setup
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tables
create table public.beans (
  id           uuid         primary key default gen_random_uuid(),
  name         text         not null,
  type         text         not null check (type in ('edible', 'cat')),
  image_url    text         not null,
  fact         text,
  emoji        text         not null default '🫘',
  bg           text         not null default '#c4956a',
  uploader_id  uuid         references auth.users(id) on delete set null,
  is_seed      boolean      not null default false,
  is_removed   boolean      not null default false,
  created_at   timestamptz  not null default now()
);

create table public.likes (
  user_id   uuid         not null references auth.users(id) on delete cascade,
  bean_id   uuid         not null references public.beans(id) on delete cascade,
  liked_at  timestamptz  not null default now(),
  primary key (user_id, bean_id)
);

create index beans_community_idx on public.beans (is_removed, is_seed, created_at desc);
create index likes_user_idx on public.likes (user_id, liked_at desc);

-- Row Level Security
alter table public.beans enable row level security;
alter table public.likes enable row level security;

create policy "beans_read"   on public.beans for select using (is_removed = false);
create policy "beans_insert" on public.beans for insert to authenticated
  with check (uploader_id = auth.uid() and is_seed = false);
create policy "beans_remove" on public.beans for update to authenticated
  using  (uploader_id = auth.uid() and is_seed = false)
  with check (is_removed = true);

create policy "likes_read"   on public.likes for select to authenticated
  using (user_id = auth.uid());
create policy "likes_insert" on public.likes for insert to authenticated
  with check (user_id = auth.uid());
create policy "likes_delete" on public.likes for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Seed the 16 base beans with pre-set UUIDs
-- These UUIDs match the ids in data.js — do not change them
-- ============================================================
insert into public.beans (id, name, type, image_url, fact, emoji, bg, is_seed) values
  ('61f0686e-9b71-4f03-8917-425b722aa1e8', 'Black Bean',       'edible', 'https://images.pexels.com/photos/7772002/pexels-photo-7772002.jpeg?auto=compress&cs=tinysrgb&w=600',  'Black beans are 70% protein by weight when dried — a superfood hiding in your burrito.',            '🫘', '#2d2926', true),
  ('0bdf84f6-9766-4a9c-a8eb-2e2358502434', 'Chickpea',         'edible', 'https://images.pexels.com/photos/7656561/pexels-photo-7656561.jpeg?auto=compress&cs=tinysrgb&w=600',  'Chickpeas have been cultivated for over 7,500 years — they''re basically ancient beans.',            '🫘', '#d4a84b', true),
  ('a7e69287-d61a-4b57-9789-e17909ac0a76', 'Kidney Bean',      'edible', 'https://images.pexels.com/photos/6316671/pexels-photo-6316671.jpeg?auto=compress&cs=tinysrgb&w=600',  'Kidney beans got their name because they look like... kidneys. Creativity was scarce that day.',    '🫘', '#7d2b2b', true),
  ('9198aadc-6279-4e2e-9bc3-ec8153aea325', 'Pinto Bean',       'edible', 'https://images.pexels.com/photos/6316673/pexels-photo-6316673.jpeg?auto=compress&cs=tinysrgb&w=600',  '"Pinto" means painted in Spanish — these beans have beautiful speckled patterns.',                  '🫘', '#c4956a', true),
  ('b66d9d46-490b-4893-a77d-d4d80bee89b2', 'Lentil',           'edible', 'https://images.pexels.com/photos/15107600/pexels-photo-15107600.jpeg?auto=compress&cs=tinysrgb&w=600', 'Lentils are one of the oldest cultivated foods — they''ve been found in Egyptian tombs.',           '🫘', '#8b7355', true),
  ('5967dbf8-0d57-4ad2-b775-7aa55113012f', 'Edamame',          'edible', 'https://images.pexels.com/photos/28460867/pexels-photo-28460867.jpeg?auto=compress&cs=tinysrgb&w=600', 'Edamame are just immature soybeans. They''re beans in their awkward teenage phase.',                '🫛', '#6a8f4e', true),
  ('84c676d3-0a47-4a18-b77b-f8c0e8f27264', 'Navy Bean',        'edible', 'https://images.pexels.com/photos/273838/pexels-photo-273838.jpeg?auto=compress&cs=tinysrgb&w=600',    'Navy beans were a staple food for the US Navy in the 1800s — hence the name.',                     '🫘', '#9da8b7', true),
  ('dd2f63e2-086f-45bd-893f-5ab03167a374', 'Lima Bean',        'edible', 'https://images.pexels.com/photos/8108120/pexels-photo-8108120.jpeg?auto=compress&cs=tinysrgb&w=600',  'Lima beans contain trace cyanide when raw. Always cook your beans, people.',                        '🫘', '#b8c49a', true),
  ('78983d4d-a232-4a68-b21d-5a04864b4039', 'Cannellini Bean',  'edible', 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600',  'Cannellini beans are the cornerstone of Tuscan ribollita soup. Very sophisticated beans.',          '🫘', '#e8d8c0', true),
  ('037e69b9-57d6-43bb-997a-eac706e46dec', 'Pink Toe Beans',   'cat',    'https://images.pexels.com/photos/34557584/pexels-photo-34557584.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cat toe beans (paw pads) contain sweat glands — cats only sweat through their paws!',              '🐾', '#f9c6c9', true),
  ('86275b5d-788c-4894-a816-9855597a3111', 'Tabby Toe Beans',  'cat',    'https://images.pexels.com/photos/2123429/pexels-photo-2123429.jpeg?auto=compress&cs=tinysrgb&w=600',  'A tabby''s paw pad color usually matches their fur. Orange cats = peachy pink beans!',             '🐾', '#e8a87c', true),
  ('e86f02a6-da72-4415-a3d0-e175dedfdeb4', 'Spotted Toe Beans','cat',    'https://images.pexels.com/photos/16860556/pexels-photo-16860556.jpeg?auto=compress&cs=tinysrgb&w=600', 'Multi-colored cats often have multi-colored beans. Genetics can be delicious.',                    '🐾', '#c9a8e0', true),
  ('aa4ef5de-0d3c-4464-8c15-36e4119a1582', 'Kitten Beans',     'cat',    'https://images.pexels.com/photos/2600397/pexels-photo-2600397.jpeg?auto=compress&cs=tinysrgb&w=600',  'Kitten toe beans are extra soft and extra squishy. Science confirms this is unbearably cute.',     '🐾', '#f7d6e0', true),
  ('3e48fb5b-574c-46d5-a776-28c25acdd0ce', 'Black Cat Beans',  'cat',    'https://images.pexels.com/photos/16191816/pexels-photo-16191816.jpeg?auto=compress&cs=tinysrgb&w=600', 'Black cats have dark grey or black toe beans that are basically tiny espresso beans.',            '🐾', '#3d3d3d', true),
  ('a64078ee-0886-4145-81a1-259a44345f6d', 'Loaf Cat Beans',   'cat',    'https://images.pexels.com/photos/15141570/pexels-photo-15141570.jpeg?auto=compress&cs=tinysrgb&w=600', 'When a cat sits in loaf position, their beans are tucked safely underneath. Protected beans.',    '🐾', '#d4b896', true),
  ('87221e1b-5277-4678-96d0-bbbbcf10645c', 'Orange Tabby Beans','cat',   'https://images.pexels.com/photos/6399498/pexels-photo-6399498.jpeg?auto=compress&cs=tinysrgb&w=600',  '80% of orange tabby cats are male — and 100% of their beans are precious.',                     '🐾', '#f4a03a', true);

-- ============================================================
-- Storage bucket setup (do this in the Dashboard UI):
--
-- 1. Go to Storage → New bucket
-- 2. Name: bean-images
-- 3. Public: YES (toggle on)
-- 4. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- 5. Max file size: 5 MB
--
-- Then add these Storage policies (Storage → bean-images → Policies):
--
-- Policy 1 — Allow authenticated users to upload to their own folder:
--   Operation: INSERT
--   Target roles: authenticated
--   Policy expression: (storage.foldername(name))[1] = auth.uid()::text
--
-- Policy 2 — Allow public read:
--   Operation: SELECT
--   Target roles: public
--   Policy expression: true
--
-- Policy 3 — Allow users to delete their own files:
--   Operation: DELETE
--   Target roles: authenticated
--   Policy expression: (storage.foldername(name))[1] = auth.uid()::text
--
-- ============================================================
-- Auth settings (Authentication → Providers → Email):
--   Enable Email provider: ON
--   Confirm email: OFF (so magic link works without extra step)
--   Enable magic link: ON
-- ============================================================
