/**
 * Dashboard layout component
 * Provides consistent layout for dashboard pages
 */
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
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
    <div className="relative min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-3.5rem)] pt-14">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 