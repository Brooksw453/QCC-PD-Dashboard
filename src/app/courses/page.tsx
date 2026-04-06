import { createClient } from '@/lib/supabase/server';
import CourseCard from '@/components/CourseCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Learning Items',
};

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  // Get completions for logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  let completedIds = new Set<string>();
  if (user) {
    const { data: completions } = await supabase
      .from('completions')
      .select('course_id')
      .eq('user_id', user.id);
    completedIds = new Set(completions?.map(c => c.course_id) || []);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-qcc-dark dark:text-white">Learning Items</h1>
        <p className="text-qcc-gray dark:text-gray-400 mt-1">Browse our professional development offerings.</p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              completed={completedIds.has(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-qcc-gray dark:text-gray-400">No learning items available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
