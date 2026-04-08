'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  courseId: string;
  initialContent: string;
}

export default function CourseNotes({ courseId, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (content === initialContent) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notes')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          content,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,course_id' });

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content]);

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-qcc-dark dark:text-slate-100">My Notes</label>
        {status === 'saving' && (
          <span className="text-xs text-qcc-gray dark:text-gray-400">Saving...</span>
        )}
        {status === 'saved' && (
          <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent resize-y"
        placeholder="Add personal notes about this learning item..."
      />
    </div>
  );
}
