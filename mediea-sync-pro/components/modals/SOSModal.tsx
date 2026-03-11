'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Siren, Send, AlertTriangle, Loader2 } from 'lucide-react';

export default function SOSModal() {
  const { currentRole, profile, sosMessages, sosLoading, addSOS } = useAppContext();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    const fromName = profile?.name || currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
    await addSOS(fromName, message.trim());
    setMessage('');
    setSubmitting(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
        <AlertTriangle size={18} className="text-red-400 shrink-0" />
        <p className="text-sm text-red-400">Gunakan fitur ini untuk mengajukan permintaan bantuan teknis kepada seluruh tim.</p>
      </div>

      <form onSubmit={handleSend} className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
        <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
          <Siren size={16} className="text-red-400" />Ajukan Permintaan Dukungan
        </h3>
        <div className="space-y-3">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Jelaskan situasi yang memerlukan bantuan..." rows={3}
            className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-red-500/50 resize-none" />
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            🚨 Kirim Permintaan Dukungan
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Riwayat Dukungan ({sosMessages.length})</h3>
        {sosLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : sosMessages.length === 0 ? (
          <p className="text-sm text-[#8c8c8e] text-center py-6">Belum ada permintaan dukungan.</p>
        ) : sosMessages.map((s) => (
          <div key={s.id} className="rounded-xl bg-red-500/5 border border-red-500/10 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[#fafafa]">Dari: {s.from_name}</p>
              <span className="text-[10px] text-[#8c8c8e]">{s.created_at ? new Date(s.created_at).toLocaleString('id-ID') : ''}</span>
            </div>
            <p className="text-xs text-[#8c8c8e]">{s.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
