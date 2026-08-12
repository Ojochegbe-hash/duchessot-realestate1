import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getImageUrl } from '../../lib/utils';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: 0,
    listing_type: 'Rent',
    property_type: 'Apartment',
    bedrooms: 0,
    bathrooms: 0,
    area_sqft: 0,
    location_address: '',
    location_city: '',
    location_country: 'Ghana',
    video_url: '',
    gallery: '', // we will parse this to array
    status: 'Available'
  });

  useEffect(() => {
    if (isEditing && id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propId: string) => {
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('id', propId).single();
      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          price: data.price || 0,
          listing_type: data.listing_type || 'Rent',
          property_type: data.property_type || 'Apartment',
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          area_sqft: data.area_sqft || 0,
          location_address: data.location_address || '',
          location_city: data.location_city || '',
          location_country: data.location_country || 'Ghana',
          video_url: data.video_url || '',
          gallery: data.gallery ? data.gallery.join('\n') : '',
          status: data.status || 'Available'
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load property');
      navigate('/admin/properties');
    } finally {
      setLoading(false);
    }
  };

  
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingImage(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // We will try to upload to a 'properties' bucket.
      // If it fails, we fall back to base64 so it still works for the user immediately!
      let { error: uploadError, data } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.warn('Storage upload failed, falling back to Base64:', uploadError.message);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            gallery: prev.gallery ? prev.gallery + '\n' + reader.result : reader.result as string
          }));
          setUploadingImage(false);
        };
        reader.onerror = (error) => {
          console.error('Error converting to Base64:', error);
          setUploadingImage(false);
          alert('Failed to upload image. Please try a smaller image or use a URL.');
        };
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);
        
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery ? prev.gallery + '\n' + publicUrl : publicUrl
      }));
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'bedrooms', 'bathrooms', 'area_sqft'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const propertyData = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        gallery: formData.gallery
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => getImageUrl(s))
      };

      if (isEditing) {
        const { error } = await supabase.from('properties').update(propertyData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('properties').insert([propertyData]);
        if (error) throw error;
      }
      
      alert('Property saved successfully! It will now reflect on your website.');
      navigate('/admin/properties');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save property: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/properties">
          <Button variant="outline" size="icon" className="h-10 w-10 border-stone-200">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
          <p className="text-stone-600 mt-1">Fill in the details for this real estate listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm space-y-8">
        
        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Property Title</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">URL Slug (optional)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. luxury-villa-accra" className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Price ($)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary appearance-auto">
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Listing Type</label>
              <select name="listing_type" value={formData.listing_type} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary appearance-auto">
                <option value="Rent">Rent</option>
                <option value="Sell">Sell</option>
                <option value="Short Let">Short Let</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Property Type</label>
              <select name="property_type" value={formData.property_type} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary appearance-auto">
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-stone-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {/* Details */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Bedrooms</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Bathrooms</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Area (sq ft)</label>
              <input type="number" name="area_sqft" value={formData.area_sqft} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="space-y-2 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Address</label>
                  <input type="text" name="location_address" value={formData.location_address} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">City</label>
                  <input type="text" name="location_city" value={formData.location_city} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Country</label>
                  <input type="text" name="location_country" value={formData.location_country} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" />
                </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Media & Samples</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Video Sample URL</label>
              <input 
                type="text" 
                name="video_url" 
                value={formData.video_url} 
                onChange={handleChange} 
                placeholder="https://youtube.com/watch?v=... or Google Drive link" 
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" 
              />
              <p className="text-xs text-stone-500">Provide a link to a video tour or property showcase (YouTube, Vimeo, or Google Drive).</p>
            </div>

            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Upload Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
              />
              {uploadingImage && <p className="text-sm text-stone-500">Uploading...</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Image Gallery URLs (One per line)</label>
              <textarea 
                name="gallery" 
                value={formData.gallery} 
                onChange={handleChange} 
                rows={4} 
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex justify-end">
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-light text-white flex items-center gap-2 px-8">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Property'}
          </Button>
        </div>

      </form>
    </div>
  );
}
