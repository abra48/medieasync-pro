'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { Plus, Trash2, CalendarDays, Loader2 } from 'lucide-react';

export default function JadwalModal() {
  const { currentRole, schedules, schedulesLoading, addSchedule, deleteSchedule } = useAppContext();
  const isSekretaris = currentRole === 'sekretaris';
  const isReadOnly = !isSekretaris;

  const [eventDate, setEventDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate || !eventName.trim()) return;
    setSubmitting(true);
    try {
      await addSchedule(eventName.trim(), eventDate);
      setEventDate('');
      setEventName('');
    } catch (err) {
      console.error('Failed to add schedule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      {isSekretaris && (
        <form onSubmit={handleAdd} className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <CalendarDays size={16} className="text-[#10b981]" />Tambah Jadwal
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
              className="rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#10b981]/50" />
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)}
              placeholder="Nama kegiatan..."
              className="flex-1 rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50" />
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors shrink-0 disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Jadwal Mendatang ({schedules.length})</h3>
        {schedulesLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : schedules.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-[#10b981]/10">
                <span className="text-[10px] font-bold text-[#10b981]">{new Date(s.event_date).toLocaleDateString('id-ID', { day: '2-digit' })}</span>
                <span className="text-[8px] text-[#10b981]/70 uppercase">{new Date(s.event_date).toLocaleDateString('id-ID', { month: 'short' })}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#fafafa]">{s.event_name}</p>
                <p className="text-xs text-[#8c8c8e]">{new Date(s.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            {isSekretaris && (
              <button onClick={() => deleteSchedule(s.id)}
                className="p-1.5 rounded-lg text-[#8c8c8e] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
