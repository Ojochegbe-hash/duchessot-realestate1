import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Video, ExternalLink, Edit3, Check, Play, Plus, Search, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { getVideoEmbedUrl } from '../../lib/utils';

export default function AdminVideos() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'has_video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('properties')
        .select('id, title, video_url, slug, gallery, location_city')
        .order('created_at', { ascending: false });

      if (data) {
        setProperties(data);
      }
    } catch (err) {
      console.error("Error loading property videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSaveVideoUrl = async (id: string) => {
    try {
      setSavingId(id);
      const { error } = await supabase
        .from('properties')
        .update({ video_url: editingUrl })
        .eq('id', id);

      if (error) {
        alert('Failed to update video URL: ' + error.message);
      } else {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, video_url: editingUrl } : p));
        setEditingId(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving video link.');
    } finally {
      setSavingId(null);
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'has_video') {
      return matchesSearch && p.video_url && p.video_url.trim() !== '';
    }
    return matchesSearch;
  });

  const withVideoCount = properties.filter(p => p.video_url && p.video_url.trim() !== '').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Property Video Tours
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            Embed & preview virtual walkthroughs ({withVideoCount} properties with videos out of {properties.length})
          </p>
        </div>

        <Link
          to="/admin/properties"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-sm transition-all hover:scale-[1.02]"
        >
          <Building2 className="w-4 h-4" />
          <span>Property Catalog</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'all' 
                ? 'bg-primary text-white shadow-xs' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Properties ({properties.length})
          </button>
          <button
            onClick={() => setFilter('has_video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'has_video' 
                ? 'bg-primary text-white shadow-xs' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            With Video Tours ({withVideoCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search property title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Video Property Cards Grid */}
      {loading ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
          Loading video player listings...
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-stone-200/80 text-stone-500 p-8">
          <Video className="mx-auto h-12 w-12 text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-900">No properties found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {filter === 'has_video' ? 'No property currently has a video link attached.' : 'No property matches your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProperties.map(p => {
            const embed = getVideoEmbedUrl(p.video_url);
            const isEditing = editingId === p.id;

            return (
              <div 
                key={p.id} 
                className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Embedded Player or Placeholder */}
                  <div className="aspect-video bg-stone-950 relative overflow-hidden flex items-center justify-center">
                    {embed.type === 'iframe' ? (
                      <iframe
                        src={embed.url}
                        title={p.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : embed.type === 'video' ? (
                      <video src={embed.url} controls className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-6 text-stone-400">
                        <Video className="w-12 h-12 mx-auto text-stone-700 mb-2" />
                        <p className="text-xs font-medium text-stone-400">No video tour attached yet</p>
                        <button
                          onClick={() => {
                            setEditingId(p.id);
                            setEditingUrl(p.video_url || '');
                          }}
                          className="mt-3 px-4 py-1.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-sm"
                        >
                          + Attach Video Link
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Details & Inline Edit */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-stone-900 text-base">{p.title}</h4>
                        <p className="text-xs text-stone-500">{p.location_city || 'Ghana'}</p>
                      </div>

                      {p.video_url && (
                        <a 
                          href={p.video_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-primary/10 hover:text-primary text-stone-600 transition-colors"
                          title="Open original video source"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <label className="block text-xs font-bold text-stone-700">
                          Paste YouTube, Vimeo, Google Drive or MP4 Video Link
                        </label>
                        <input
                          type="text"
                          value={editingUrl}
                          onChange={(e) => setEditingUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveVideoUrl(p.id)}
                            disabled={savingId === p.id}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-light shadow-xs flex items-center gap-1"
                          >
                            {savingId === p.id ? 'Saving...' : 'Save Video'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="truncate max-w-[220px] font-mono text-[11px]">
                          {p.video_url || 'No link configured'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(p.id);
                            setEditingUrl(p.video_url || '');
                          }}
                          className="text-primary font-bold hover:underline shrink-0 flex items-center gap-1 ml-2"
                        >
                          <Edit3 className="w-3 h-3" /> Change Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-stone-50/50 border-t border-stone-100 flex gap-3">
                  <Link 
                    to={`/admin/properties/${p.id}/edit`}
                    className="flex-1 py-2 text-center rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors"
                  >
                    Edit Property
                  </Link>
                  <Link 
                    to={`/properties/${p.slug}`}
                    target="_blank"
                    className="flex-1 py-2 text-center rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
                  >
                    View on Site
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
