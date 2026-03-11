'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { BellRing, Send, Loader2 } from 'lucide-react';

export default function ColekModal() {
  const { currentRole, members, warnings, warningsLoading, addWarning } = useAppContext();
  const isReadOnly = currentRole !== 'ketua';

  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !message.trim()) return;
    setSubmitting(true);
    try {
      await addWarning(to, message.trim());
      setTo('');
      setMessage('');
    } catch (err) {
      console.error('Failed to add warning:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      {!isReadOnly && (
        <form onSubmit={handleSend} className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <BellRing size={16} className="text-[#10b981]" />Kirim Peringatan Kinerja
          </h3>
          <div className="space-y-3">
            <select value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#10b981]/50">
              <option value="">-- Pilih anggota --</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan peringatan..." rows={3}
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 resize-none" />
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Kirim Peringatan
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Riwayat Peringatan ({warnings.length})</h3>
        {warningsLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : warnings.length === 0 ? (
          <p className="text-sm text-[#8c8c8e] text-center py-6">Belum ada peringatan yang dikirim.</p>
        ) : warnings.map((w) => (
          <div key={w.id} className="rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[#fafafa]">Kepada: {w.member_name}</p>
              <span className="text-[10px] text-[#8c8c8e]">{w.created_at ? new Date(w.created_at).toLocaleString('id-ID') : ''}</span>
            </div>
            <p className="text-xs text-[#8c8c8e]">{w.issue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
