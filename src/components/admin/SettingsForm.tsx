'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  initialWebhookUrl: string;
}

export default function SettingsForm({ initialWebhookUrl }: Props) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'webhook_url',
        value: webhookUrl,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'key' });

    if (error) {
      setMessage('Failed to save settings.');
    } else {
      setMessage('Settings saved!');
    }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!webhookUrl) return;
    setTesting(true);
    setMessage('');

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Test notification from QCC Professional Development Dashboard',
        }),
      });
      if (res.ok) {
        setMessage('Test notification sent!');
      } else {
        setMessage('Test failed — check the webhook URL.');
      }
    } catch {
      setMessage('Test failed — could not reach the webhook URL.');
    }
    setTesting(false);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm text-qcc-dark dark:text-white">Slack / Teams Webhook</h3>
        <p className="text-xs text-qcc-gray dark:text-gray-400">
          Configure a webhook URL to receive notifications when faculty members earn badges.
          Works with Slack Incoming Webhooks or Microsoft Teams connectors.
        </p>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            message.includes('Failed') || message.includes('failed')
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          }`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="https://hooks.slack.com/services/..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-qcc-blue text-white rounded-lg text-sm font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {webhookUrl && (
            <button type="button" onClick={handleTest} disabled={testing}
              className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-qcc-dark dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
              {testing ? 'Sending...' : 'Test Webhook'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
