'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Props {
  courseId: string;
  existingRating: number | null;
  existingComment: string | null;
}

export default function CourseRating({ courseId, existingRating, existingComment }: Props) {
  const [rating, setRating] = useState(existingRating || 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existingComment || '');
  const [showComment, setShowComment] = useState(!!existingComment);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleRate = async (value: number) => {
    setRating(value);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase
      .from('ratings')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        rating: value,
        comment: comment || null,
      }, { onConflict: 'user_id,course_id' });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const handleSaveComment = async () => {
    if (rating === 0) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase
      .from('ratings')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        rating,
        comment: comment || null,
      }, { onConflict: 'user_id,course_id' });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-qcc-dark dark:text-slate-100">Rate this item:</span>
        <div className="flex items-center gap-0">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              disabled={saving}
              className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-7 h-7 ${
                  star <= (hovered || rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
                } transition-colors`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        {saved && <span className="text-xs text-green-600 dark:text-green-400">Saved!</span>}
        {saving && <span className="text-xs text-qcc-gray dark:text-gray-400">Saving...</span>}
      </div>

      {rating > 0 && (
        <div className="mt-3">
          {!showComment ? (
            <button onClick={() => setShowComment(true)} className="text-sm text-qcc-sky hover:text-qcc-sky-hover font-medium py-2">
              Add a comment
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent resize-y"
                placeholder="Optional feedback..."
              />
              <button onClick={handleSaveComment} disabled={saving}
                className="px-4 py-1.5 bg-qcc-blue text-white rounded-lg text-xs font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Comment'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
