-- Run this in your Supabase SQL Editor to create the properties table
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
  image text,
  images text[],
  status text DEFAULT 'Available',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow public read access to properties
CREATE POLICY "Allow public read access" ON public.properties
  FOR SELECT USING (true);

-- Allow authenticated users to manage properties (insert/update/delete)
CREATE POLICY "Allow authenticated full access" ON public.properties
  FOR ALL USING (auth.role() = 'authenticated');
