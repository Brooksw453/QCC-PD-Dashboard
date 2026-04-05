import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

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
      <h2 className="text-lg font-semibold text-qcc-dark mb-6">Faculty Members</h2>

      {faculty && faculty.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Name</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Email</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Department</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Role</th>
                <th className="text-center px-4 py-3 font-medium text-qcc-gray">Completions</th>
                <th className="text-center px-4 py-3 font-medium text-qcc-gray">Badges</th>
                <th className="text-right px-4 py-3 font-medium text-qcc-gray">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faculty.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-qcc-dark">{user.full_name}</td>
                  <td className="px-4 py-3 text-qcc-gray">{user.email}</td>
                  <td className="px-4 py-3 text-qcc-gray">{user.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-qcc-dark">{countMap.get(user.id) || 0}</td>
                  <td className="px-4 py-3 text-center text-qcc-dark">{badgeMap.get(user.id) || 0}</td>
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
        <p className="text-qcc-gray text-sm">No faculty members registered yet.</p>
      )}
    </div>
  );
}
