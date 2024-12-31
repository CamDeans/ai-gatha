/**
 * Dashboard layout component
 * Provides consistent layout for dashboard pages
 */
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col sm:flex-row pt-14">
        <div className="w-full sm:w-64 sm:sticky sm:top-14 sm:h-[calc(100vh-3.5rem)]">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 