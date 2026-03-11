'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { Plus, CheckCircle2, Clock, AlertCircle, Check, Loader2, Upload, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  'Belum Dikerjakan': { icon: <AlertCircle size={14} />, bg: 'bg-red-500/10', text: 'text-red-400' },
  'Menunggu Konfirmasi': { icon: <Clock size={14} />, bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'Selesai': { icon: <CheckCircle2 size={14} />, bg: 'bg-green-500/10', text: 'text-green-400' },
};

export default function AllocatorModal() {
  const { currentRole, user, tasks, tasksLoading, members, addTask, updateTaskAssignee, updateTaskStatus, submitTask } = useAppContext();
  const isKetua = currentRole === 'ketua';
  const isSekretaris = currentRole === 'sekretaris';
  const isAnggota = currentRole === 'anggota';
  const canValidate = isKetua || isSekretaris;
  const isReadOnly = !isKetua && !isAnggota && !isSekretaris;

  const [taskName, setTaskName] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Task submission state (per task accordion)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitNote, setSubmitNote] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const handleSubmitTask = async (taskId: string) => {
    if (!submitFile && !submitNote.trim()) {
      alert('Harap upload file atau tambahkan catatan sebelum mengirim.');
      return;
    }
    setSubmitLoading(true);
    try {
      await submitTask(taskId, submitFile, submitNote.trim());
      setExpandedTaskId(null);
      setSubmitFile(null);
      setSubmitNote('');
    } catch (err) {
      console.error('Failed to submit task:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleExpand = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      setSubmitFile(null);
      setSubmitNote('');
    } else {
      setExpandedTaskId(taskId);
      setSubmitFile(null);
      setSubmitNote('');
    }
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
          const isExpanded = expandedTaskId === task.id;
          return (
            <div key={task.id} className="rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#fafafa]">{task.task_name}</p>
                  <p className="text-xs text-[#8c8c8e] mt-0.5">
                    {task.assignee_name ? `Ditugaskan: ${task.assignee_name}` : 'Belum ada penanggung jawab'}
                  </p>
                  {/* Show submission note for all roles if exists */}
                  {task.submission_note && (task.status === 'Menunggu Konfirmasi' || task.status === 'Selesai') && (
                    <p className="text-xs text-blue-400/80 mt-1 flex items-center gap-1">
                      <FileText size={10} /> {task.submission_note}
                    </p>
                  )}
                  {/* Show download link if file exists */}
                  {task.file_url && (task.status === 'Menunggu Konfirmasi' || task.status === 'Selesai') && (
                    <a
                      href={task.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs text-[#10b981] hover:text-[#34d399] transition-colors"
                    >
                      <Upload size={10} /> Download File
                    </a>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                  {sc.icon}
                  {task.status}
                </span>
              </div>

              {/* Anggota: Ambil Tugas (no assignee yet) */}
              {isAnggota && task.status === 'Belum Dikerjakan' && !task.assignee_name && (
                <button
                  onClick={() => handleClaimTask(task.id)}
                  className="mt-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 text-xs font-semibold text-[#10b981] hover:bg-[#10b981]/20 transition-colors"
                >
                  🙋 Ambil Tugas
                </button>
              )}

              {/* Anggota: Upload & Submit Task (has assignee, not done yet) */}
              {isAnggota && task.status === 'Belum Dikerjakan' && task.assignee_name && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleExpand(task.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    <Upload size={12} />
                    Upload File & Bukti
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 rounded-lg bg-[#1e252b] border border-white/10 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">
                          Upload File
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-[#fafafa] file:mr-3 file:rounded-lg file:border-0 file:bg-[#10b981]/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#10b981] hover:file:bg-[#10b981]/20 file:cursor-pointer file:transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">
                          Catatan Tugas
                        </label>
                        <textarea
                          value={submitNote}
                          onChange={(e) => setSubmitNote(e.target.value)}
                          placeholder="Tambahkan catatan tugas..."
                          rows={3}
                          className="w-full rounded-lg bg-[#2c2c38] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 resize-none"
                        />
                      </div>
                      <button
                        onClick={() => handleSubmitTask(task.id)}
                        disabled={submitLoading}
                        className="w-full rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Kirim Tugas
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ketua/Sekretaris: Validate */}
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
