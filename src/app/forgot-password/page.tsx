'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-8">
            <h2 className="text-xl font-bold text-qcc-dark dark:text-white mb-2">Check Your Email</h2>
            <p className="text-qcc-gray dark:text-gray-400 text-sm">
              If an account exists for <strong>{email}</strong>, we sent a password reset link.
            </p>
            <Link href="/login" className="inline-block mt-4 text-qcc-sky hover:text-qcc-sky-hover text-sm font-medium">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-qcc-dark dark:text-white">Reset Password</h1>
          <p className="text-qcc-gray dark:text-gray-400 mt-1">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleReset} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-qcc-sky focus:border-transparent text-sm"
              placeholder="you@qcc.edu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-qcc-blue text-white rounded-lg font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-sm">
            <Link href="/login" className="text-qcc-sky hover:text-qcc-sky-hover">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
