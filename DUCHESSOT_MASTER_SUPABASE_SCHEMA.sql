-- ==============================================================================
-- DUCHESSOT REAL ESTATE CMS - MASTER SUPABASE CONSOLIDATED DATABASE SCHEMA
-- ==============================================================================
-- Description: Single source of truth SQL script for DUCHESSOT real estate platform.
-- Execution: Copy and paste this complete script into your Supabase SQL Editor and click RUN.
-- Safe to run on existing databases (Uses IF NOT EXISTS and column migrations).
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PROPERTIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  listing_type TEXT NOT NULL DEFAULT 'Rent',
  property_type TEXT NOT NULL DEFAULT 'Apartment',
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area_sqft NUMERIC DEFAULT 0,
  location_address TEXT,
  location_city TEXT,
  location_country TEXT DEFAULT 'Ghana',
  lat NUMERIC,
  lng NUMERIC,
  features TEXT[],
  image TEXT,
  images TEXT[],
  gallery TEXT[],
  video_url TEXT,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'Available',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist in case properties table was created from an older script
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='slug') THEN
        ALTER TABLE public.properties ADD COLUMN slug TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='listing_type') THEN
        ALTER TABLE public.properties ADD COLUMN listing_type TEXT DEFAULT 'Rent';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='property_type') THEN
        ALTER TABLE public.properties ADD COLUMN property_type TEXT DEFAULT 'Apartment';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='gallery') THEN
        ALTER TABLE public.properties ADD COLUMN gallery TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='video_url') THEN
        ALTER TABLE public.properties ADD COLUMN video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='currency') THEN
        ALTER TABLE public.properties ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='status') THEN
        ALTER TABLE public.properties ADD COLUMN status TEXT DEFAULT 'Available';
    END IF;
END $$;

-- ==============================================================================
-- 3. SITE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  company_name TEXT DEFAULT 'DUCHESSOT',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#740174',
  font_family TEXT DEFAULT 'Poppins',
  page_views TEXT DEFAULT '45.2K',
  new_leads TEXT DEFAULT '384',
  hero_title TEXT DEFAULT 'Redefining Luxury Living Spaces',
  hero_subtitle TEXT DEFAULT 'Discover an exclusive portfolio of properties where architectural brilliance meets unparalleled comfort.',
  hero_images TEXT DEFAULT 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80',
  facebook_url TEXT DEFAULT '',
  twitter_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  phone TEXT DEFAULT '0542242404',
  email TEXT DEFAULT 'duchessot@yahoo.com',
  address TEXT DEFAULT 'East Legon, Accra, Ghana',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guarantee default row with ID = 1 exists
INSERT INTO public.site_settings (id, company_name, primary_color, hero_title)
VALUES (1, 'DUCHESSOT', '#740174', 'Redefining Luxury Living Spaces')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add read/is_read columns if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_read') THEN
        ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='read') THEN
        ALTER TABLE public.messages ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Trigger to sync is_read and read columns
CREATE OR REPLACE FUNCTION sync_message_read_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read IS DISTINCT FROM OLD.read THEN
    NEW.is_read := NEW.read;
  ELSIF NEW.is_read IS DISTINCT FROM OLD.is_read THEN
    NEW.read := NEW.is_read;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_message_read ON public.messages;
CREATE TRIGGER trg_sync_message_read
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_message_read_status();

-- ==============================================================================
-- 5. TESTIMONIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Satisfied Client',
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default testimonials if table is empty
INSERT INTO public.testimonials (id, name, role, text, rating)
SELECT 'testi-1', 'Sarah Jenkins', 'Expat & Homeowner', 'Finding a home seemed daunting until I met the Duchessot team. Their professionalism and exclusive listings made the transition seamless.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials);

INSERT INTO public.testimonials (id, name, role, text, rating)
SELECT 'testi-2', 'Kwame Mensah', 'Property Investor', 'The level of market insight Duchessot provides is unmatched. They helped me secure a high-yield investment property that exceeded my expectations.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE id = 'testi-2');

INSERT INTO public.testimonials (id, name, role, text, rating)
SELECT 'testi-3', 'Elena Rodriguez', 'Diplomat', 'Security, luxury, and privacy were my top priorities. Duchessot understood exactly what I needed and delivered a phenomenal villa in record time.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials WHERE id = 'testi-3');

-- ==============================================================================
-- 6. INITIAL DEMO PROPERTIES (If empty)
-- ==============================================================================
INSERT INTO public.properties (
  title, slug, description, price, listing_type, property_type, bedrooms, bathrooms, area_sqft, location_address, location_city, gallery, currency, status
)
SELECT 
  'The Imperial Palace Villa',
  'imperial-palace-villa',
  'An exquisite 5-bedroom luxury estate featuring a private infinity pool, panoramic skyline views, smart automation, and private security detail.',
  1250000,
  'Sell',
  'Villa',
  5,
  6,
  6500,
  'Airport Hills Estate',
  'Accra',
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ],
  'USD',
  'Available'
WHERE NOT EXISTS (SELECT 1 FROM public.properties);

INSERT INTO public.properties (
  title, slug, description, price, listing_type, property_type, bedrooms, bathrooms, area_sqft, location_address, location_city, gallery, currency, status
)
SELECT 
  'East Legon Executive Penthouse',
  'east-legon-executive-penthouse',
  'Modern 3-bedroom penthouse with wrap-around terrace, floor-to-ceiling glass walls, fully integrated kitchen, and resort amenities.',
  3500,
  'Rent',
  'Apartment',
  3,
  3,
  3200,
  'East Legon Residential Area',
  'Accra',
  ARRAY[
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
  ],
  'USD',
  'Available'
WHERE NOT EXISTS (SELECT 1 FROM public.properties WHERE slug = 'east-legon-executive-penthouse');

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Properties Policies
DROP POLICY IF EXISTS "Public can view properties" ON public.properties;
CREATE POLICY "Public can view properties" ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage properties" ON public.properties;
CREATE POLICY "Authenticated users can manage properties" ON public.properties FOR ALL USING (auth.role() = 'authenticated');

-- Site Settings Policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
CREATE POLICY "Authenticated users can manage site settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Messages Policies
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.messages;
CREATE POLICY "Public can submit contact messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view and manage messages" ON public.messages;
CREATE POLICY "Authenticated users can view and manage messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials Policies
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can manage testimonials" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 8. STORAGE BUCKET CONFIGURATION (For image & document uploads)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
CREATE POLICY "Public Storage Access" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated Storage Insert" ON storage.objects;
CREATE POLICY "Authenticated Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated Storage Delete" ON storage.objects;
CREATE POLICY "Authenticated Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'property-images');

-- ==============================================================================
-- SUCCESS CONFIRMATION
-- ==============================================================================
SELECT 'DUCHESSOT Master Database Schema executed successfully!' AS status;
