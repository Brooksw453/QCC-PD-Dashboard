'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('faculty');
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserAndRole = async (authUser: User | null) => {
      setUser(authUser);
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single();
        if (profile) setRole(profile.role);
      } else {
        setRole('faculty');
      }
    };

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      fetchUserAndRole(user);
    });

    // Re-fetch role on every auth state change (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === href || pathname.startsWith(href + '/')
          ? 'text-qcc-sky bg-qcc-blue-light'
          : 'text-qcc-dark hover:text-qcc-sky hover:bg-qcc-gray-light'
      }`}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/qcc_logo_4c.png"
              alt="QCC Logo"
              width={160}
              height={57}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/courses', 'Courses')}
            {navLink('/pathways', 'Pathways')}
            {user && navLink('/dashboard', 'My Dashboard')}
            {user && role === 'admin' && navLink('/admin', 'Admin')}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-qcc-gray hover:text-qcc-dark transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-qcc-blue hover:text-qcc-blue-hover transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-qcc-blue hover:bg-qcc-blue-hover rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-qcc-gray hover:text-qcc-dark"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navLink('/courses', 'Courses')}
            {navLink('/pathways', 'Pathways')}
            {user && navLink('/dashboard', 'My Dashboard')}
            {user && role === 'admin' && navLink('/admin', 'Admin')}
            <hr className="my-2 border-gray-200" />
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-left text-sm font-medium text-qcc-gray hover:text-qcc-dark"
              >
                Sign Out
              </button>
            ) : (
              <>
                {navLink('/login', 'Log In')}
                {navLink('/signup', 'Sign Up')}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
