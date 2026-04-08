import { createClient } from '@/lib/supabase/server';
import SettingsForm from '@/components/admin/SettingsForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Settings',
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: setting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'webhook_url')
    .single();

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-6">Settings</h2>
      <SettingsForm initialWebhookUrl={setting?.value || ''} />
    </div>
  );
}
