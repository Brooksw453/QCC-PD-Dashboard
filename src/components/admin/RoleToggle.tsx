'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface RoleToggleProps {
  userId: string;
  currentRole: string;
  userName: string;
}

export default function RoleToggle({ userId, currentRole, userName }: RoleToggleProps) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async () => {
    const newRole = role === 'admin' ? 'faculty' : 'admin';
    const action = newRole === 'admin' ? 'promote to admin' : 'change to faculty';

    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      alert('Failed to update role: ' + error.message);
    } else {
      setRole(newRole);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${
        role === 'admin'
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      }`}
      title={`Click to ${role === 'admin' ? 'change to faculty' : 'promote to admin'}`}
    >
      {loading ? '...' : role}
    </button>
  );
}
