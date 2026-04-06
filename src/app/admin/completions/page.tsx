import { createClient } from '@/lib/supabase/server';
import CompletionsManager from '@/components/admin/CompletionsManager';

export const dynamic = 'force-dynamic';

export default async function AdminCompletionsPage() {
  const supabase = await createClient();

  const { data: completions } = await supabase
    .from('completions')
    .select('*, profile:profiles!completions_user_id_fkey(full_name, email), course:courses(title)')
    .order('completed_at', { ascending: false });

  return <CompletionsManager initialCompletions={completions || []} />;
}
