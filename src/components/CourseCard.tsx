import Link from 'next/link';
import FormatIcon from './FormatIcon';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  completed?: boolean;
}

export default function CourseCard({ course, completed }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-qcc-sky hover:shadow-md transition-all"
    >
      {course.image_url ? (
        <div className="aspect-video bg-gray-100 dark:bg-slate-700 overflow-hidden">
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-qcc-blue to-qcc-sky flex items-center justify-center">
          <FormatIcon format={course.format || 'webpage'} className="w-12 h-12 text-white/50" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-qcc-dark dark:text-white group-hover:text-qcc-blue transition-colors line-clamp-2">
            {course.title}
          </h3>
          {completed && (
            <span className="shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
        <p className="text-sm text-qcc-gray dark:text-gray-400 line-clamp-2 mb-3">{course.short_description}</p>
        <div className="flex items-center gap-3 text-xs text-qcc-gray dark:text-gray-400">
          {course.estimated_minutes && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.estimated_minutes} min
            </span>
          )}
          {course.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="bg-qcc-blue-light dark:bg-qcc-blue/20 text-qcc-blue dark:text-qcc-sky px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
