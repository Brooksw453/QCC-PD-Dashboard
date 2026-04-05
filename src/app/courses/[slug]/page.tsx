import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import LaunchCourseButton from '@/components/LaunchCourseButton';
import CompletionButton from '@/components/CompletionButton';
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
  return { title: course?.title || 'Course' };
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

  // Find pathways this course belongs to
  const { data: pathwayCourses } = await supabase
    .from('pathway_courses')
    .select('pathway:pathways(id, title, slug, badge_name, badge_color)')
    .eq('course_id', course.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/courses" className="text-sm text-qcc-sky hover:text-qcc-sky-hover mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to courses
      </Link>

      {course.image_url ? (
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-qcc-blue to-qcc-sky rounded-xl flex items-center justify-center mb-6">
          <svg className="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      )}

      <h1 className="text-3xl font-bold text-qcc-dark mb-3">{course.title}</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-qcc-gray">
        {course.estimated_minutes && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.estimated_minutes} minutes
          </span>
        )}
        {course.tags?.map((tag: string) => (
          <span key={tag} className="bg-qcc-blue-light text-qcc-blue px-2.5 py-0.5 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="prose max-w-none text-qcc-dark mb-8">
        <p className="text-lg text-qcc-gray leading-relaxed">{course.description}</p>
      </div>

      {/* Pathways this course belongs to */}
      {pathwayCourses && pathwayCourses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-qcc-gray mb-2">Part of:</h3>
          <div className="flex flex-wrap gap-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pathwayCourses.map((pc: any) => (
              pc.pathway && (
                <Link
                  key={pc.pathway.id}
                  href={`/pathways/${pc.pathway.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: pc.pathway.badge_color }}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {pc.pathway.badge_name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
