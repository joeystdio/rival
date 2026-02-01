import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rival — Competitor Intelligence',
  description: 'Know what your competitors are doing — without checking. AI-powered competitor tracking for indie makers.',
  openGraph: {
    title: 'Rival — Competitor Intelligence',
    description: 'Know what your competitors are doing — without checking.',
    url: 'https://rival.jdms.nl',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
