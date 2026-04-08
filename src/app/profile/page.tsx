'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [completionCount, setCompletionCount] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name);
        setDepartment(profile.department || '');
        setEmail(profile.email);
      }

      const { count: cCount } = await supabase
        .from('completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setCompletionCount(cCount || 0);

      const { count: bCount } = await supabase
        .from('badges_earned')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setBadgeCount(bCount || 0);

      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        department: department || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Failed to update profile.');
    } else {
      setMessage('Profile updated!');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage('Failed to update password.');
    } else {
      setPasswordMessage('Password updated!');
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordSaving(false);
  };

  if (loading) return <div className="max-w-md mx-auto px-4 py-8"><p className="text-qcc-gray">Loading...</p></div>;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-qcc-dark dark:text-white mb-6">My Profile</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-qcc-blue">{completionCount}</p>
          <p className="text-xs text-qcc-gray dark:text-gray-400">Items Completed</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-qcc-sky">{badgeCount}</p>
          <p className="text-xs text-qcc-gray dark:text-gray-400">Badges Earned</p>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-qcc-dark dark:text-white">Profile Details</h2>
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            message.includes('Failed') ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          }`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 text-qcc-gray dark:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="e.g. English, Nursing, IT"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-qcc-blue text-white rounded-lg font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Password change */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-qcc-dark dark:text-white">Change Password</h2>
        {passwordMessage && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            passwordMessage.includes('Failed') || passwordMessage.includes('must') || passwordMessage.includes('match')
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          }`}>
            {passwordMessage}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          disabled={passwordSaving}
          className="w-full py-2.5 bg-qcc-blue text-white rounded-lg font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
        >
          {passwordSaving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
