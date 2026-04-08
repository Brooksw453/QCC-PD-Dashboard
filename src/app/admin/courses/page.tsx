import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('sort_order');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-qcc-dark dark:text-white">Manage Learning Items</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/courses/import"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-qcc-dark dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Import CSV
          </Link>
          <Link
            href="/admin/courses/new"
            className="px-4 py-2 bg-qcc-blue text-white rounded-lg text-sm font-medium hover:bg-qcc-blue-hover transition-colors"
          >
            + Add Learning Item
          </Link>
        </div>
      </div>

      {courses && courses.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Title</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Duration</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Order</th>
                <th className="text-right px-4 py-3 font-medium text-qcc-gray dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <p className="font-medium text-qcc-dark dark:text-white">{course.title}</p>
                    <p className="text-xs text-qcc-gray dark:text-gray-400">{course.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {course.is_published ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Published</span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-qcc-gray dark:text-gray-400">
                    {course.estimated_minutes ? `${course.estimated_minutes} min` : '---'}
                  </td>
                  <td className="px-4 py-3 text-qcc-gray dark:text-gray-400">{course.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
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
          <p className="text-qcc-gray dark:text-gray-400 mb-3">No learning items yet.</p>
          <Link
            href="/admin/courses/new"
            className="text-qcc-sky hover:text-qcc-sky-hover font-medium text-sm"
          >
            Create your first learning item
          </Link>
        </div>
      )}
    </div>
  );
}
