'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Announcement } from '@/lib/types';

interface Props {
  announcements: Announcement[];
}

export default function AnnouncementsManager({ announcements: initial }: Props) {
  const [announcements, setAnnouncements] = useState(initial);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: err } = await supabase
      .from('announcements')
      .insert({
        title,
        message,
        created_by: user.id,
        expires_at: expiresAt || null,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
    } else if (data) {
      setAnnouncements(prev => [data, ...prev]);
      setTitle('');
      setMessage('');
      setExpiresAt('');
    }
    setLoading(false);
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !currentlyActive })
      .eq('id', id);

    if (!error) {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentlyActive } : a));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-sm text-qcc-dark dark:text-white">New Announcement</h3>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="Announcement title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="Announcement message" />
        </div>
        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">
            Expires At <span className="text-qcc-gray dark:text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent" />
        </div>
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-qcc-blue text-white rounded-lg text-sm font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Announcement'}
        </button>
      </form>

      {/* List */}
      {announcements.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Title</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Expires</th>
                <th className="text-right px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {announcements.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <p className="font-medium text-qcc-dark dark:text-white">{a.title}</p>
                    <p className="text-xs text-qcc-gray dark:text-gray-400 truncate max-w-xs">{a.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    {a.is_active ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-qcc-gray dark:text-gray-400 text-xs">
                    {a.expires_at ? new Date(a.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => toggleActive(a.id, a.is_active)}
                      className="text-qcc-sky hover:text-qcc-sky-hover font-medium text-xs">
                      {a.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(a.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 font-medium text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-qcc-gray dark:text-gray-400 text-center py-8">No announcements yet.</p>
      )}
    </div>
  );
}
