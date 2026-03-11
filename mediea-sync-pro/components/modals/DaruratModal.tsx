'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { AlertTriangle, ArrowRightLeft, Loader2 } from 'lucide-react';

export default function DaruratModal() {
  const { currentRole, tasks, tasksLoading, members, updateTaskAssignee } = useAppContext();
  const isReadOnly = currentRole !== 'ketua';

  const stuckTasks = tasks.filter(t => t.status !== 'Selesai');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOverride = async () => {
    if (!selectedTaskId || !newAssigneeId) return;
    setSubmitting(true);
    try {
      const member = members.find(m => m.id === newAssigneeId);
      await updateTaskAssignee(selectedTaskId, member?.name || '');
      setSelectedTaskId('');
      setNewAssigneeId('');
    } catch (err) {
      console.error('Failed to reassign task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
        <AlertTriangle size={18} className="text-red-400 shrink-0" />
        <p className="text-sm text-red-400">{stuckTasks.length} tugas belum selesai dan mungkin memerlukan intervensi.</p>
      </div>

      {!isReadOnly && (
        <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-[#10b981]" />Alih Tanggung Jawab Penugasan
          </h3>
          <div className="space-y-3">
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#10b981]/50">
              <option value="">-- Pilih tugas yang macet --</option>
              {stuckTasks.map((t) => (
                <option key={t.id} value={t.id}>{t.task_name} ({t.assignee_name || 'belum ditugaskan'})</option>
              ))}
            </select>
            <select value={newAssigneeId} onChange={(e) => setNewAssigneeId(e.target.value)}
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#10b981]/50">
              <option value="">-- Pilih anggota baru --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button onClick={handleOverride} disabled={!selectedTaskId || !newAssigneeId || submitting}
              className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              ⚠️ Alih Tanggung Jawab
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Tugas Bermasalah ({stuckTasks.length})</h3>
        {tasksLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : stuckTasks.length === 0 ? (
          <p className="text-sm text-[#8c8c8e] text-center py-6">✅ Semua tugas telah selesai!</p>
        ) : stuckTasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#fafafa]">{task.task_name}</p>
              <p className="text-xs text-[#8c8c8e] mt-0.5">{task.assignee_name || 'Belum ditugaskan'} • {task.status}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-400">
              <AlertTriangle size={10} />Perlu Perhatian
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
