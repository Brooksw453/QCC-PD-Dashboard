import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: courseCount },
    { count: facultyCount },
    { count: completionCount },
    { count: pathwayCount },
    { count: badgeCount },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'faculty'),
    supabase.from('completions').select('*', { count: 'exact', head: true }),
    supabase.from('pathways').select('*', { count: 'exact', head: true }),
    supabase.from('badges_earned').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: 'Total Learning Items', value: courseCount || 0, color: 'bg-qcc-blue' },
    { label: 'Faculty Members', value: facultyCount || 0, color: 'bg-qcc-sky' },
    { label: 'Completions', value: completionCount || 0, color: 'bg-green-600' },
    { label: 'Pathways', value: pathwayCount || 0, color: 'bg-amber-600' },
    { label: 'Badges Earned', value: badgeCount || 0, color: 'bg-purple-600' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-3xl font-bold text-qcc-dark dark:text-white">{stat.value}</p>
            <p className="text-sm text-qcc-gray dark:text-gray-400">{stat.label}</p>
            <div className={`h-1 w-12 ${stat.color} rounded-full mt-2`} />
          </div>
        ))}
      </div>

      {/* Recent completions */}
      <RecentCompletions />
    </div>
  );
}

async function RecentCompletions() {
  const supabase = await createClient();
  const { data: completions } = await supabase
    .from('completions')
    .select('*, profile:profiles(full_name, email), course:courses(title)')
    .order('completed_at', { ascending: false })
    .limit(10);

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-4">Recent Completions</h2>
      {completions && completions.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Faculty</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Learning Item</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Date</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-qcc-gray dark:text-gray-400 text-sm">No completions yet.</p>
      )}
    </div>
  );
}
