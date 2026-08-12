import { Image as ImageIcon, Upload, Search, Copy, Check, ExternalLink, Trash2, Plus, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getImageUrl } from '../../lib/utils';
import { useSettings } from '../../lib/SettingsContext';

interface MediaItem {
  id: string;
  url: string;
  title: string;
  source: 'property' | 'hero' | 'logo' | 'custom';
  propertyId?: string;
  createdAt?: string;
}

export default function AdminMedia() {
  const { settings } = useSettings();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadAllMedia() {
      try {
        setLoading(true);
        const items: MediaItem[] = [];

        // 1. Fetch site settings logo & hero
        if (settings.logo_url) {
          items.push({
            id: 'logo-1',
            url: settings.logo_url,
            title: 'Company Brand Logo',
            source: 'logo',
          });
        }

        if (settings.hero_images) {
          const heroUrls = settings.hero_images.split('\n').map(s => s.trim()).filter(Boolean);
          heroUrls.forEach((url, i) => {
            items.push({
              id: `hero-${i}`,
              url,
              title: `Homepage Hero Slide #${i + 1}`,
              source: 'hero',
            });
          });
        }

        // 2. Fetch properties gallery
        const { data: properties } = await supabase
          .from('properties')
          .select('id, title, gallery, created_at');

        if (properties) {
          properties.forEach(prop => {
            if (Array.isArray(prop.gallery)) {
              prop.gallery.forEach((url: string, idx: number) => {
                if (url && typeof url === 'string') {
                  items.push({
                    id: `prop-${prop.id}-${idx}`,
                    url,
                    title: `${prop.title} (Photo ${idx + 1})`,
                    source: 'property',
                    propertyId: prop.id,
                    createdAt: prop.created_at,
                  });
                }
              });
            }
          });
        }

        // 3. Saved custom media
        const savedCustom = localStorage.getItem('site_custom_media');
        if (savedCustom) {
          try {
            const parsed = JSON.parse(savedCustom);
            if (Array.isArray(parsed)) items.push(...parsed);
          } catch (e) {}
        }

        setMediaItems(items);
      } catch (err) {
        console.error("Error loading media items:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllMedia();
  }, [settings]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const newUrl = reader.result as string;
      const newItem: MediaItem = {
        id: `custom-${Date.now()}`,
        url: newUrl,
        title: file.name || 'Uploaded Media',
        source: 'custom',
        createdAt: new Date().toISOString(),
      };

      const updatedCustom = [newItem, ...mediaItems];
      setMediaItems(updatedCustom);

      // Save custom media in localStorage fallback
      const currentCustom = JSON.parse(localStorage.getItem('site_custom_media') || '[]');
      localStorage.setItem('site_custom_media', JSON.stringify([newItem, ...currentCustom]));

      setUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading image file.');
      setUploading(false);
    };
  };

  const filteredItems = mediaItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Media Library
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            Manage all property gallery photos, hero banners, and brand assets ({mediaItems.length} items total)
          </p>
        </div>

        <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-sm cursor-pointer transition-all hover:scale-[1.02]">
          <Upload className="w-4 h-4" />
          <span>Upload New Image</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            disabled={uploading} 
            className="hidden" 
          />
        </label>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media by title or source..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="text-xs text-stone-500 font-medium self-end sm:self-center">
          Showing {filteredItems.length} of {mediaItems.length} media files
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
          Loading Media Library assets...
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100 p-2">
                <img 
                  src={getImageUrl(item.url)} 
                  alt={item.title} 
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" 
                />

                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shadow-sm ${
                  item.source === 'property' ? 'bg-primary text-white' :
                  item.source === 'hero' ? 'bg-amber-500 text-white' :
                  item.source === 'logo' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {item.source}
                </span>

                <button 
                  onClick={() => setSelectedImage(getImageUrl(item.url))}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="View full image"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3">
                <h4 className="text-xs font-semibold text-stone-800 line-clamp-1" title={item.title}>
                  {item.title}
                </h4>

                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-stone-100 pt-2">
                  <button 
                    onClick={() => handleCopy(item.id, item.url)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-stone-100 hover:bg-primary/10 hover:text-primary text-[11px] font-semibold text-stone-600 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {item.propertyId && (
                    <Link
                      to={`/admin/properties/${item.propertyId}/edit`}
                      className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                      title="Edit Property"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 text-stone-500">
          <ImageIcon className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-800">No media found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            No media items matched your search query. Try uploading new images or checking your property listings.
          </p>
        </div>
      )}

      {/* Lightbox Image View Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-stone-900 border border-stone-800 p-2 shadow-2xl">
            <img src={selectedImage} alt="Full view" className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="mt-3 block mx-auto px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
            >
              Close Lightbox
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
