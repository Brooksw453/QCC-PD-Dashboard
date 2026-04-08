import CsvImporter from '@/components/admin/CsvImporter';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Import Learning Items',
};

export default function ImportCoursesPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/courses" className="text-qcc-sky hover:text-qcc-sky-hover text-sm">
          &larr; Back to Learning Items
        </Link>
      </div>
      <h2 className="text-lg font-semibold text-qcc-dark dark:text-white mb-4">Import Learning Items from CSV</h2>
      <CsvImporter />
    </div>
  );
}
