import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: pathway } = await supabase
    .from('pathways')
    .select('title')
    .eq('slug', slug)
    .single();
  return { title: pathway?.title || 'Pathway' };
}

export default async function PathwayDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: pathway } = await supabase
    .from('pathways')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!pathway) notFound();

  // Get courses in this pathway, ordered
  const { data: pathwayCourses } = await supabase
    .from('pathway_courses')
    .select('*, course:courses(*)')
    .eq('pathway_id', pathway.id)
    .order('sort_order');

  const { data: { user } } = await supabase.auth.getUser();
  let completedIds = new Set<string>();
  let badgeEarned = false;
  if (user) {
    const [{ data: completions }, { data: badge }] = await Promise.all([
      supabase.from('completions').select('course_id').eq('user_id', user.id),
      supabase.from('badges_earned').select('id').eq('user_id', user.id).eq('pathway_id', pathway.id).single(),
    ]);
    completedIds = new Set(completions?.map(c => c.course_id) || []);
    badgeEarned = !!badge;
  }

  const totalCourses = pathwayCourses?.length || 0;
  const completedCount = pathwayCourses?.filter(pc => completedIds.has(pc.course_id)).length || 0;
  const pct = totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/pathways" className="text-sm text-qcc-sky hover:text-qcc-sky-hover mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to pathways
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shrink-0 ${badgeEarned ? '' : 'opacity-40'}`}
          style={{ backgroundColor: pathway.badge_color }}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-qcc-dark dark:text-white">{pathway.title}</h1>
          <p className="text-sm font-medium mt-1" style={{ color: pathway.badge_color }}>
            {pathway.badge_name}
          </p>
        </div>
      </div>

      <p className="text-qcc-gray dark:text-gray-400 mb-6">{pathway.description}</p>

      {/* Progress */}
      {user && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-qcc-dark dark:text-white">Your Progress</span>
            <span className="text-sm text-qcc-gray dark:text-gray-400">
              {completedCount} of {totalCourses} learning items
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: badgeEarned ? '#16A34A' : pathway.badge_color,
              }}
            />
          </div>
          {badgeEarned && (
            <p className="text-sm text-green-600 font-medium mt-2">
              Badge earned! Congratulations!
            </p>
          )}
        </div>
      )}

      {/* Course List */}
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-4">Learning Items in this Pathway</h2>
      <div className="space-y-3">
        {pathwayCourses?.map((pc, index) => {
          const course = pc.course;
          if (!course) return null;
          const isCompleted = completedIds.has(course.id);

          return (
            <Link
              key={pc.id}
              href={`/courses/${course.slug}`}
              className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-qcc-sky transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                isCompleted
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-qcc-gray dark:text-gray-400'
              }`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-qcc-dark dark:text-white">{course.title}</p>
                <p className="text-xs text-qcc-gray dark:text-gray-400 truncate">{course.short_description}</p>
              </div>
              {course.estimated_minutes && (
                <span className="text-xs text-qcc-gray dark:text-gray-400 shrink-0">{course.estimated_minutes} min</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
