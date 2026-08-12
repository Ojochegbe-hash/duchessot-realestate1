const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace Hero Section
const heroStart = content.indexOf('{/* Hero Section */}');
const heroEnd = content.indexOf('{/* Featured Properties */}');

const newHero = `{/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Real Estate" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Ghana's Premier Real Estate Agency
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                Find Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Perfect Space</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-zinc-300 mb-10 max-w-2xl font-light leading-relaxed">
                Discover exclusive properties in East Legon. We curate the finest luxury homes, apartments, and short-lets for discerning clients.
              </p>
              
              {/* Quick Search Bar in Hero */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 max-w-2xl mb-12 shadow-2xl">
                <input 
                  type="text" 
                  placeholder="Location, neighborhood, or city..."
                  className="flex-1 bg-zinc-900/50 border border-zinc-700/50 text-white placeholder:text-zinc-400 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-colors"
                />
                <Button size="lg" className="h-12 px-8 rounded-xl text-base bg-amber-600 hover:bg-amber-500 text-white" asChild>
                  <Link to="/properties">Search Properties</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 sm:gap-12 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">150+</div>
                  <div className="text-sm text-zinc-400 uppercase tracking-wider">Premium Listings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">$50M+</div>
                  <div className="text-sm text-zinc-400 uppercase tracking-wider">Property Value</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">12 Yrs</div>
                  <div className="text-sm text-zinc-400 uppercase tracking-wider">Market Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      `;

if (heroStart !== -1 && heroEnd !== -1) {
    content = content.substring(0, heroStart) + newHero + content.substring(heroEnd);
}

// Add testimonials before Why Choose Us
const whyChooseUs = content.indexOf('{/* Why Choose Us */}');
const testimonials = `
      {/* Testimonials */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-50 mb-4 tracking-tight">Client Success Stories</h2>
            <p className="text-zinc-400 text-lg font-light">Hear what our clients have to say about their experience finding their perfect property with us.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                name: "Sarah & James Osei",
                role: "Homeowners",
                content: "Duchessot made finding our dream home in East Legon an absolute breeze. Their attention to detail and understanding of our needs was exceptional. We couldn't be happier with our new villa.",
                rating: 5
              },
              {
                id: 2,
                name: "Michael Mensah",
                role: "Property Investor",
                content: "As an investor, I need a reliable partner. Duchessot provides premium listings that guarantee great returns. Their team's professionalism and market knowledge in the Windy Hill District is unmatched.",
                rating: 5
              },
              {
                id: 3,
                name: "Elena Richardson",
                role: "Expatriate",
                content: "Relocating to Accra was daunting until I found Duchessot. They handled everything perfectly, finding me a beautiful short-let apartment that felt like home from day one.",
                rating: 5
              }
            ].map(testimonial => (
              <div key={testimonial.id} className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 shadow-xl relative mt-4">
                <Quote className="absolute -top-4 -left-2 h-10 w-10 text-amber-500/20 rotate-180" />
                <div className="flex text-amber-500 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <h4 className="font-bold text-zinc-50">{testimonial.name}</h4>
                  <p className="text-sm text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      `;

if (whyChooseUs !== -1) {
    content = content.substring(0, whyChooseUs) + testimonials + content.substring(whyChooseUs);
}

// Add Star and Quote to lucide imports
if (!content.includes('Star')) {
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { Star, Quote } from 'lucide-react';");
}

fs.writeFileSync('src/pages/Home.tsx', content);
