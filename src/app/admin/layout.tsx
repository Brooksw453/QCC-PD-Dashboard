import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
};

const adminNav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/pathways', label: 'Pathways' },
  { href: '/admin/faculty', label: 'Faculty' },
  { href: '/admin/completions', label: 'Completions' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-qcc-dark">Admin Dashboard</h1>
      </div>

      <nav className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-4 py-2 text-sm font-medium text-qcc-gray hover:text-qcc-blue hover:bg-qcc-blue-light rounded-t-lg transition-colors whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
