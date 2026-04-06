'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CompletionRow {
  id: string;
  user_id: string;
  course_id: string;
  completed_at: string;
  verified_by: string | null;
  verified_at: string | null;
  profile: { full_name: string; email: string } | null;
  course: { title: string } | null;
}

export default function CompletionsManager() {
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadCompletions();
  }, []);

  const loadCompletions = async () => {
    const { data } = await supabase
      .from('completions')
      .select('*, profile:profiles(full_name, email), course:courses(title)')
      .order('completed_at', { ascending: false });
    setCompletions((data as CompletionRow[]) || []);
    setLoading(false);
  };

  const handleVerify = async (completionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('completions')
      .update({ verified_by: user.id, verified_at: new Date().toISOString() })
      .eq('id', completionId);

    loadCompletions();
  };

  const handleRevoke = async (completionId: string) => {
    if (!confirm('Revoke this completion? This cannot be undone.')) return;
    await supabase.from('completions').delete().eq('id', completionId);
    loadCompletions();
  };

  if (loading) {
    return <p className="text-qcc-gray">Loading completions...</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-6">Manage Completions</h2>

      {completions.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Faculty</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Learning Item</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Date</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {completions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <p className="font-medium text-qcc-dark dark:text-white">{c.profile?.full_name}</p>
                    <p className="text-xs text-qcc-gray dark:text-gray-400">{c.profile?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-qcc-dark dark:text-white">{c.course?.title}</td>
                  <td className="px-4 py-3 text-qcc-gray dark:text-gray-400">
                    {new Date(c.completed_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {c.verified_by ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Verified</span>
                    ) : (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">Self-reported</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {!c.verified_by && (
                      <button
                        onClick={() => handleVerify(c.id)}
                        className="text-xs text-qcc-sky hover:text-qcc-sky-hover font-medium"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-qcc-gray dark:text-gray-400 text-sm">No completions to manage.</p>
      )}
    </div>
  );
}
