import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { Link2 as Facebook, Link2 as Instagram, Link2 as Linkedin, Link2 as Twitter, Palette, Type, Building2, BarChart } from "lucide-react";
import { useSettings } from '../../lib/SettingsContext';
import { getImageUrl } from '../../lib/utils';

export default function Settings() {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState({
    company_name: '',
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
    hero_images: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
        if (data) {
          setSettings({
            company_name: data.company_name || '',
            logo_url: data.logo_url || '',
            primary_color: data.primary_color || '#740174',
            font_family: data.font_family || 'Poppins',
            page_views: data.page_views || '45.2K',
            new_leads: data.new_leads || '384',
            facebook_url: data.facebook_url || '',
            twitter_url: data.twitter_url || '',
            instagram_url: data.instagram_url || '',
            linkedin_url: data.linkedin_url || '',
            hero_title: data.hero_title || 'Redefining Luxury Living Spaces',
            hero_subtitle: data.hero_subtitle || 'Discover an exclusive portfolio of properties where architectural brilliance meets unparalleled comfort.',
            hero_images: data.hero_images || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80\nhttps://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80\nhttps://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80',
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const [uploadingHero, setUploadingHero] = useState(false);

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingHero(true);
      
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const newUrl = reader.result as string;
        setSettings(prev => ({
          ...prev,
          hero_images: prev.hero_images ? prev.hero_images.trim() + '\n' + newUrl : newUrl
        }));
        setUploadingHero(false);
      };
      reader.onerror = (error) => {
        console.error('Error uploading hero image:', error);
        setUploadingHero(false);
        alert('Failed to convert image.');
      };
    } catch (error: any) {
      alert(error.message || 'Error uploading file');
      setUploadingHero(false);
    }
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingLogo(true);
      
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSettings(prev => ({
          ...prev,
          logo_url: reader.result as string
        }));
        setUploadingLogo(false);
      };
      reader.onerror = (error) => {
        console.error('Error converting to Base64:', error);
        setUploadingLogo(false);
        alert('Failed to upload logo.');
      };
    } catch (error: any) {
      alert(error.message || 'Error uploading file');
      setUploadingLogo(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clean hero_images lines through getImageUrl
      const cleanedHeroImages = settings.hero_images
        ? settings.hero_images
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => getImageUrl(line))
            .join('\n')
        : '';

      const cleanedLogoUrl = settings.logo_url ? getImageUrl(settings.logo_url) : '';

      const payload = {
        ...settings,
        logo_url: cleanedLogoUrl,
        hero_images: cleanedHeroImages,
      };

      const { error } = await supabase.from('site_settings').upsert({ id: 1, ...payload });
      if (error) throw error;

      setSettings(payload);
      
      await refreshSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      alert('Settings saved successfully! The website has been updated.');
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. Make sure you have run the migration SQL.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-600 mt-1">Manage your website configuration, branding, and dashboard stats.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-8">
        
        {/* General Info */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2 flex items-center gap-2"><Building2 className="w-5 h-5" /> General Identity</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Company Name (Leave blank to hide)</label>
              <input type="text" name="company_name" value={settings.company_name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Company Logo URL</label>
              <input type="text" name="logo_url" value={settings.logo_url} onChange={handleChange} placeholder="https://example.com/logo.png" className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
              <p className="text-xs text-stone-500 mt-2">Enter an HTML link to an image (Google Drive direct link, Imgur, etc).</p>
            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">Or Upload Logo from computer</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
              />
              {uploadingLogo && <p className="text-sm text-stone-500">Uploading...</p>}
            </div>

            </div>
            {settings.logo_url && (
              <div className="mt-4 p-4 border border-stone-200 rounded-lg bg-stone-50 inline-block">
                <img src={getImageUrl(settings.logo_url)} alt="Logo preview" className="h-12 object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Homepage Settings */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2 flex items-center gap-2"><Type className="w-5 h-5" /> Homepage Content & Hero Banner</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Hero Section Title</label>
              <input type="text" name="hero_title" value={settings.hero_title} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Hero Section Subtitle</label>
              <textarea name="hero_subtitle" value={settings.hero_subtitle} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Dynamic Hero Background Images (Paste HTML or Direct URLs, One per line)</label>
              <textarea 
                name="hero_images" 
                value={settings.hero_images} 
                onChange={handleChange} 
                rows={4} 
                placeholder="https://example.com/hero1.jpg&#10;https://example.com/hero2.jpg"
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none font-mono text-xs" 
              />
              <p className="text-xs text-stone-500 mt-1">Paste image URLs or HTML links for the sliding background pictures in the main homepage hero section.</p>
              
              <div className="mt-3">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Or Upload Hero Image from Computer</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingHero}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light text-xs"
                />
                {uploadingHero && <p className="text-xs text-stone-500 mt-1">Uploading...</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2 flex items-center gap-2"><Palette className="w-5 h-5" /> Theme & Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Primary Color (Hex)</label>
              <div className="flex gap-2">
                <input type="color" name="primary_color" value={settings.primary_color} onChange={handleChange} className="h-10 w-12 rounded cursor-pointer" />
                <input type="text" name="primary_color" value={settings.primary_color} onChange={handleChange} className="flex-1 px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats (Mock Overrides) */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2 flex items-center gap-2"><BarChart className="w-5 h-5" /> Dashboard Stats Display</h2>
          <p className="text-sm text-stone-500 mb-4">Edit the static numbers shown on your dashboard.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Page Views Display</label>
              <input type="text" name="page_views" value={settings.page_views} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">New Leads Display</label>
              <input type="text" name="new_leads" value={settings.new_leads} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Social Media Links</h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-center"><Facebook className="text-stone-400 w-6 h-6" /><input type="text" name="facebook_url" value={settings.facebook_url} onChange={handleChange} className="flex-1 px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" /></div>
            <div className="flex gap-3 items-center"><Twitter className="text-stone-400 w-6 h-6" /><input type="text" name="twitter_url" value={settings.twitter_url} onChange={handleChange} className="flex-1 px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" /></div>
            <div className="flex gap-3 items-center"><Instagram className="text-stone-400 w-6 h-6" /><input type="text" name="instagram_url" value={settings.instagram_url} onChange={handleChange} className="flex-1 px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" /></div>
            <div className="flex gap-3 items-center"><Linkedin className="text-stone-400 w-6 h-6" /><input type="text" name="linkedin_url" value={settings.linkedin_url} onChange={handleChange} className="flex-1 px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none" /></div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex items-center">
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-light text-white">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {success && <span className="ml-4 text-green-600 font-medium text-sm">Settings saved successfully!</span>}
        </div>
      </div>
    </div>
  );
}
