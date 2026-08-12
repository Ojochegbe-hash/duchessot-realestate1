-- Add new columns for dynamic settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS company_name text DEFAULT 'DUCHESSOT';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#740174';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Poppins';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS page_views text DEFAULT '45.2K';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS new_leads text DEFAULT '384';
