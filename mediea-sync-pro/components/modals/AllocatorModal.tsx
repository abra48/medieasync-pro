'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { Plus, CheckCircle2, Clock, AlertCircle, Check, Loader2 } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  'Belum Dikerjakan': { icon: <AlertCircle size={14} />, bg: 'bg-red-500/10', text: 'text-red-400' },
  'Menunggu Konfirmasi': { icon: <Clock size={14} />, bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'Selesai': { icon: <CheckCircle2 size={14} />, bg: 'bg-green-500/10', text: 'text-green-400' },
};

export default function AllocatorModal() {
  const { currentRole, user, tasks, tasksLoading, members, addTask, updateTaskAssignee, updateTaskStatus } = useAppContext();
  const isKetua = currentRole === 'ketua';
  const isSekretaris = currentRole === 'sekretaris';
  const isAnggota = currentRole === 'anggota';
  const canValidate = isKetua || isSekretaris;
  const isReadOnly = !isKetua && !isAnggota && !isSekretaris;

  const [taskName, setTaskName] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    setSubmitting(true);
    try {
      const selectedMember = members.find(m => m.id === assigneeId);
      await addTask(taskName.trim(), selectedMember?.name || '');
      setTaskName('');
      setAssigneeId('');
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    if (!user) return;
    const profile = members.find(m => m.id === user.id);
    await updateTaskAssignee(taskId, profile?.name || 'Anda');
  };

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      {isKetua && (
        <form onSubmit={handleAddTask} className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <Plus size={16} className="text-[#10b981]" />
            Buat Tugas Baru
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Nama tugas..."
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50"
            />
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#10b981]/50"
            >
              <option value="">-- Pilih Penanggung Jawab (opsional) --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}{m.nim ? ` (${m.nim})` : ''}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              Tambah Tugas
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">
          Daftar Tugas ({tasks.length})
        </h3>
        {tasksLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : tasks.map((task) => {
          const sc = statusConfig[task.status];
          return (
            <div key={task.id} className="rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#fafafa]">{task.task_name}</p>
                  <p className="text-xs text-[#8c8c8e] mt-0.5">
                    {task.assignee_name ? `Ditugaskan: ${task.assignee_name}` : 'Belum ada penanggung jawab'}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                  {sc.icon}
                  {task.status}
                </span>
              </div>

              {isAnggota && task.status === 'Belum Dikerjakan' && !task.assignee_name && (
                <button
                  onClick={() => handleClaimTask(task.id)}
                  className="mt-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 text-xs font-semibold text-[#10b981] hover:bg-[#10b981]/20 transition-colors"
                >
                  🙋 Ambil Tugas
                </button>
              )}

              {isAnggota && task.status === 'Belum Dikerjakan' && task.assignee_name && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'Menunggu Konfirmasi')}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  ✅ Tandai Selesai
                </button>
              )}

              {canValidate && task.status === 'Menunggu Konfirmasi' && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'Selesai')}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Check size={12} />
                  ✅ Validasi
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
