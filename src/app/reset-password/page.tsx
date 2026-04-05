'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Supabase sends reset links with tokens in the URL hash.
    // The Supabase client auto-detects these and establishes a session.
    // We listen for the PASSWORD_RECOVERY event to know we're ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      } else if (event === 'SIGNED_IN') {
        // Also handle if the session was already established
        setSessionReady(true);
      }
    });

    // Check if there's already a session (e.g. user is already logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!sessionReady) {
      setError('No active session. Please use the reset link from your email.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-qcc-dark">Set New Password</h1>
          <p className="text-qcc-gray mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleUpdate} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          {!sessionReady && !error && (
            <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-lg text-sm">
              Verifying your reset link... If this persists, request a new reset link from the login page.
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-qcc-dark mb-1">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qcc-sky focus:border-transparent text-sm"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !sessionReady}
            className="w-full py-2.5 bg-qcc-blue text-white rounded-lg font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
