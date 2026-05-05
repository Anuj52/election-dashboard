import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardProvider } from '@/context/DashboardContext';
import LayoutWrapper from '@/components/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Election Dashboard',
  description: 'Analysis of Assembly Elections',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <DashboardProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </DashboardProvider>
      </body>
    </html>
  );
}
