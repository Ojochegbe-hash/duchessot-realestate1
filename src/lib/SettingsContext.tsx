import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface SiteSettings {
  company_name: string;
  logo_url: string;
  primary_color: string;
  font_family: string;
  page_views: string;
  new_leads: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_images: string;
}

const defaultSettings: SiteSettings = {
  company_name: 'DUCHESSOT',
  logo_url: '',
  primary_color: '#740174',
  font_family: 'Poppins',
  page_views: '45.2K',
  new_leads: '384',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  linkedin_url: '',
  hero_title: 'Redefining Luxury Living Spaces',
  hero_subtitle: 'Discover an exclusive portfolio of properties where architectural brilliance meets unparalleled comfort.',
  hero_images: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80\nhttps://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80\nhttps://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80',
};

const SettingsContext = createContext<{ settings: SiteSettings; refreshSettings: () => Promise<void> }>({
  settings: defaultSettings,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (data) {
        const newSettings = { ...defaultSettings, ...data };
        setSettings(newSettings);
        
        // Apply dynamic styles
        if (newSettings.primary_color) {
          document.documentElement.style.setProperty('--color-primary', newSettings.primary_color);
          // Simple logic for a lighter shade (e.g. for hovers)
          document.documentElement.style.setProperty('--color-primary-light', newSettings.primary_color + 'cc'); 
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
