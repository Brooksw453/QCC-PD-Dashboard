import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import RoleToggle from '@/components/admin/RoleToggle';

export const dynamic = 'force-dynamic';

export default async function AdminFacultyPage() {
  const supabase = await createClient();

  const { data: faculty } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');

  // Get completion counts per user
  const { data: completionCounts } = await supabase
    .from('completions')
    .select('user_id');

  const countMap = new Map<string, number>();
  completionCounts?.forEach(c => {
    countMap.set(c.user_id, (countMap.get(c.user_id) || 0) + 1);
  });

  // Get badge counts per user
  const { data: badgeCounts } = await supabase
    .from('badges_earned')
    .select('user_id');

  const badgeMap = new Map<string, number>();
  badgeCounts?.forEach(b => {
    badgeMap.set(b.user_id, (badgeMap.get(b.user_id) || 0) + 1);
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-6">Faculty Members</h2>

      {faculty && faculty.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Department</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Role</th>
                <th className="text-center px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Completions</th>
                <th className="text-center px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Badges</th>
                <th className="text-right px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {faculty.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-qcc-dark dark:text-white">{user.full_name}</td>
                  <td className="px-4 py-3 text-qcc-gray dark:text-gray-400">{user.email}</td>
                  <td className="px-4 py-3 text-qcc-gray dark:text-gray-400">{user.department || '---'}</td>
                  <td className="px-4 py-3">
                    <RoleToggle userId={user.id} currentRole={user.role} userName={user.full_name} />
                  </td>
                  <td className="px-4 py-3 text-center text-qcc-dark dark:text-white">{countMap.get(user.id) || 0}</td>
                  <td className="px-4 py-3 text-center text-qcc-dark dark:text-white">{badgeMap.get(user.id) || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/faculty/${user.id}`}
                      className="text-qcc-sky hover:text-qcc-sky-hover font-medium text-xs"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-qcc-gray dark:text-gray-400 text-sm">No faculty members registered yet.</p>
      )}
    </div>
  );
}
