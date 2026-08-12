-- ===========================================================================
-- WARNING: This script will DROP (delete) your existing tables and all data.
-- Since you asked to start fresh, this is the easiest way to ensure no conflicts.
-- ===========================================================================

-- 1. Drop existing tables to start fresh
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;

-- ===========================================================================
-- 2. Create Properties Table
-- ===========================================================================
CREATE TABLE public.properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric NOT NULL,
  listing_type text NOT NULL, -- 'Rent', 'Sell', 'Short Let'
  property_type text NOT NULL, -- 'House', 'Apartment', 'Commercial', etc.
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  area_sqft numeric DEFAULT 0,
  location_address text,
  location_city text,
  location_country text DEFAULT 'Ghana',
  lat numeric,
  lng numeric,
  features text[], -- Array of strings e.g. '{"Pool", "Gym"}'
  gallery text[], -- URLs to images
  video_url text, -- YouTube/Vimeo/Drive URL
  currency text DEFAULT 'USD',
  status text DEFAULT 'Available',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security) for properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access" ON public.properties FOR ALL USING (auth.role() = 'authenticated');

-- ===========================================================================
-- 3. Create Site Settings Table
-- ===========================================================================
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  logo_url text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  linkedin_url text,
  company_name text DEFAULT 'DUCHESSOT',
  primary_color text DEFAULT '#740174',
  font_family text DEFAULT 'Poppins',
  page_views text DEFAULT '45.2K',
  new_leads text DEFAULT '384',
  hero_title text DEFAULT 'Find Your Dream Luxury Home',
  hero_subtitle text DEFAULT 'Discover the finest properties, from modern apartments to exclusive villas in the most sought-after locations.',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one row exists for settings
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Setup RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ===========================================================================
-- 4. Create Messages Table
-- ===========================================================================
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  phone text,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
