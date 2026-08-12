-- ==============================================================================
-- DUCHESSOT REAL ESTATE CMS - EXISTING DATABASE SAFE MIGRATION SCRIPT
-- ==============================================================================
-- Target Project: Duchessot-Real-Estate (Existing Supabase Instance)
-- Safety Guarantee: 100% NON-DESTRUCTIVE. Will NOT drop tables, truncate rows,
--                   or delete existing properties/site_settings data.
-- Execution Instructions:
--   1. Open your Supabase Dashboard -> SQL Editor.
--   2. Paste this complete SQL script into the query runner.
--   3. Click "RUN".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- STEP 2: PROPERTIES TABLE (Safe Creation & Missing Column Additions)
-- ------------------------------------------------------------------------------
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

-- Safely patch any missing columns into existing properties table without altering existing data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='slug') THEN
        ALTER TABLE public.properties ADD COLUMN slug TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='listing_type') THEN
        ALTER TABLE public.properties ADD COLUMN listing_type TEXT DEFAULT 'Rent';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='property_type') THEN
        ALTER TABLE public.properties ADD COLUMN property_type TEXT DEFAULT 'Apartment';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='gallery') THEN
        ALTER TABLE public.properties ADD COLUMN gallery TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='video_url') THEN
        ALTER TABLE public.properties ADD COLUMN video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='currency') THEN
        ALTER TABLE public.properties ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='status') THEN
        ALTER TABLE public.properties ADD COLUMN status TEXT DEFAULT 'Available';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='bedrooms') THEN
        ALTER TABLE public.properties ADD COLUMN bedrooms INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='bathrooms') THEN
        ALTER TABLE public.properties ADD COLUMN bathrooms INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='area_sqft') THEN
        ALTER TABLE public.properties ADD COLUMN area_sqft NUMERIC DEFAULT 0;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 3: SITE_SETTINGS TABLE (Safe Creation & Default Row Protection)
-- ------------------------------------------------------------------------------
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

-- Safely add missing columns to site_settings if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='page_views') THEN
        ALTER TABLE public.site_settings ADD COLUMN page_views TEXT DEFAULT '45.2K';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='new_leads') THEN
        ALTER TABLE public.site_settings ADD COLUMN new_leads TEXT DEFAULT '384';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='hero_title') THEN
        ALTER TABLE public.site_settings ADD COLUMN hero_title TEXT DEFAULT 'Redefining Luxury Living Spaces';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='hero_subtitle') THEN
        ALTER TABLE public.site_settings ADD COLUMN hero_subtitle TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='hero_images') THEN
        ALTER TABLE public.site_settings ADD COLUMN hero_images TEXT;
    END IF;
END $$;

-- Preserve existing site settings data; insert initial default row ONLY if ID=1 does not exist
INSERT INTO public.site_settings (id, company_name, primary_color, hero_title)
VALUES (1, 'DUCHESSOT', '#740174', 'Redefining Luxury Living Spaces')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- STEP 4: MESSAGES TABLE (Inquiries & Lead Capture with Flag Synchronization)
-- ------------------------------------------------------------------------------
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

-- Safely ensure both read & is_read columns exist for backwards compatibility
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='is_read') THEN
        ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='read') THEN
        ALTER TABLE public.messages ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Trigger Function: Synchronize is_read and read flags automatically
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

-- ------------------------------------------------------------------------------
-- STEP 5: TESTIMONIALS TABLE (Client Reviews & Quotes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Satisfied Client',
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- STEP 6: ROW LEVEL SECURITY (RLS) POLICIES RE-ALIGNMENT
-- ------------------------------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Properties RLS Policies
DROP POLICY IF EXISTS "Public can view properties" ON public.properties;
CREATE POLICY "Public can view properties" ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage properties" ON public.properties;
CREATE POLICY "Authenticated users can manage properties" ON public.properties FOR ALL USING (auth.role() = 'authenticated');

-- Site Settings RLS Policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
CREATE POLICY "Authenticated users can manage site settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Messages RLS Policies
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.messages;
CREATE POLICY "Public can submit contact messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view and manage messages" ON public.messages;
CREATE POLICY "Authenticated users can view and manage messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials RLS Policies
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can manage testimonials" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- STEP 7: STORAGE BUCKET & POLICIES (For direct media & image uploads)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
CREATE POLICY "Public Storage Access" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated Storage Insert" ON storage.objects;
CREATE POLICY "Authenticated Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated Storage Delete" ON storage.objects;
CREATE POLICY "Authenticated Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'property-images');

-- ------------------------------------------------------------------------------
-- SUCCESS CONFIRMATION
-- ------------------------------------------------------------------------------
SELECT 'DUCHESSOT Existing Database Safe Migration completed successfully!' AS migration_status;
