import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "QCC Professional Development",
    template: "%s | QCC Professional Development",
  },
  description:
    "Professional development dashboard for Quinsigamond Community College faculty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme');const d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch{}` }} />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-900 text-qcc-dark dark:text-slate-100 transition-colors">
        <Navbar />
        <AnnouncementBanner />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
