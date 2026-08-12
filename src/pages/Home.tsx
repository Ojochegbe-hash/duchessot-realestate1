import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Bed, Bath, Square, Building, Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { formatCurrency, getImageUrl } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_TESTIMONIALS = [
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

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>(DEFAULT_TESTIMONIALS);
  const { settings } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse hero images array
  const rawImages = (settings.hero_images || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const heroImages = rawImages.length > 0 
    ? rawImages.map(url => getImageUrl(url))
    : [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80'
      ];

  // Auto transition hero slides every 5 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (data) {
          setFeaturedProperties(data.map(p => ({
            ...p,
            gallery: p.gallery || p.images || []
          })));
        }
      } catch (err) {}
    }

    async function fetchTestimonials() {
      try {
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          const savedLocal = localStorage.getItem('site_testimonials');
          if (savedLocal) {
            try {
              const parsed = JSON.parse(savedLocal);
              if (parsed && parsed.length > 0) setTestimonials(parsed);
            } catch (e) {}
          }
        }
      } catch (err) {
        const savedLocal = localStorage.getItem('site_testimonials');
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal);
            if (parsed && parsed.length > 0) setTestimonials(parsed);
          } catch (e) {}
        }
      }
    }

    fetchFeatured();
    fetchTestimonials();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Hero Section - Dynamic Background Slideshow */}
      <section className="relative pt-28 pb-36 lg:pt-40 lg:pb-52 overflow-hidden bg-stone-900 text-white min-h-[85vh] flex items-center justify-center">
        {/* Dynamic Background Image Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={heroImages[currentSlide]}
              alt="Luxury Real Estate"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full h-full object-cover filter contrast-[1.08] brightness-[0.9]"
            />
          </AnimatePresence>
          {/* Subtle vignette dark gradient overlay behind text */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-950/80 via-stone-950/40 to-stone-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-stone-950/20" />
        </div>

        {/* Carousel Arrow Controls */}
        {heroImages.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentSlide((currentSlide - 1 + heroImages.length) % heroImages.length)}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-primary backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((currentSlide + 1) % heroImages.length)}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-primary backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary-foreground text-sm font-semibold tracking-wider uppercase mb-8 shadow-xl">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Duchessot Luxury Real Estate
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-md">
              {settings.hero_title || 'Redefining Luxury Living Spaces'}
            </h1>
            
            <p className="text-lg sm:text-2xl text-stone-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
              {settings.hero_subtitle || 'Discover an exclusive portfolio of properties. Where architectural brilliance meets unparalleled comfort.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Button size="lg" className="text-lg px-10 h-16 rounded-full bg-primary hover:bg-primary-light text-white shadow-2xl shadow-primary/40 transition-all hover:scale-105" asChild>
                <Link to="/properties">Explore Properties <ChevronRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 h-16 rounded-full text-white border-white/40 hover:bg-white/10 backdrop-blur-md transition-all" asChild>
                <Link to="/contact">Contact an Agent</Link>
              </Button>
            </div>

            {/* Slide Indicators */}
            {heroImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-primary' : 'w-2.5 bg-white/40 hover:bg-white/80'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold mb-2">150<span className="text-primary-light">+</span></div>
              <div className="text-sm font-medium text-white/80 uppercase tracking-wider">Premium Listings</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M<span className="text-primary-light">+</span></div>
              <div className="text-sm font-medium text-white/80 uppercase tracking-wider">Property Value</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">12<span className="text-primary-light">+</span></div>
              <div className="text-sm font-medium text-white/80 uppercase tracking-wider">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99<span className="text-primary-light">%</span></div>
              <div className="text-sm font-medium text-white/80 uppercase tracking-wider">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">Featured Listings</h2>
              <p className="text-stone-600 max-w-2xl text-lg font-light">Discover our hand-picked selection of premium properties available for sale, rent, or short-let.</p>
            </div>
            <Link to="/properties" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors bg-white px-6 py-3 rounded-full shadow-sm border border-stone-200">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <Link key={property.id} to={`/properties/${property.slug}`} className="group block bg-white rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 border border-stone-200 shadow-sm hover:shadow-xl hover:shadow-[#740174]/10">
                <div className="relative aspect-[4/3] overflow-hidden p-3">
                  <img 
                    src={getImageUrl(property.gallery?.[0])} 
                    alt={property.title}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                    For {property.listing_type}
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-3xl font-bold text-primary mb-3">
                    {formatCurrency(property.price)}
                    <span className="text-lg text-stone-500 font-normal">
                      {property.listing_type === 'Rent' ? '/mo' : property.listing_type === 'Short Let' ? '/night' : ''}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3 line-clamp-1 group-hover:text-primary-light transition-colors">{property.title}</h3>
                  <div className="flex items-center text-stone-500 text-sm mb-6">
                    <MapPin className="h-4 w-4 mr-2 shrink-0 text-primary-light" />
                    <span className="truncate">{property.location_city}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-stone-600 text-sm pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary-light" />
                      <span className="font-semibold">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary-light" />
                      <span className="font-semibold">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary-light" />
                      <span className="font-semibold">{property.area_sqft} <span className="text-stone-400 font-normal">sqft</span></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Button asChild className="rounded-full bg-white text-primary border border-primary/20 hover:bg-primary/5">
               <Link to="/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900 mb-6">Why Choose Duchessot?</h2>
            <p className="text-stone-600 text-lg font-light leading-relaxed">
              We provide more than just properties; we provide lifestyles. Experience the pinnacle of real estate service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-6xl mx-auto">
            <div className="space-y-4 p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Building className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Premium Portfolio</h3>
              <p className="text-stone-600">Exclusive access to the most luxurious and sought-after properties in prime locations.</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Local Expertise</h3>
              <p className="text-stone-600">Deep understanding of the real estate market to guide you effectively.</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <ArrowRight className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Seamless Experience</h3>
              <p className="text-stone-600">From viewing to closing, we ensure a smooth, transparent, and professional process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">Success Stories</h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-lg font-light">
              Hear what our distinguished clients have to say about their experience with Duchessot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={testimonial.id || i} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm relative hover:shadow-md transition-shadow">
                <Quote className="absolute top-6 right-6 h-12 w-12 text-primary-light/20" />
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, star) => (
                    <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-stone-700 text-lg leading-relaxed mb-8 relative z-10 italic">
                  "{testimonial.text || testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  {testimonial.avatar_url ? (
                    <img src={getImageUrl(testimonial.avatar_url)} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover border border-stone-200" />
                  ) : null}
                  <div>
                    <div className="font-bold text-stone-900">{testimonial.name}</div>
                    <div className="text-sm text-stone-500 font-medium">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
