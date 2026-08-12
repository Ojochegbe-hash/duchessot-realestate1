import { Link } from 'react-router-dom';
import { Menu, X, Building, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '../../lib/SettingsContext';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { getImageUrl } from '../../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();


  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={getImageUrl(settings.logo_url)} alt={settings.company_name || 'Logo'} className="h-10 w-auto object-contain" />
            ) : (
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
            )}
            {settings.company_name && (
              <span className="text-2xl font-bold tracking-tight text-primary">
                {settings.company_name}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-stone-600 hover:text-primary transition-colors">Home</Link>
            
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-primary transition-colors">
                Properties <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-stone-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                <div className="p-2 flex flex-col gap-1">
                  <Link to="/properties" className="px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">All Properties</Link>
                  <Link to="/properties?type=Rent" className="px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">For Rent</Link>
                  <Link to="/properties?type=Sell" className="px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">For Sale</Link>
                  <Link to="/properties?type=Short Let" className="px-4 py-2 text-sm text-stone-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors">Short Lets</Link>
                </div>
              </div>
            </div>

            <Link to="/contact" className="text-sm font-semibold text-stone-600 hover:text-primary transition-colors">Contact</Link>
            <Button asChild className="bg-primary hover:bg-primary-light text-white transition-colors rounded-full px-6">
              <Link to="/properties">Find a Home</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-stone-600 hover:text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-6 shadow-xl">
          <nav className="flex flex-col gap-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-stone-700 hover:text-primary">Home</Link>
            <Link to="/properties" onClick={() => setIsOpen(false)} className="text-lg font-medium text-stone-700 hover:text-primary">Properties</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-stone-700 hover:text-primary">Contact</Link>
            <Button asChild className="mt-4 w-full bg-primary hover:bg-primary-light text-white rounded-full">
              <Link to="/properties" onClick={() => setIsOpen(false)}>Find a Home</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
