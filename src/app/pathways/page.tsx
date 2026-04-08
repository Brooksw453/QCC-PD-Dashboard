import { createClient } from '@/lib/supabase/server';
import PathwayCard from '@/components/PathwayCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pathways',
};

export default async function PathwaysPage() {
  const supabase = await createClient();

  const { data: pathways } = await supabase
    .from('pathways')
    .select('*, pathway_courses(course_id, sort_order, course:courses(id, title, slug, short_description, estimated_minutes))')
    .eq('is_published', true)
    .order('sort_order');

  // Get user completions
  const { data: { user } } = await supabase.auth.getUser();
  let completedIds: string[] = [];
  let earnedBadgeIds = new Set<string>();
  if (user) {
    const [{ data: completions }, { data: badges }] = await Promise.all([
      supabase.from('completions').select('course_id').eq('user_id', user.id),
      supabase.from('badges_earned').select('pathway_id').eq('user_id', user.id),
    ]);
    completedIds = completions?.map(c => c.course_id) || [];
    earnedBadgeIds = new Set(badges?.map(b => b.pathway_id) || []);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-qcc-dark dark:text-white">Learning Pathways</h1>
        <p className="text-qcc-gray dark:text-gray-400 mt-1">Complete learning items in a pathway to earn a badge.</p>
      </div>

      {pathways && pathways.length > 0 ? (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {pathways.map((pathway: any) => {
            const prerequisiteMet = !pathway.prerequisite_pathway_id || earnedBadgeIds.has(pathway.prerequisite_pathway_id);
            const prerequisitePathway = pathway.prerequisite_pathway_id
              ? pathways.find((p: any) => p.id === pathway.prerequisite_pathway_id)
              : null;
            return (
              <PathwayCard
                key={pathway.id}
                pathway={pathway}
                completedIds={completedIds}
                earned={earnedBadgeIds.has(pathway.id)}
                isLoggedIn={!!user}
                prerequisiteMet={prerequisiteMet}
                prerequisiteTitle={prerequisitePathway?.title}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-qcc-gray dark:text-gray-400">No pathways available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
