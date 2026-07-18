-- ====================================================================
-- VIDA BOTANICAL - UNRESTRICTED SUPABASE SETUP SCRIPT
-- Includes Tables, Fully Permissive RLS Policies (No Restrictions),
-- and Storage Bucket Policies for both 'vida' and '8ef9b60801823b2a8cab552d20959f50' Buckets.
-- ====================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ====================================================================
-- 1. CATEGORIES TABLE
-- ====================================================================
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null unique,
    image text
);

-- Enable RLS & Set Unrestricted Policies
alter table public.categories enable row level security;

drop policy if exists "Unrestricted Categories Access" on public.categories;
create policy "Unrestricted Categories Access"
on public.categories for all
using (true)
with check (true);


-- ====================================================================
-- 2. PRODUCTS TABLE
-- ====================================================================
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    category text not null,
    price text not null,
    image text not null,
    images text[] not null default '{}'::text[],
    localized_images jsonb default '{"ar": [], "kr": []}'::jsonb,
    description text not null,
    benefits text[] not null default '{}'::text[]
);

-- Enable RLS & Set Unrestricted Policies
alter table public.products enable row level security;

drop policy if exists "Unrestricted Products Access" on public.products;
create policy "Unrestricted Products Access"
on public.products for all
using (true)
with check (true);


-- ====================================================================
-- 3. FEATURED ITEMS TABLE (Hero Sliders / Spotlight)
-- ====================================================================
create table if not exists public.featured_items (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    name text not null,
    description text not null,
    image text not null,
    accent text
);

-- Enable RLS & Set Unrestricted Policies
alter table public.featured_items enable row level security;

drop policy if exists "Unrestricted Featured Items Access" on public.featured_items;
create policy "Unrestricted Featured Items Access"
on public.featured_items for all
using (true)
with check (true);


-- ====================================================================
-- 4. ORDERS TABLE (Customer Requests)
-- ====================================================================
create table if not exists public.orders (
    id bigint generated always as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    phone_number text not null,
    total_price numeric(10, 2) not null,
    status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled'))
);

-- Enable RLS & Set Unrestricted Policies
alter table public.orders enable row level security;

drop policy if exists "Unrestricted Orders Access" on public.orders;
create policy "Unrestricted Orders Access"
on public.orders for all
using (true)
with check (true);


-- ====================================================================
-- 5. ORDER ITEMS TABLE (Specific items in order)
-- ====================================================================
create table if not exists public.order_items (
    id bigint generated always as identity primary key,
    order_id bigint references public.orders(id) on delete cascade not null,
    product_name text not null,
    quantity integer not null check (quantity > 0),
    price numeric(10, 2) not null
);

-- Enable RLS & Set Unrestricted Policies
alter table public.order_items enable row level security;

drop policy if exists "Unrestricted Order Items Access" on public.order_items;
create policy "Unrestricted Order Items Access"
on public.order_items for all
using (true)
with check (true);


-- ====================================================================
-- 6. SYSTEM CONFIGURATION TABLE (E.g. Hero Image url / Site configs)
-- ====================================================================
create table if not exists public.site_config (
    key text primary key,
    value text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial default hero image config
insert into public.site_config (key, value)
values ('hero_image', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000')
on conflict (key) do nothing;

-- Enable RLS & Set Unrestricted Policies
alter table public.site_config enable row level security;

drop policy if exists "Unrestricted Site Config Access" on public.site_config;
create policy "Unrestricted Site Config Access"
on public.site_config for all
using (true)
with check (true);


-- ====================================================================
-- 7. STORAGE BUCKETS & COMPLETELY UNRESTRICTED POLICIES
-- ====================================================================

-- Ensure the public bucket "vida" exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'vida', 
    'vida', 
    true, 
    10485760, -- 10MB limit
    array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Ensure the public bucket "8ef9b60801823b2a8cab552d20959f50" exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    '8ef9b60801823b2a8cab552d20959f50', 
    '8ef9b60801823b2a8cab552d20959f50', 
    true, 
    10485760, -- 10MB limit
    array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Ensure RLS is active on storage objects
alter table storage.objects enable row level security;

-- Drop any previous restrictive storage policies for storage objects if they exist
drop policy if exists "Allow public read access to images" on storage.objects;
drop policy if exists "Allow authenticated admin upload" on storage.objects;
drop policy if exists "Allow authenticated admin update" on storage.objects;
drop policy if exists "Allow authenticated admin delete" on storage.objects;
drop policy if exists "Unrestricted public read access to vida images" on storage.objects;
drop policy if exists "Unrestricted public upload to vida bucket" on storage.objects;
drop policy if exists "Unrestricted public update to vida bucket" on storage.objects;
drop policy if exists "Unrestricted public delete to vida bucket" on storage.objects;
drop policy if exists "Unrestricted public read access to all images" on storage.objects;
drop policy if exists "Unrestricted public upload to all buckets" on storage.objects;
drop policy if exists "Unrestricted public update to all buckets" on storage.objects;
drop policy if exists "Unrestricted public delete to all buckets" on storage.objects;

-- Create completely open policies for anyone to view, upload, update, and delete in ANY bucket
create policy "Unrestricted public read access to all images"
on storage.objects for select
using ( true );

create policy "Unrestricted public upload to all buckets"
on storage.objects for insert
with check ( true );

create policy "Unrestricted public update to all buckets"
on storage.objects for update
using ( true )
with check ( true );

create policy "Unrestricted public delete to all buckets"
on storage.objects for delete
using ( true );
