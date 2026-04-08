import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics',
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Fetch all data for analytics
  const [
    { data: courses },
    { data: completions },
    { data: profiles },
    { data: pathways },
    { data: badges },
  ] = await Promise.all([
    supabase.from('courses').select('id, title, slug').eq('is_published', true).order('sort_order'),
    supabase.from('completions').select('id, user_id, course_id, completed_at, verified_by'),
    supabase.from('profiles').select('id, full_name, email'),
    supabase.from('pathways').select('id, title, badge_name, badge_color, pathway_courses(course_id)').eq('is_published', true),
    supabase.from('badges_earned').select('id, user_id, pathway_id, earned_at'),
  ]);

  const totalFaculty = profiles?.length || 0;
  const totalCompletions = completions?.length || 0;
  const verifiedCount = completions?.filter(c => c.verified_by).length || 0;
  const totalBadges = badges?.length || 0;

  // Faculty with at least one completion
  const activeFaculty = new Set(completions?.map(c => c.user_id) || []).size;
  const participationRate = totalFaculty > 0 ? Math.round((activeFaculty / totalFaculty) * 100) : 0;

  // Completions per course
  const courseCompletionMap = new Map<string, number>();
  completions?.forEach(c => {
    courseCompletionMap.set(c.course_id, (courseCompletionMap.get(c.course_id) || 0) + 1);
  });

  const courseStats = (courses || []).map(course => ({
    ...course,
    completionCount: courseCompletionMap.get(course.id) || 0,
  })).sort((a, b) => b.completionCount - a.completionCount);

  const maxCompletions = Math.max(...courseStats.map(c => c.completionCount), 1);

  // Pathway completion rates
  const pathwayStats = (pathways || []).map(pathway => {
    const earnedCount = badges?.filter(b => b.pathway_id === pathway.id).length || 0;
    const rate = totalFaculty > 0 ? Math.round((earnedCount / totalFaculty) * 100) : 0;
    return {
      ...pathway,
      earnedCount,
      rate,
    };
  });

  // Recent completions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCompletions = completions?.filter(c =>
    new Date(c.completed_at) >= thirtyDaysAgo
  ).length || 0;

  // Completions by month (last 6 months)
  const monthlyData: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const count = completions?.filter(c => {
      const cd = new Date(c.completed_at);
      return cd.getFullYear() === year && cd.getMonth() === month;
    }).length || 0;
    monthlyData.push({ label, count });
  }
  const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1);

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-6">Analytics</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-qcc-blue">{totalFaculty}</p>
          <p className="text-xs text-qcc-gray dark:text-gray-400">Total Faculty</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-qcc-sky">{totalCompletions}</p>
          <p className="text-xs text-qcc-gray dark:text-gray-400">Total Completions</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
          <p className="text-xs text-qcc-gray dark:text-gray-400">Verified</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalBadges}</p>
          <p className="text-xs text-qcc-gray dark:text-gray-400">Badges Earned</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{participationRate}%</p>
          <p className="text-xs text-qcc-gray dark:text-gray-400">Participation</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Completions by month */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <h3 className="font-semibold text-sm text-qcc-dark dark:text-white mb-4">Completions by Month</h3>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-qcc-gray dark:text-gray-400 font-medium">{m.count}</span>
                <div
                  className="w-full bg-qcc-sky rounded-t-md transition-all"
                  style={{ height: `${Math.max((m.count / maxMonthly) * 120, 4)}px` }}
                />
                <span className="text-[10px] text-qcc-gray dark:text-gray-500">{m.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-qcc-gray dark:text-gray-400 mt-3">
            {recentCompletions} completion{recentCompletions !== 1 ? 's' : ''} in the last 30 days
          </p>
        </div>

        {/* Pathway completion rates */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <h3 className="font-semibold text-sm text-qcc-dark dark:text-white mb-4">Pathway Completion</h3>
          {pathwayStats.length > 0 ? (
            <div className="space-y-4">
              {pathwayStats.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-qcc-dark dark:text-white">{p.title}</span>
                    <span className="text-xs text-qcc-gray dark:text-gray-400">
                      {p.earnedCount} of {totalFaculty} ({p.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${p.rate}%`,
                        backgroundColor: p.badge_color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-qcc-gray dark:text-gray-400">No published pathways yet.</p>
          )}
        </div>
      </div>

      {/* Completion rates per learning item */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mt-8">
        <h3 className="font-semibold text-sm text-qcc-dark dark:text-white mb-4">Completions per Learning Item</h3>
        {courseStats.length > 0 ? (
          <div className="space-y-3">
            {courseStats.map(course => (
              <div key={course.id} className="flex items-center gap-3">
                <span className="text-sm text-qcc-dark dark:text-white w-64 truncate shrink-0">{course.title}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 bg-qcc-blue rounded-full transition-all"
                    style={{ width: `${(course.completionCount / maxCompletions) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-qcc-gray dark:text-gray-400 w-8 text-right shrink-0">{course.completionCount}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-qcc-gray dark:text-gray-400">No published learning items yet.</p>
        )}
      </div>

      {/* Faculty participation */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mt-8">
        <h3 className="font-semibold text-sm text-qcc-dark dark:text-white mb-4">Faculty Participation</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-gray-200 dark:text-gray-600"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${participationRate}, 100`}
                className="text-qcc-blue"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-qcc-dark dark:text-white">
              {participationRate}%
            </span>
          </div>
          <div>
            <p className="text-sm text-qcc-dark dark:text-white">
              <strong>{activeFaculty}</strong> of <strong>{totalFaculty}</strong> faculty members have completed at least one learning item.
            </p>
            <p className="text-xs text-qcc-gray dark:text-gray-400 mt-1">
              {totalFaculty - activeFaculty} faculty member{totalFaculty - activeFaculty !== 1 ? 's have' : ' has'} not started yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
