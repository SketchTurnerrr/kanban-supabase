import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Search } from '@/components/Search';
import Link from 'next/link';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex items-center h-14 px-4 border-b lg:h-20 dark:border-gray-800">
          <div className="flex-1 font-semibold text-base lg:text-xl">
            <Link href="/">Kanban</Link>
          </div>
          <Suspense>
            <Search />
          </Suspense>
        </header>
        {children}
      </body>
    </html>
  );
}