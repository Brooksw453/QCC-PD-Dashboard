import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get completions with course info
  const { data: completions } = await supabase
    .from('completions')
    .select('*, course:courses(*)')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  // Get earned badges with pathway info
  const { data: badges } = await supabase
    .from('badges_earned')
    .select('*, pathway:pathways(*)')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false });

  // Get all published pathways to show progress
  const { data: pathways } = await supabase
    .from('pathways')
    .select('*, pathway_courses(course_id)')
    .eq('is_published', true)
    .order('sort_order');

  const completedCourseIds = new Set(completions?.map(c => c.course_id) || []);
  const badgePathwayIds = new Set(badges?.map(b => b.pathway_id) || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-qcc-dark dark:text-white">
          Welcome, {profile?.full_name || 'Faculty'}
        </h1>
        {profile?.department && (
          <p className="text-qcc-gray dark:text-gray-400 mt-1">{profile.department}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-qcc-blue">{completions?.length || 0}</p>
          <p className="text-sm text-qcc-gray dark:text-gray-400">Items Completed</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-qcc-sky">{badges?.length || 0}</p>
          <p className="text-sm text-qcc-gray dark:text-gray-400">Badges Earned</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {completions?.filter(c => c.verified_by).length || 0}
          </p>
          <p className="text-sm text-qcc-gray dark:text-gray-400">Verified</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">
            {(pathways?.length || 0) - (badges?.length || 0)}
          </p>
          <p className="text-sm text-qcc-gray dark:text-gray-400">Pathways In Progress</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Badges Section */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-qcc-dark dark:text-white mb-4">My Badges</h2>
          {badges && badges.length > 0 ? (
            <div className="space-y-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: badge.pathway?.badge_color || '#1F5A96' }}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-qcc-dark dark:text-white text-sm">{badge.pathway?.badge_name}</p>
                    <p className="text-xs text-qcc-gray dark:text-gray-400">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
              <p className="text-qcc-gray dark:text-gray-400 text-sm">No badges earned yet.</p>
              <Link href="/pathways" className="text-qcc-sky text-sm font-medium hover:text-qcc-sky-hover mt-1 inline-block">
                View pathways
              </Link>
            </div>
          )}

          {/* Pathway Progress */}
          {pathways && pathways.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-qcc-dark dark:text-white mb-3">Pathway Progress</h3>
              <div className="space-y-3">
                {pathways.map((pathway) => {
                  const totalCourses = pathway.pathway_courses?.length || 0;
                  const completedInPathway = pathway.pathway_courses?.filter(
                    (pc: { course_id: string }) => completedCourseIds.has(pc.course_id)
                  ).length || 0;
                  const earned = badgePathwayIds.has(pathway.id);
                  const pct = totalCourses > 0 ? (completedInPathway / totalCourses) * 100 : 0;

                  return (
                    <Link
                      key={pathway.id}
                      href={`/pathways/${pathway.slug}`}
                      className="block bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-qcc-sky transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-qcc-dark dark:text-white text-sm">{pathway.title}</p>
                        {earned && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Complete</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: earned ? '#16A34A' : '#1BA0D8',
                          }}
                        />
                      </div>
                      <p className="text-xs text-qcc-gray dark:text-gray-400 mt-1">
                        {completedInPathway} of {totalCourses} learning items
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Completed Learning Items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-qcc-dark dark:text-white">Completed Learning Items</h2>
            <Link href="/courses" className="text-sm text-qcc-sky hover:text-qcc-sky-hover font-medium">
              Browse all learning items
            </Link>
          </div>
          {completions && completions.length > 0 ? (
            <div className="space-y-3">
              {completions.map((completion) => (
                <div
                  key={completion.id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-qcc-dark dark:text-white text-sm truncate">{completion.course?.title}</p>
                      <p className="text-xs text-qcc-gray dark:text-gray-400">
                        Completed {new Date(completion.completed_at).toLocaleDateString()}
                        {completion.verified_by && (
                          <span className="ml-2 text-green-600">Verified</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/courses/${completion.course?.slug}`}
                    className="text-xs text-qcc-sky hover:text-qcc-sky-hover font-medium shrink-0 ml-4"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-qcc-gray dark:text-gray-400 text-sm mb-2">No learning items completed yet.</p>
              <Link href="/courses" className="text-qcc-sky text-sm font-medium hover:text-qcc-sky-hover">
                Start your first learning item
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
