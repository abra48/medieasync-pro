'use client';

import { useAppContext } from '@/context/AppContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { CheckCircle2, Clock, AlertCircle, Check, Loader2, Download, FileText } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  'Belum Dikerjakan': { icon: <AlertCircle size={14} />, bg: 'bg-red-500/10', text: 'text-red-400' },
  'Menunggu Konfirmasi': { icon: <Clock size={14} />, bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'Selesai': { icon: <CheckCircle2 size={14} />, bg: 'bg-green-500/10', text: 'text-green-400' },
};

export default function BoardModal() {
  const { currentRole, tasks, tasksLoading, updateTaskStatus } = useAppContext();
  const isSekretaris = currentRole === 'sekretaris';
  const isKetua = currentRole === 'ketua';
  const canValidate = isSekretaris || isKetua;

  const completedCount = tasks.filter(t => t.status === 'Selesai').length;
  const totalTasks = tasks.length;

  return (
    <div>
      <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#fafafa]">Progres Keseluruhan</h3>
          <span className="text-sm font-bold text-[#10b981]">{completedCount}/{totalTasks} Selesai</span>
        </div>
        <ProgressBar value={completedCount} max={totalTasks || 1} showPercent={true} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Semua Tugas</h3>
        {tasksLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : tasks.map((task) => {
          const sc = statusConfig[task.status];
          const hasSubmission = task.status === 'Menunggu Konfirmasi' || task.status === 'Selesai';
          return (
            <div key={task.id} className="rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#fafafa]">{task.task_name}</p>
                  <p className="text-xs text-[#8c8c8e] mt-0.5">{task.assignee_name || 'Belum ditugaskan'}</p>

                  {/* Show submission note */}
                  {hasSubmission && task.submission_note && (
                    <div className="mt-2 rounded-lg bg-blue-500/5 border border-blue-500/10 px-3 py-2">
                      <p className="text-[10px] font-semibold text-blue-400/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText size={10} /> Catatan Pengumpulan
                      </p>
                      <p className="text-xs text-[#fafafa]/80">{task.submission_note}</p>
                    </div>
                  )}

                  {/* Show download file link */}
                  {hasSubmission && task.file_url && (
                    <a
                      href={task.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 text-xs font-semibold text-[#10b981] hover:bg-[#10b981]/20 transition-colors"
                    >
                      <Download size={12} /> Download File
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                    {sc.icon}{task.status}
                  </span>
                </div>
              </div>

              {/* Validate button for sekretaris/ketua */}
              {canValidate && task.status === 'Menunggu Konfirmasi' && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'Selesai')}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 text-[10px] font-bold text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Check size={12} />Konfirmasi Selesai
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
