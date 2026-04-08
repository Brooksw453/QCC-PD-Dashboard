import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import LaunchCourseButton from '@/components/LaunchCourseButton';
import CompletionButton from '@/components/CompletionButton';
import FavoriteButton from '@/components/FavoriteButton';
import FormatIcon from '@/components/FormatIcon';
import CourseNotes from '@/components/CourseNotes';
import CourseRating from '@/components/CourseRating';
import StarDisplay from '@/components/StarDisplay';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('slug', slug)
    .single();
  return { title: course?.title || 'Learning Item' };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!course) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let completion = null;
  if (user) {
    const { data } = await supabase
      .from('completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .single();
    completion = data;
  }

  // Fetch favorite, note, and rating for logged-in user
  let isFavorited = false;
  let noteContent = '';
  let userRating: { rating: number; comment: string | null } | null = null;
  if (user) {
    const [{ data: fav }, { data: note }, { data: rating }] = await Promise.all([
      supabase.from('favorites').select('id').eq('user_id', user.id).eq('course_id', course.id).single(),
      supabase.from('notes').select('content').eq('user_id', user.id).eq('course_id', course.id).single(),
      supabase.from('ratings').select('rating, comment').eq('user_id', user.id).eq('course_id', course.id).single(),
    ]);
    isFavorited = !!fav;
    noteContent = note?.content || '';
    userRating = rating;
  }

  // Fetch average rating
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('course_id', course.id);
  const avgRating = allRatings && allRatings.length > 0
    ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
    : 0;
  const ratingCount = allRatings?.length || 0;

  // Find pathways this course belongs to, with position info
  const { data: pathwayCourses } = await supabase
    .from('pathway_courses')
    .select('sort_order, pathway:pathways(id, title, slug, badge_name, badge_color, pathway_courses(id))')
    .eq('course_id', course.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link href="/courses" className="text-qcc-sky hover:text-qcc-sky-hover">Learning Items</Link>
        <svg className="w-3.5 h-3.5 text-qcc-gray dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-qcc-gray dark:text-gray-400 truncate">{course.title}</span>
      </nav>

      {/* Completion status banner */}
      {completion && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm font-medium ${
          completion.verified_by
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
        }`}>
          {completion.verified_by ? (
            <>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified Complete — Completed {new Date(completion.completed_at).toLocaleDateString()}
            </>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed {new Date(completion.completed_at).toLocaleDateString()}
            </>
          )}
        </div>
      )}

      {course.image_url ? (
        <div className="aspect-video bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden mb-6">
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-qcc-blue to-qcc-sky rounded-xl flex items-center justify-center mb-6">
          <FormatIcon format={course.format || 'webpage'} className="w-20 h-20 text-white/30" />
        </div>
      )}

      {/* Pathway banner */}
      {pathwayCourses && pathwayCourses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {pathwayCourses.map((pc: any) => {
            const totalInPathway = pc.pathway?.pathway_courses?.length || 0;
            const position = pc.sort_order + 1;
            return pc.pathway && (
              <Link
                key={pc.pathway.id}
                href={`/pathways/${pc.pathway.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: pc.pathway.badge_color }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {pc.pathway.badge_name} — Item {position} of {totalInPathway}
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="text-3xl font-bold text-qcc-dark dark:text-white">{course.title}</h1>
        {user && <FavoriteButton courseId={course.id} isFavorited={isFavorited} />}
      </div>

      {ratingCount > 0 && (
        <div className="mb-3">
          <StarDisplay rating={avgRating} count={ratingCount} size="md" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-qcc-gray dark:text-gray-400">
        {course.estimated_minutes && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.estimated_minutes} minutes
          </span>
        )}
        {course.tags?.map((tag: string) => (
          <span key={tag} className="bg-qcc-blue-light dark:bg-qcc-blue/20 text-qcc-blue dark:text-qcc-sky px-2.5 py-0.5 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="prose max-w-none mb-8">
        <p className="text-lg text-qcc-gray dark:text-gray-300 leading-relaxed">{course.description}</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 items-center">
        <LaunchCourseButton externalUrl={course.external_url} />
        {user && (
          <CompletionButton
            courseId={course.id}
            completed={!!completion}
            verifiedBy={completion?.verified_by || null}
          />
        )}
        {!user && (
          <Link
            href="/login"
            className="text-sm text-qcc-sky hover:text-qcc-sky-hover font-medium"
          >
            Log in to track your progress
          </Link>
        )}
      </div>

      {/* Rating (only after completion) */}
      {user && completion && (
        <CourseRating
          courseId={course.id}
          existingRating={userRating?.rating || null}
          existingComment={userRating?.comment || null}
        />
      )}

      {/* Personal notes */}
      {user && (
        <CourseNotes courseId={course.id} initialContent={noteContent} />
      )}
    </div>
  );
}
