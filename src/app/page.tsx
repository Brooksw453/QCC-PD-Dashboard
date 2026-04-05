import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-qcc-blue to-qcc-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Image
            src="/qcc_logo_4c.png"
            alt="QCC Logo"
            width={280}
            height={99}
            className="mx-auto mb-8 brightness-0 invert"
            priority
          />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Professional Development
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Explore courses, complete learning pathways, and earn badges to enhance your teaching practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="px-8 py-3 bg-qcc-sky text-white rounded-lg font-semibold hover:bg-qcc-sky-hover transition-colors text-lg"
            >
              Browse Courses
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 bg-white/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-white/20 transition-colors text-lg border border-white/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-qcc-blue-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-qcc-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-qcc-dark mb-2">Self-Paced Courses</h3>
            <p className="text-qcc-gray text-sm">
              Complete interactive Articulate Rise courses on your own schedule.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-qcc-sky-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-qcc-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-qcc-dark mb-2">Learning Pathways</h3>
            <p className="text-qcc-gray text-sm">
              Follow structured pathways to build expertise in key areas.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-qcc-dark mb-2">Earn Badges</h3>
            <p className="text-qcc-gray text-sm">
              Complete pathways to earn digital badges recognizing your achievements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
