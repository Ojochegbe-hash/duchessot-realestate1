import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../lib/SettingsContext';
import { 
  Building, LayoutDashboard, Home, Image, Video, MessageSquare, 
  Users, Settings, LogOut, ExternalLink, Menu, X, Bell, User 
} from 'lucide-react';
import { cn, getImageUrl } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

const ADMIN_NAV = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Home },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'Property Videos', href: '/admin/videos', icon: Video },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare, badge: true },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Users },
  { name: 'Website Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { settings } = useSettings();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    async function fetchUnreadCount() {
      try {
        const { data } = await supabase
          .from('messages')
          .select('id, read')
          .eq('read', false);
        if (data) {
          setUnreadCount(data.length);
        }
      } catch (e) {}
    }

    fetchUnreadCount();

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-600 font-medium text-sm">Authenticating Admin Access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Determine current section title
  const currentNav = ADMIN_NAV.find(item => item.href === location.pathname) || { name: 'Admin Control Center' };

  return (
    <div className="min-h-screen bg-stone-100/70 flex font-sans text-stone-800">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside className={cn(
        "bg-white border-r border-stone-200 flex flex-col fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 md:translate-x-0 md:static shrink-0 shadow-sm",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* SINGLE Primary Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-stone-100 bg-white">
          <Link to="/admin" className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={getImageUrl(settings.logo_url)} alt={settings.company_name} className="h-9 w-auto max-w-[140px] object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-inner">
                <Building className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-stone-900 text-lg leading-snug">
                {settings.company_name || 'DUCHESSOT'}
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                CMS Dashboard
              </span>
            </div>
          </Link>

          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-stone-400 tracking-wider uppercase">
            Main Management
          </div>

          {ADMIN_NAV.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-stone-400 group-hover:text-primary")} />
                  <span>{item.name}</span>
                </div>

                {item.badge && unreadCount > 0 && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    isActive ? "bg-white text-primary" : "bg-primary text-white"
                  )}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-200 transition-all group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-stone-400 group-hover:text-primary" />
              View Live Website
            </span>
            <span className="text-[10px] bg-stone-200 text-stone-600 font-bold px-1.5 py-0.5 rounded uppercase">Public</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 w-full transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-stone-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {currentNav.name}
              </h1>
              <p className="text-xs text-stone-500 hidden sm:block">
                Admin Panel &bull; {settings.company_name || 'Duchessot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* View Live Website Button */}
            <Link 
              to="/" 
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-all border border-primary/20 shadow-xs"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Unread Message Notification Icon */}
            <Link 
              to="/admin/messages" 
              className="relative p-2.5 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
              title="View Messages"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-stone-900">Administrator</div>
                <div className="text-[10px] text-stone-500">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
