import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mb-4">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Admin Portal</h1>
          <p className="text-stone-600 mt-2">Sign in to manage your properties</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-900">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="admin@duchessot.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-900">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Sign In
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
