import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FacultyDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) notFound();

  const [{ data: completions }, { data: badges }] = await Promise.all([
    supabase
      .from('completions')
      .select('*, course:courses(title, slug)')
      .eq('user_id', id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('badges_earned')
      .select('*, pathway:pathways(title, badge_name, badge_color)')
      .eq('user_id', id)
      .order('earned_at', { ascending: false }),
  ]);

  return (
    <div>
      <Link href="/admin/faculty" className="text-sm text-qcc-sky hover:text-qcc-sky-hover mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to faculty
      </Link>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-qcc-dark">{profile.full_name}</h2>
        <p className="text-qcc-gray text-sm">{profile.email}</p>
        {profile.department && <p className="text-qcc-gray text-sm">{profile.department}</p>}
        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
          profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {profile.role}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Completions */}
        <div>
          <h3 className="text-lg font-semibold text-qcc-dark mb-3">
            Completed Courses ({completions?.length || 0})
          </h3>
          {completions && completions.length > 0 ? (
            <div className="space-y-2">
              {completions.map((c) => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-qcc-dark">{c.course?.title}</p>
                    <p className="text-xs text-qcc-gray">
                      {new Date(c.completed_at).toLocaleDateString()}
                      {c.verified_by ? ' — Verified' : ' — Self-reported'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-qcc-gray">No completions yet.</p>
          )}
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-lg font-semibold text-qcc-dark mb-3">
            Badges Earned ({badges?.length || 0})
          </h3>
          {badges && badges.length > 0 ? (
            <div className="space-y-2">
              {badges.map((b) => (
                <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: b.pathway?.badge_color || '#1F5A96' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-qcc-dark">{b.pathway?.badge_name}</p>
                    <p className="text-xs text-qcc-gray">
                      Earned {new Date(b.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-qcc-gray">No badges earned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
