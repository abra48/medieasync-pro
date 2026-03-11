'use client';

import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import ProgressBar from '@/components/ui/ProgressBar';
import { BarChart3, CheckCircle2, Clock, AlertCircle, Users, ListChecks, Loader2 } from 'lucide-react';

export default function ReportModal() {
  const { currentRole, tasks, tasksLoading, members, membersLoading, finances, financesLoading } = useAppContext();
  const isReadOnly = currentRole !== 'ketua';

  const completed = tasks.filter(t => t.status === 'Selesai').length;
  const pending = tasks.filter(t => t.status === 'Menunggu Konfirmasi').length;
  const notStarted = tasks.filter(t => t.status === 'Belum Dikerjakan').length;
  const totalBiaya = finances.reduce((sum, f) => sum + f.price, 0);
  const isLoading = tasksLoading || membersLoading || financesLoading;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#10b981]" /></div>;
  }

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
        <h3 className="text-sm font-semibold text-[#fafafa] mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-[#10b981]" />Ringkasan Periode
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-[#1e252b] p-3 text-center">
            <Users size={18} className="text-[#10b981] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#fafafa]">{members.length}</p>
            <p className="text-[10px] text-[#8c8c8e]">Total Anggota</p>
          </div>
          <div className="rounded-lg bg-[#1e252b] p-3 text-center">
            <ListChecks size={18} className="text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-[#fafafa]">{tasks.length}</p>
            <p className="text-[10px] text-[#8c8c8e]">Total Tugas</p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-green-400"><CheckCircle2 size={14} /> Selesai</span>
            <span className="text-xs font-bold text-[#fafafa]">{completed}</span>
          </div>
          <ProgressBar value={completed} max={tasks.length || 1} color="bg-green-500" showPercent={false} />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-amber-400"><Clock size={14} /> Menunggu</span>
            <span className="text-xs font-bold text-[#fafafa]">{pending}</span>
          </div>
          <ProgressBar value={pending} max={tasks.length || 1} color="bg-amber-500" showPercent={false} />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-red-400"><AlertCircle size={14} /> Belum Dikerjakan</span>
            <span className="text-xs font-bold text-[#fafafa]">{notStarted}</span>
          </div>
          <ProgressBar value={notStarted} max={tasks.length || 1} color="bg-red-500" showPercent={false} />
        </div>
        <div className="rounded-lg bg-[#1e252b] p-3 mt-4">
          <p className="text-xs text-[#8c8c8e] mb-1">Total Pengeluaran</p>
          <p className="text-lg font-bold text-[#10b981]">Rp {totalBiaya.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {!isReadOnly && (
        <div className="text-center">
          <button className="rounded-lg bg-[#10b981] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors">
            📥 Ekspor Laporan (PDF)
          </button>
          <p className="text-[10px] text-[#8c8c8e] mt-2">Data waktu nyata dari basis data Supabase</p>
        </div>
      )}
    </div>
  );
}
