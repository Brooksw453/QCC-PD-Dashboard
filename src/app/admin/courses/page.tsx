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
        <h2 className="text-lg font-semibold text-qcc-dark">Manage Courses</h2>
        <Link
          href="/admin/courses/new"
          className="px-4 py-2 bg-qcc-blue text-white rounded-lg text-sm font-medium hover:bg-qcc-blue-hover transition-colors"
        >
          + Add Course
        </Link>
      </div>

      {courses && courses.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Title</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Status</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Duration</th>
                <th className="text-left px-4 py-3 font-medium text-qcc-gray">Order</th>
                <th className="text-right px-4 py-3 font-medium text-qcc-gray">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-qcc-dark">{course.title}</p>
                    <p className="text-xs text-qcc-gray">{course.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {course.is_published ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Published</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-qcc-gray">
                    {course.estimated_minutes ? `${course.estimated_minutes} min` : '—'}
                  </td>
                  <td className="px-4 py-3 text-qcc-gray">{course.sort_order}</td>
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
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-qcc-gray mb-3">No courses yet.</p>
          <Link
            href="/admin/courses/new"
            className="text-qcc-sky hover:text-qcc-sky-hover font-medium text-sm"
          >
            Create your first course
          </Link>
        </div>
      )}
    </div>
  );
}
