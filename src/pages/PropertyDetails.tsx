import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2, Heart, Bed, Bath, Square, Check, MessageCircle, Phone, Mail, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { formatCurrency, getImageUrl } from '../lib/utils';
import { updatePageMeta } from '../lib/seo';
import { Lightbox } from '../components/ui/lightbox';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PropertyDetails() {
  const { slug } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      if (!slug) return;
      
      // Try to load by slug, or by ID if slug fails
      let { data, error } = await supabase.from('properties').select('*').eq('slug', slug).single();
      
      if (!data && slug.match(/^[0-9a-f]{8}-/)) {
        const { data: dataById } = await supabase.from('properties').select('*').eq('id', slug).single();
        if (dataById) data = dataById;
      }
      
      if (data) {
        // Ensure arrays
        data.gallery = data.gallery || [];
        data.amenities = data.features || ["Air Conditioning", "WiFi", "Parking", "Security"];
        setProperty(data);
        updatePageMeta({
          title: data.title,
          description: `${data.title} - ${data.listing_type} for ${formatCurrency(data.price)}. Located in ${data.location_city || 'East Legon, Ghana'}. ${data.description?.slice(0, 150) || ''}`,
          image: getImageUrl(data.main_image),
        });
      }
      setLoading(false);
    }
    loadProperty();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-600">Loading...</div>;
  if (!property) return <div className="min-h-screen flex flex-col items-center justify-center text-stone-600"><h2 className="text-2xl font-bold mb-4">Property Not Found</h2><Link to="/properties"><Button>Back to Properties</Button></Link></div>;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Helper to extract youtube/vimeo/gdrive embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  const embedUrl = getEmbedUrl(property.video_url);

  const whatsappMsg = encodeURIComponent(
    `Hello Duchessot Real Estate!\n\n` +
    `I am interested in inquiring about this property:\n` +
    `🏠 *Property:* ${property.title}\n` +
    `🏷️ *Listing:* For ${property.listing_type} (${property.property_type || 'Property'})\n` +
    `💰 *Price:* ${formatCurrency(property.price)}${property.listing_type === 'Rent' ? '/mo' : property.listing_type === 'Short Let' ? '/night' : ''}\n` +
    `📍 *Location:* ${property.location_address ? property.location_address + ', ' : ''}${property.location_city || 'Accra, Ghana'}\n\n` +
    `Please share more details and viewing availability. Thank you!`
  );
  const whatsappUrl = `https://wa.me/233542242404?text=${whatsappMsg}`;

  return (
    <div className="bg-stone-50 min-h-screen pb-24">
      {lightboxOpen && property.gallery?.length > 0 && (
        <Lightbox 
          images={property.gallery} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}

      {/* Top Nav Back */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/properties" className="inline-flex items-center text-sm font-medium text-stone-700 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Properties
        </Link>
      </div>

      {/* Main Gallery Area */}
      {property.gallery && property.gallery.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[50vh] min-h-[400px] max-h-[600px] rounded-2xl overflow-hidden cursor-pointer group" onClick={() => openLightbox(0)}>
            <div className={`border-stone-200 relative ${property.gallery.length > 1 ? 'md:col-span-3' : 'md:col-span-4'}`}>
              <img src={property.gallery[0]} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            {property.gallery.length > 1 && (
              <div className="hidden md:flex flex-col gap-4">
                <img src={property.gallery[1]} alt="Gallery 1" className="w-full h-1/2 object-cover" />
                {property.gallery.length > 2 && (
                  <div className="relative w-full h-1/2">
                    <img src={property.gallery[2]} alt="Gallery 2" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Button variant="outline" className="bg-white/90 backdrop-blur-md border-primary/20 text-stone-900 hover:bg-primary hover:text-white" onClick={(e) => { e.stopPropagation(); openLightbox(0); }}>
                        <ImageIcon className="h-4 w-4 mr-2" /> View All Photos
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Header Info */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="inline-block border-stone-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-stone-200 text-stone-900 mb-4">
                    For {property.listing_type}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-stone-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{property.location_address}, {property.location_city}</span>
                  </div>
                </div>
                <div className="flex gap-2 hidden md:flex">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-stone-200"><Share2 className="h-4 w-4 text-stone-600" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-stone-200"><Heart className="h-4 w-4 text-stone-600" /></Button>
                </div>
              </div>

              <div className="flex items-center gap-6 py-6 border-y border-stone-200 mt-8">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-6 w-6 text-stone-400" />
                    <span className="font-medium text-stone-900">{property.bedrooms} Beds</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-6 w-6 text-stone-400" />
                    <span className="font-medium text-stone-900">{property.bathrooms} Baths</span>
                  </div>
                )}
                {property.area_sqft > 0 && (
                  <div className="flex items-center gap-2">
                    <Square className="h-6 w-6 text-stone-400" />
                    <span className="font-medium text-stone-900">{property.area_sqft} sqft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-4">About this property</h2>
              <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2 text-stone-700">
                      <div className="border border-stone-200 p-1 rounded-full"><Check className="h-3 w-3 text-stone-900" /></div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Tour */}
            {embedUrl && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <Video className="h-6 w-6 text-primary" /> Video Tour
                </h2>
                <div className="aspect-video border border-stone-200 rounded-2xl overflow-hidden bg-stone-100">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={embedUrl} 
                    title="Property Video Tour" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Map Placeholder */}
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Location</h2>
              <div className="aspect-video border-stone-200 rounded-2xl overflow-hidden border border-stone-200">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location_address + ' ' + property.location_city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            </div>

          </div>

          {/* Sidebar - Sticky Inquiry Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200">
              <div className="mb-6 pb-6 border-b border-stone-100">
                <p className="text-sm font-medium text-stone-500 mb-1">Price</p>
                <div className="text-3xl font-bold text-stone-900">
                  {formatCurrency(property.price)}
                  <span className="text-base font-normal text-stone-500">
                    {property.listing_type === 'Rent' ? '/mo' : property.listing_type === 'Short Let' ? '/night' : ''}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-2 font-medium bg-green-50 inline-block px-2 py-1 rounded border border-green-200">{property.status || 'Available'}</p>
              </div>

              <div className="space-y-4">
                <Button className="w-full h-12 text-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" /> Inquire via WhatsApp
                  </a>
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12 gap-2 border-stone-200 text-stone-700 hover:bg-stone-50" asChild>
                    <a href="tel:0542242404">
                      <Phone className="h-4 w-4" /> Call
                    </a>
                  </Button>
                  <Button variant="outline" className="h-12 gap-2 border-stone-200 text-stone-700 hover:bg-stone-50" asChild>
                    <a href="mailto:duchessot@yahoo.com">
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-stone-100">
                <p className="text-sm text-stone-500 text-center">Listed by Duchessot Real Estate</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
