import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Contact from './pages/Contact';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import AdminSettings from './pages/admin/Settings';
import AdminProperties from './pages/admin/Properties';
import PropertyForm from './pages/admin/PropertyForm';
import AIChat from './components/AIChat';
import WhatsAppFloat from './components/WhatsAppFloat';

import { SettingsProvider } from './lib/SettingsContext';
import AdminMessages from './pages/admin/AdminMessages';
import AdminMedia from './pages/admin/AdminMedia';
import AdminVideos from './pages/admin/AdminVideos';
import AdminTestimonials from './pages/admin/AdminTestimonials';

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AIChat />
      <WhatsAppFloat />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:slug" element={<PropertyDetails />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:id/edit" element={<PropertyForm />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
          </Route>
        </Routes>
      </Router>
    </SettingsProvider>
  );
}
