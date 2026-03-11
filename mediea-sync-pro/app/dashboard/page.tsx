'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import StatsRow from '@/components/dashboard/StatsRow';
import ServicesGrid from '@/components/dashboard/ServicesGrid';
import { useAppContext } from '@/context/AppContext';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { refreshAllData } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
    } catch (err) {
      console.error('Failed to refresh data:', err);
      alert('Gagal memuat ulang data: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui'));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1e252b]">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 md:pt-6 md:p-6 lg:p-8 overflow-y-auto min-w-0">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard header with refresh button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#fafafa] mb-1">Dasbor</h1>
              <p className="text-sm text-[#8c8c8e]">Selamat datang di Panel Kontrol Mediea Sync Pro</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2.5 text-sm font-semibold text-[#10b981] hover:bg-[#10b981]/20 hover:border-[#10b981]/40 transition-all duration-200 disabled:opacity-50"
              title="Muat ulang semua data"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Memuat ulang...' : 'Refresh'}</span>
            </button>
          </div>

          <StatsRow />
          <ServicesGrid />
        </div>
      </main>
    </div>
  );
}
