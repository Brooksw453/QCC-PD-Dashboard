import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-qcc-dark dark:bg-slate-950 text-white mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-medium">Quinsigamond Community College</p>
            <p className="text-xs text-gray-400">Professional Development Dashboard</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/pathways" className="hover:text-white transition-colors">
              Pathways
            </Link>
            <Link href="/courses" className="hover:text-white transition-colors">
              Learning Items
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Quinsigamond Community College
          </p>
        </div>
      </div>
    </footer>
  );
}
