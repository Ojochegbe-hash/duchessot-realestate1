-- Create settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  logo_url text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  linkedin_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one row exists
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Setup RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to settings" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Add video_url to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_url text;
