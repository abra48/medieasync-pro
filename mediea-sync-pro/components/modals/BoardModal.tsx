'use client';

import { useAppContext } from '@/context/AppContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { CheckCircle2, Clock, AlertCircle, Check, Loader2 } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  'Belum Dikerjakan': { icon: <AlertCircle size={14} />, bg: 'bg-red-500/10', text: 'text-red-400' },
  'Menunggu Konfirmasi': { icon: <Clock size={14} />, bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'Selesai': { icon: <CheckCircle2 size={14} />, bg: 'bg-green-500/10', text: 'text-green-400' },
};

export default function BoardModal() {
  const { currentRole, tasks, tasksLoading, updateTaskStatus } = useAppContext();
  const isSekretaris = currentRole === 'sekretaris';

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
          return (
            <div key={task.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#fafafa]">{task.task_name}</p>
                <p className="text-xs text-[#8c8c8e] mt-0.5">{task.assignee_name || 'Belum ditugaskan'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                  {sc.icon}{task.status}
                </span>
                {isSekretaris && task.status === 'Menunggu Konfirmasi' && (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'Selesai')}
                    className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 text-[10px] font-bold text-green-400 hover:bg-green-500/20 transition-colors"
                  >
                    <Check size={12} />Konfirmasi
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
