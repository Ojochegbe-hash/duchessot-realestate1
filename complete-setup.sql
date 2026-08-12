-- 1. Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
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
  image text,
  images text[],
  gallery text[],
  video_url text,
  currency text DEFAULT 'USD',
  status text DEFAULT 'Available',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure video_url exists if table was already created before
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS gallery text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Setup RLS (Row Level Security) for properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to prevent errors on re-run, then recreate
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
    DROP POLICY IF EXISTS "Allow authenticated full access" ON public.properties;
EXCEPTION WHEN undefined_object THEN
    -- do nothing
END $$;

CREATE POLICY "Allow public read access" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access" ON public.properties FOR ALL USING (auth.role() = 'authenticated');


-- 2. Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
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
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure new columns exist if table was already created
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS company_name text DEFAULT 'DUCHESSOT';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#740174';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Poppins';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS page_views text DEFAULT '45.2K';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS new_leads text DEFAULT '384';

-- Ensure only one row exists
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Setup RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access to settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Allow authenticated full access to settings" ON public.site_settings;
EXCEPTION WHEN undefined_object THEN
END $$;

CREATE POLICY "Allow public read access to settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');


-- 3. Create Messages Table (for the dashboard unread messages feature)
CREATE TABLE IF NOT EXISTS public.messages (
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

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert to messages" ON public.messages;
    DROP POLICY IF EXISTS "Allow authenticated full access to messages" ON public.messages;
EXCEPTION WHEN undefined_object THEN
END $$;

CREATE POLICY "Allow public insert to messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
