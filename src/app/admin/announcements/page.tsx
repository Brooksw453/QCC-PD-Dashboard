import { createClient } from '@/lib/supabase/server';
import AnnouncementsManager from '@/components/admin/AnnouncementsManager';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Announcements',
};

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-6">Manage Announcements</h2>
      <AnnouncementsManager announcements={announcements || []} />
    </div>
  );
}
