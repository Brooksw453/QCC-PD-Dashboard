'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Course } from '@/lib/types';

interface CourseListClientProps {
  courses: Course[];
  completedIds: string[];
}

function FormatIcon({ format }: { format: string }) {
  const className = "w-6 h-6";
  switch (format) {
    case 'document':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'video':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'articulate':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'presentation':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    case 'webpage':
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
  }
}

const formatLabels: Record<string, string> = {
  document: 'Document',
  video: 'Video',
  articulate: 'Articulate Course',
  webpage: 'Webpage',
  presentation: 'Presentation',
  other: 'Resource',
};

export default function CourseListClient({ courses, completedIds }: CourseListClientProps) {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    courses.forEach(c => c.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = !search || course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.short_description?.toLowerCase().includes(search.toLowerCase());
      const matchesTags = selectedTags.size === 0 || course.tags?.some(t => selectedTags.has(t));
      return matchesSearch && matchesTags;
    });
  }, [courses, search, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <>
      {/* Search and filter */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-qcc-gray dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search learning items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTags.has(tag)
                    ? 'bg-qcc-blue text-white'
                    : 'bg-qcc-blue-light dark:bg-qcc-blue/20 text-qcc-blue dark:text-qcc-sky hover:bg-qcc-blue hover:text-white dark:hover:bg-qcc-blue'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.size > 0 && (
              <button
                onClick={() => setSelectedTags(new Set())}
                className="px-3 py-1 rounded-full text-xs font-medium text-qcc-gray dark:text-gray-400 hover:text-qcc-dark dark:hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-qcc-gray dark:text-gray-400 mb-3">
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        {(search || selectedTags.size > 0) && ` matching`}
      </p>

      {/* Compact list */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
          {filtered.map((course) => {
            const isCompleted = completedSet.has(course.id);
            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                {/* Format icon */}
                <div className="w-10 h-10 rounded-lg bg-qcc-blue-light dark:bg-qcc-blue/20 flex items-center justify-center shrink-0 text-qcc-blue dark:text-qcc-sky group-hover:bg-qcc-blue group-hover:text-white dark:group-hover:bg-qcc-blue transition-colors">
                  <FormatIcon format={course.format || 'webpage'} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-qcc-dark dark:text-white truncate group-hover:text-qcc-blue dark:group-hover:text-qcc-sky transition-colors">
                      {course.title}
                    </h3>
                    {isCompleted && (
                      <span className="shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-qcc-gray dark:text-gray-400 truncate mt-0.5">{course.short_description}</p>
                </div>

                {/* Meta */}
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <span className="text-xs text-qcc-gray dark:text-gray-500">
                    {formatLabels[course.format || 'webpage']}
                  </span>
                  {course.estimated_minutes && (
                    <span className="flex items-center gap-1 text-xs text-qcc-gray dark:text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.estimated_minutes} min
                    </span>
                  )}
                  {course.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="bg-qcc-blue-light dark:bg-qcc-blue/20 text-qcc-blue dark:text-qcc-sky px-2 py-0.5 rounded-full text-xs hidden lg:inline">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-qcc-sky transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-qcc-gray dark:text-gray-400 text-sm">No learning items match your search.</p>
          <button
            onClick={() => { setSearch(''); setSelectedTags(new Set()); }}
            className="text-qcc-sky text-sm font-medium hover:text-qcc-sky-hover mt-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
