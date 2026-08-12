ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_title text DEFAULT 'Find Your Dream Luxury Home';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_subtitle text DEFAULT 'Discover the finest properties, from modern apartments to exclusive villas in the most sought-after locations.';
