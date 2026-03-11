'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import StatsRow from '@/components/dashboard/StatsRow';
import ServicesGrid from '@/components/dashboard/ServicesGrid';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#1e252b]">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 md:pt-6 md:p-6 lg:p-8 overflow-y-auto min-w-0">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#fafafa] mb-1">Dasbor</h1>
            <p className="text-sm text-[#8c8c8e]">Selamat datang di Panel Kontrol Mediea Sync Pro</p>
          </div>

          <StatsRow />
          <ServicesGrid />
        </div>
      </main>
    </div>
  );
}
