'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Announcement } from '@/lib/types';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) return;

      const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
      const visible = data.filter((a: Announcement) => !dismissed.includes(a.id));
      setAnnouncements(visible);
    };
    load();
  }, []);

  const dismiss = (id: string) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
    dismissed.push(id);
    localStorage.setItem('dismissed_announcements', JSON.stringify(dismissed));
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-0">
      {announcements.map(a => (
        <div key={a.id} className="bg-qcc-blue text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <div className="min-w-0">
                <span className="font-semibold text-sm">{a.title}</span>
                <span className="text-white/80 text-sm ml-2">{a.message}</span>
              </div>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              className="shrink-0 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white transition-colors -mr-2"
              aria-label="Dismiss announcement"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
