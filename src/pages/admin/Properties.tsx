import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Video, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    
    // Optimistically update state
    setProperties(prev => prev.filter(p => p.id !== id));

    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
        console.error("Error deleting property from Supabase:", error);
        alert(`Failed to delete property from database: ${error.message}`);
        fetchProperties(); // Re-fetch to restore state if delete failed
      }
    } catch (err: any) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property: " + (err.message || err));
      fetchProperties();
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.listing_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Properties</h1>
          <p className="text-stone-600 mt-1">Manage your real estate listings and media.</p>
        </div>
        <Link to="/admin/properties/new">
          <Button className="bg-primary hover:bg-primary-light text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Property
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg bg-stone-50 mb-6 max-w-md">
          <Search className="w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search properties..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-stone-900 placeholder:text-stone-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-sm">
                <th className="pb-4 font-medium px-4">Property</th>
                <th className="pb-4 font-medium px-4">Type</th>
                <th className="pb-4 font-medium px-4">Price</th>
                <th className="pb-4 font-medium px-4">Status</th>
                <th className="pb-4 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-stone-500">Loading...</td></tr>
              ) : filteredProperties.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-stone-500">No properties found.</td></tr>
              ) : (
                filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                          {prop.gallery && prop.gallery[0] ? (
                            <img src={prop.gallery[0]} alt={prop.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900 line-clamp-1">{prop.title}</div>
                          <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                            {prop.location_city}, {prop.location_country}
                            {prop.video_url && (
                              <span className="flex items-center gap-1 text-primary" title="Has Video Tour">
                                <Video className="w-3 h-3" /> Video
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-600 text-sm">
                      <span className="bg-stone-100 px-2 py-1 rounded text-stone-700">{prop.listing_type}</span>
                    </td>
                    <td className="py-4 px-4 text-stone-900 font-medium">
                      ${prop.price?.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700">
                        {prop.status || 'Available'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/properties/${prop.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-stone-600 border-stone-200 hover:bg-stone-100">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDelete(prop.id)}
                          className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
