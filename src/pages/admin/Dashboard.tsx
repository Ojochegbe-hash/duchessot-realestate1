import { Home, Users, Eye, TrendingUp, Plus, Settings as SettingsIcon, Mail, Image, Video, ArrowRight, MessageSquare, Building2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { useSettings } from '../../lib/SettingsContext';
import { formatCurrency, getImageUrl } from '../../lib/utils';

export default function Dashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    totalProperties: 0,
    unreadMessages: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch properties count
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
        
        // Fetch unread messages count
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('read', false);
          
        // Fetch recent properties
        const { data: properties } = await supabase
          .from('properties')
          .select('id, title, price, listing_type, created_at, gallery, currency, location_city')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalProperties: propertiesCount || 0,
          unreadMessages: messagesCount || 0,
        });
        
        if (properties) {
          setRecentProperties(properties);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Add Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Welcome back to <span className="font-semibold text-stone-700">{settings.company_name || 'Duchessot'}</span> Admin Portal. Here is your current operational summary.
          </p>
        </div>

        <Link 
          to="/admin/properties/new" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-md shadow-primary/20 transition-all shrink-0 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Properties */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200/60">
              <TrendingUp className="h-3.5 w-3.5" /> +2 Active
            </span>
          </div>
          <h3 className="text-stone-500 text-xs font-bold tracking-wider uppercase">Total Properties</h3>
          <p className="text-3xl font-extrabold text-stone-900 mt-1">{loading ? '...' : stats.totalProperties}</p>
        </div>

        {/* Page Views */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
              <Eye className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200/60">
              <TrendingUp className="h-3.5 w-3.5" /> +15%
            </span>
          </div>
          <h3 className="text-stone-500 text-xs font-bold tracking-wider uppercase">Page Traffic</h3>
          <p className="text-3xl font-extrabold text-stone-900 mt-1">{settings.page_views || '45.2K'}</p>
        </div>

        {/* New Leads */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200/60">
              <TrendingUp className="h-3.5 w-3.5" /> +5%
            </span>
          </div>
          <h3 className="text-stone-500 text-xs font-bold tracking-wider uppercase">Client Inquiries</h3>
          <p className="text-3xl font-extrabold text-stone-900 mt-1">{settings.new_leads || '384'}</p>
        </div>

        {/* Unread Messages */}
        <Link 
          to="/admin/messages"
          className="bg-primary text-white p-6 rounded-2xl border border-primary/20 shadow-md shadow-primary/20 hover:scale-[1.01] transition-all block relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-primary bg-white px-2.5 py-1 rounded-full">
              Action Required
            </span>
          </div>
          <h3 className="text-white/80 text-xs font-bold tracking-wider uppercase">Unread Messages</h3>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-3xl font-extrabold">{loading ? '...' : stats.unreadMessages}</p>
            <span className="text-xs text-white/90 underline font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              View Inbox <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Properties & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Properties List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Recent Properties</h3>
              <p className="text-xs text-stone-500">Latest real estate listings in your CMS</p>
            </div>
            <Link 
              to="/admin/properties" 
              className="text-xs font-bold text-primary hover:text-primary-light flex items-center gap-1 hover:underline"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-stone-400 text-sm">Loading property catalog...</div>
            ) : recentProperties.length > 0 ? (
              recentProperties.map((prop) => (
                <div 
                  key={prop.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 border border-stone-200/60 transition-all gap-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-200/80">
                      <img 
                        src={getImageUrl(prop.gallery?.[0])} 
                        alt={prop.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-900 truncate text-sm sm:text-base group-hover:text-primary transition-colors">
                        {prop.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>{prop.location_city || 'Ghana'}</span>
                        <span>&bull;</span>
                        <span>Added {new Date(prop.created_at).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-200/60 shrink-0">
                    <div className="sm:text-right">
                      <div className="font-extrabold text-stone-900 text-sm sm:text-base">
                        {formatCurrency(prop.price, prop.currency || 'USD')}
                        <span className="text-xs font-normal text-stone-500">
                          {prop.listing_type === 'Rent' ? '/mo' : prop.listing_type === 'Short Let' ? '/night' : ''}
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md mt-0.5">
                        For {prop.listing_type}
                      </span>
                    </div>

                    <Link
                      to={`/admin/properties/${prop.id}/edit`}
                      className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-primary hover:text-white hover:border-primary text-xs font-semibold transition-all"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-500 text-sm">
                No properties added yet. Click "+ Add New Property" above to create your first listing.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 sm:p-8">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Quick Actions</h3>
            <p className="text-xs text-stone-500 mb-6">Direct shortcuts to key dashboard tools</p>

            <div className="space-y-3">
              <Link 
                to="/admin/properties/new" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-primary/5 hover:border-primary/30 border border-stone-200/80 transition-all font-semibold text-stone-800 text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Add New Property</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                to="/admin/media" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-primary/5 hover:border-primary/30 border border-stone-200/80 transition-all font-semibold text-stone-800 text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Image className="w-4 h-4" />
                  </div>
                  <span>Media Library</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                to="/admin/videos" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-primary/5 hover:border-primary/30 border border-stone-200/80 transition-all font-semibold text-stone-800 text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <span>Property Video Tours</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                to="/admin/testimonials" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-primary/5 hover:border-primary/30 border border-stone-200/80 transition-all font-semibold text-stone-800 text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Testimonials Manager</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                to="/admin/settings" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-primary/5 hover:border-primary/30 border border-stone-200/80 transition-all font-semibold text-stone-800 text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <span>Website Settings & Hero</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          {/* System Status Card */}
          <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-sm border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">System Status</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Live
              </span>
            </div>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Your real estate website, database, public listings, and inquiry endpoints are operating cleanly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
