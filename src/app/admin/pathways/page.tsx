import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPathwaysPage() {
  const supabase = await createClient();

  const { data: pathways } = await supabase
    .from('pathways')
    .select('*, pathway_courses(id)')
    .order('sort_order');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-qcc-dark dark:text-white">Manage Pathways</h2>
        <Link
          href="/admin/pathways/new"
          className="px-4 py-2 bg-qcc-blue text-white rounded-lg text-sm font-medium hover:bg-qcc-blue-hover transition-colors"
        >
          + Add Pathway
        </Link>
      </div>

      {pathways && pathways.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Pathway</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Badge</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Learning Items</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {pathways.map((pathway) => (
                <tr key={pathway.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <p className="font-medium text-qcc-dark dark:text-white">{pathway.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
                      style={{ backgroundColor: pathway.badge_color }}
                    >
                      {pathway.badge_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-qcc-gray dark:text-gray-400">{pathway.pathway_courses?.length || 0}</td>
                  <td className="px-4 py-3">
                    {pathway.is_published ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Published</span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pathways/${pathway.id}/edit`}
                      className="text-qcc-sky hover:text-qcc-sky-hover font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-xl">
          <p className="text-qcc-gray dark:text-gray-400 mb-3">No pathways yet.</p>
          <Link href="/admin/pathways/new" className="text-qcc-sky hover:text-qcc-sky-hover font-medium text-sm">
            Create your first pathway
          </Link>
        </div>
      )}
    </div>
  );
}
