import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pathways',
};

export default async function PathwaysPage() {
  const supabase = await createClient();

  const { data: pathways } = await supabase
    .from('pathways')
    .select('*, pathway_courses(course_id)')
    .eq('is_published', true)
    .order('sort_order');

  // Get user completions
  const { data: { user } } = await supabase.auth.getUser();
  let completedIds = new Set<string>();
  let earnedBadgeIds = new Set<string>();
  if (user) {
    const [{ data: completions }, { data: badges }] = await Promise.all([
      supabase.from('completions').select('course_id').eq('user_id', user.id),
      supabase.from('badges_earned').select('pathway_id').eq('user_id', user.id),
    ]);
    completedIds = new Set(completions?.map(c => c.course_id) || []);
    earnedBadgeIds = new Set(badges?.map(b => b.pathway_id) || []);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-qcc-dark">Learning Pathways</h1>
        <p className="text-qcc-gray mt-1">Complete courses in a pathway to earn a badge.</p>
      </div>

      {pathways && pathways.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathways.map((pathway) => {
            const totalCourses = pathway.pathway_courses?.length || 0;
            const completedInPathway = pathway.pathway_courses?.filter(
              (pc: { course_id: string }) => completedIds.has(pc.course_id)
            ).length || 0;
            const earned = earnedBadgeIds.has(pathway.id);
            const pct = totalCourses > 0 ? (completedInPathway / totalCourses) * 100 : 0;

            return (
              <Link
                key={pathway.id}
                href={`/pathways/${pathway.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-qcc-sky hover:shadow-md transition-all"
              >
                {/* Badge icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 ${earned ? '' : 'opacity-40'}`}
                    style={{ backgroundColor: pathway.badge_color }}
                  >
                    {earned ? (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-qcc-dark group-hover:text-qcc-blue transition-colors">
                      {pathway.title}
                    </h3>
                    <p className="text-xs text-qcc-gray">{pathway.badge_name}</p>
                  </div>
                </div>

                <p className="text-sm text-qcc-gray mb-4 line-clamp-2">{pathway.description}</p>

                {/* Progress bar */}
                {user && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: earned ? '#16A34A' : pathway.badge_color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-qcc-gray">
                      {completedInPathway} of {totalCourses} courses
                      {earned && ' - Badge earned!'}
                    </p>
                  </div>
                )}
                {!user && (
                  <p className="text-xs text-qcc-gray">{totalCourses} courses</p>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-qcc-gray">No pathways available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
