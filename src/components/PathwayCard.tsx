'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PathwayCourseItem {
  course_id: string;
  sort_order: number;
  course: {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    estimated_minutes: number | null;
  } | null;
}

interface PathwayCardProps {
  pathway: {
    id: string;
    title: string;
    slug: string;
    description: string;
    badge_name: string;
    badge_color: string;
    deadline: string | null;
    pathway_courses: PathwayCourseItem[];
  };
  completedIds: string[];
  earned: boolean;
  isLoggedIn: boolean;
  prerequisiteMet?: boolean;
  prerequisiteTitle?: string;
}

export default function PathwayCard({ pathway, completedIds, earned, isLoggedIn, prerequisiteMet = true, prerequisiteTitle }: PathwayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const completedSet = new Set(completedIds);
  const totalItems = pathway.pathway_courses?.length || 0;
  const completedCount = pathway.pathway_courses?.filter(pc => completedSet.has(pc.course_id)).length || 0;
  const pct = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  const sortedCourses = [...(pathway.pathway_courses || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all">
      {/* Clickable header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-qcc-sky focus:ring-inset"
      >
        <div className="flex items-start gap-4">
          {/* Badge icon */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shrink-0 transition-transform ${expanded ? 'scale-110' : ''} ${earned ? '' : 'opacity-50'}`}
            style={{ backgroundColor: pathway.badge_color }}
          >
            {earned ? (
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-qcc-dark dark:text-white">{pathway.title}</h3>
                <p className="text-sm font-medium" style={{ color: pathway.badge_color }}>
                  {pathway.badge_name}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!prerequisiteMet && isLoggedIn && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked
                  </span>
                )}
                {pathway.deadline && !earned && (() => {
                  const daysLeft = Math.ceil((new Date(pathway.deadline).getTime() - Date.now()) / 86400000);
                  const color = daysLeft <= 7 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : daysLeft <= 30 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                  return (
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${color}`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                    </span>
                  );
                })()}
                {earned && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full font-medium">
                    Badge Earned!
                  </span>
                )}
                <svg
                  className={`w-5 h-5 text-qcc-gray transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <p className="text-sm text-qcc-gray dark:text-gray-400 mt-1 line-clamp-2">{pathway.description}</p>

            {/* Prerequisite notice */}
            {!prerequisiteMet && isLoggedIn && prerequisiteTitle && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                Complete &quot;{prerequisiteTitle}&quot; first to unlock this pathway.
              </p>
            )}

            {/* Progress bar */}
            {isLoggedIn && prerequisiteMet && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: earned ? '#16A34A' : pathway.badge_color,
                    }}
                  />
                </div>
                <p className="text-xs text-qcc-gray dark:text-gray-400 mt-1">
                  {completedCount} of {totalItems} learning items
                </p>
              </div>
            )}
            {!isLoggedIn && (
              <p className="text-xs text-qcc-gray dark:text-gray-400 mt-2">{totalItems} learning items</p>
            )}
          </div>
        </div>
      </button>

      {/* Expandable content */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="space-y-2">
              {sortedCourses.map((pc, index) => {
                const course = pc.course;
                if (!course) return null;
                const isCompleted = completedSet.has(course.id);

                return (
                  <Link
                    key={pc.course_id}
                    href={`/courses/${course.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCompleted
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-600 text-qcc-gray dark:text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-qcc-dark dark:text-white group-hover:text-qcc-blue dark:group-hover:text-qcc-sky transition-colors">
                        {course.title}
                      </p>
                      <p className="text-xs text-qcc-gray dark:text-gray-400 truncate">{course.short_description}</p>
                    </div>
                    {course.estimated_minutes && (
                      <span className="text-xs text-qcc-gray dark:text-gray-500 shrink-0">{course.estimated_minutes} min</span>
                    )}
                  </Link>
                );
              })}
            </div>

            <Link
              href={`/pathways/${pathway.slug}`}
              className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-qcc-sky hover:text-qcc-sky-hover transition-colors"
            >
              View pathway details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
