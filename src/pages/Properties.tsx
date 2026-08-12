import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Search, Filter, LayoutGrid, Map as MapIcon, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/supabase';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [searchParams] = useSearchParams();
  const [listingType, setListingType] = useState(searchParams.get('type') || 'All');
  const [priceRange, setPriceRange] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) {
          // ensure arrays and parse location for map
          const processed = data.map(p => ({
            ...p,
            gallery: p.gallery || p.images || [],
            lat: p.lat || 5.6358 + (Math.random() - 0.5) * 0.05, // fake coords for demo map if missing
            lng: p.lng || -0.1601 + (Math.random() - 0.5) * 0.05,
          }));
          setProperties(processed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(p => {
    const title = p?.title || '';
    const location = p?.location_address || p?.location_city || '';
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                       location.toLowerCase().includes(search.toLowerCase());
    const matchType = propertyType === 'All' || p?.property_type === propertyType;
    const matchListing = listingType === 'All' || p?.listing_type === listingType;
    
    let matchPrice = true;
    if (priceRange !== 'All') {
      const price = Number(p?.price || 0);
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        matchPrice = price >= min && price <= max;
      } else {
        matchPrice = price >= min;
      }
    }
    
    return matchSearch && matchType && matchListing && matchPrice;
  });

  return (
    <div className="bg-white min-h-screen pt-8 pb-24">
      {/* Search Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-8">Find Your Next Home</h1>
        
        <div className="bg-stone-50 p-4 md:p-6 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200 flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search by location or property..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <select 
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="px-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-primary min-w-[120px] appearance-auto"
            >
              <option value="All">All Types</option>
              <option value="Rent">Rent</option>
              <option value="Sell">Buy</option>
              <option value="Short Let">Short Let</option>
            </select>
            
            <select 
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-primary min-w-[140px] appearance-auto"
            >
              <option value="All">Property Type</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
            </select>

            <select 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-primary min-w-[140px] appearance-auto"
            >
              <option value="All">Price Range</option>
              <option value="0-1000">Under $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000+">Over $10,000</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <p className="text-stone-600">Showing <span className="font-bold text-stone-900">{filteredProperties.length}</span> properties</p>
          <div className="flex bg-stone-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <MapIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-stone-500 py-12">Loading properties...</div>
      ) : viewMode === 'grid' ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Link key={property.id} to={`/properties/${property.slug}`} className="group rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                      {property.listing_type}
                    </span>
                    {property.video_url && (
                      <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider flex items-center gap-1">
                        <Video className="w-3 h-3" /> Tour
                      </span>
                    )}
                  </div>
                  {property.gallery && property.gallery[0] ? (
                    <img 
                      src={property.gallery[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">No Image</div>
                  )}
                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="text-2xl font-bold text-white drop-shadow-md">
                      {formatCurrency(property.price)}
                      <span className="text-sm font-normal text-white/90">
                        {property.listing_type === 'Rent' ? '/mo' : property.listing_type === 'Short Let' ? '/night' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-stone-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
                  <div className="flex items-center text-stone-500 mb-6">
                    <MapPin className="h-4 w-4 mr-1 shrink-0" />
                    <span className="text-sm truncate">{property.location_address}, {property.location_city}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-4 text-stone-700">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{property.area_sqft}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {filteredProperties.length === 0 && (
            <div className="text-center py-24">
              <h3 className="text-xl font-bold text-stone-900 mb-2">No properties found</h3>
              <p className="text-stone-500">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-0">
          <div className="h-[70vh] rounded-2xl overflow-hidden border border-stone-200 relative shadow-xl shadow-stone-200/50">
            <MapContainer center={[5.6358, -0.1601]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredProperties.map(property => (
                <Marker key={property.id} position={[property.lat, property.lng]}>
                  <Popup className="rounded-xl">
                    <div className="p-1 min-w-[200px]">
                      {property.gallery && property.gallery[0] && (
                         <img src={property.gallery[0]} alt={property.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                      )}
                      <h4 className="font-bold text-stone-900 mb-1 leading-tight">{property.title}</h4>
                      <p className="text-primary font-bold mb-2">{formatCurrency(property.price)}</p>
                      <Link to={`/properties/${property.slug}`} className="text-xs font-semibold text-primary hover:underline flex items-center">
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
