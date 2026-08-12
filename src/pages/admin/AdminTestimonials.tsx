import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Trash2, Edit2, Star, Quote, Check, Upload, Search, X } from 'lucide-react';
import { getImageUrl } from '../../lib/utils';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar_url?: string;
  created_at?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: "Sarah Jenkins",
    role: "Expat & Homeowner",
    text: "Finding a home seemed daunting until I met the Duchessot team. Their professionalism and exclusive listings made the transition seamless.",
    rating: 5,
    avatar_url: ""
  },
  {
    id: '2',
    name: "Kwame Mensah",
    role: "Property Investor",
    text: "The level of market insight Duchessot provides is unmatched. They helped me secure a high-yield investment property that exceeded my expectations.",
    rating: 5,
    avatar_url: ""
  },
  {
    id: '3',
    name: "Elena Rodriguez",
    role: "Diplomat",
    text: "Security, luxury, and privacy were my top priorities. Duchessot understood exactly what I needed and delivered a phenomenal villa in record time.",
    rating: 5,
    avatar_url: ""
  }
];

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    rating: 5,
    avatar_url: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load testimonials from Supabase or localStorage fallback
  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setTestimonials(data);
      } else {
        const localData = localStorage.getItem('site_testimonials');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            setTestimonials(parsed.length > 0 ? parsed : DEFAULT_TESTIMONIALS);
          } catch (e) {
            setTestimonials(DEFAULT_TESTIMONIALS);
          }
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      }
    } catch (err) {
      const localData = localStorage.getItem('site_testimonials');
      if (localData) {
        try {
          setTestimonials(JSON.parse(localData));
        } catch (e) {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      } else {
        setTestimonials(DEFAULT_TESTIMONIALS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const saveToLocalAndDB = async (newList: Testimonial[]) => {
    setTestimonials(newList);
    localStorage.setItem('site_testimonials', JSON.stringify(newList));

    // Try saving single row or sync DB
    if (editingId) {
      const target = newList.find(t => t.id === editingId);
      if (target) {
        try {
          await supabase.from('testimonials').upsert(target);
        } catch (e) {}
      }
    } else {
      const newest = newList[0];
      if (newest) {
        try {
          await supabase.from('testimonials').insert(newest);
        } catch (e) {}
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'Satisfied Client',
      text: '',
      rating: 5,
      avatar_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData({
      name: t.name,
      role: t.role,
      text: t.text,
      rating: t.rating || 5,
      avatar_url: t.avatar_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client testimonial?')) return;
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem('site_testimonials', JSON.stringify(updated));

    try {
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (e) {}
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingAvatar(true);

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
      setUploadingAvatar(false);
    };
    reader.onerror = () => {
      alert('Failed to upload avatar image');
      setUploadingAvatar(false);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) {
      alert('Please fill in client name and testimonial text.');
      return;
    }

    setSaving(true);
    const cleanedAvatar = formData.avatar_url ? getImageUrl(formData.avatar_url) : '';
    const cleanedData = { ...formData, avatar_url: cleanedAvatar };

    if (editingId) {
      const updatedList = testimonials.map(t => 
        t.id === editingId ? { ...t, ...cleanedData } : t
      );
      await saveToLocalAndDB(updatedList);
    } else {
      const newTestimonial: Testimonial = {
        id: `testi-${Date.now()}`,
        ...cleanedData,
        created_at: new Date().toISOString()
      };
      const newList = [newTestimonial, ...testimonials];
      await saveToLocalAndDB(newList);
    }

    setSaving(false);
    setIsModalOpen(false);
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Client Testimonials
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            Manage real client quotes and reviews displayed on the website homepage ({testimonials.length} reviews)
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-sm transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <span className="text-xs text-stone-500 font-medium hidden sm:inline">
          Live website synced
        </span>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
          Loading client testimonials...
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 p-8">
          <Users className="h-12 w-12 mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-900">No testimonials found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto mb-4">
            Click "+ Add Testimonial" above to add your first client review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t) => (
            <div 
              key={t.id} 
              className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <Quote className="absolute top-5 right-5 h-10 w-10 text-primary/10" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-stone-700 text-sm italic leading-relaxed mb-6 font-light">
                  "{t.text}"
                </p>
              </div>

              {/* Client Info & Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <img 
                      src={getImageUrl(t.avatar_url)} 
                      alt={t.name} 
                      className="w-10 h-10 rounded-full object-cover border border-stone-200" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-stone-900 text-sm">{t.name}</div>
                    <div className="text-xs text-stone-500">{t.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenEditModal(t)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    title="Edit Testimonial"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 sm:p-8 relative my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-900">
                {editingId ? 'Edit Testimonial' : 'Add New Client Testimonial'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Client Full Name
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chief Nana Poku"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Role / Title / Location
                </label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Property Buyer, Airport Hills"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Star Rating
                </label>
                <select 
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Testimonial Quote / Review
                </label>
                <textarea 
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  placeholder="Write the client's experience..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Client Avatar Image (Paste URL or Upload Photo)
                </label>
                <input 
                  type="text" 
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none mb-2"
                />

                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                />
                {uploadingAvatar && <p className="text-xs text-stone-500 mt-1">Uploading avatar image...</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Testimonial' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
