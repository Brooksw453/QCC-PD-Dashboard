import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = body.record || body;

    const userId = record.user_id;
    const pathwayId = record.pathway_id;

    if (!userId || !pathwayId) {
      return NextResponse.json({ error: 'Missing user_id or pathway_id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch webhook URL
    const { data: setting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'webhook_url')
      .single();

    if (!setting?.value) {
      return NextResponse.json({ message: 'No webhook configured' }, { status: 200 });
    }

    // Fetch user and pathway details
    const [{ data: profile }, { data: pathway }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
      supabase.from('pathways').select('badge_name, title').eq('id', pathwayId).single(),
    ]);

    const message = `${profile?.full_name || 'A faculty member'} just earned the "${pathway?.badge_name || pathway?.title || 'Unknown'}" badge!`;

    // Send to webhook (Slack/Teams compatible)
    await fetch(setting.value, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
