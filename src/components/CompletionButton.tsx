'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface CompletionButtonProps {
  courseId: string;
  completed: boolean;
  verifiedBy: string | null;
}

export default function CompletionButton({ courseId, completed, verifiedBy }: CompletionButtonProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleMarkComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('completions')
      .insert({ user_id: user.id, course_id: courseId });

    if (error && error.code !== '23505') {
      alert('Failed to mark as complete. Please try again.');
    }

    setLoading(false);
    router.refresh();
  };

  const handleUndo = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('completions')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    setLoading(false);
    router.refresh();
  };

  if (completed && verifiedBy) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Verified Complete
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Completed
        </div>
        <button
          onClick={handleUndo}
          disabled={loading}
          className="text-sm text-qcc-gray hover:text-qcc-error transition-colors disabled:opacity-50"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 bg-qcc-blue text-white rounded-lg font-semibold hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
    >
      {loading ? (
        'Marking...'
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Mark as Complete
        </>
      )}
    </button>
  );
}
