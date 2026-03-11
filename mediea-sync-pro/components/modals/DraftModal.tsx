'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { FileText, Copy } from 'lucide-react';

export default function DraftModal() {
  const { currentRole } = useAppContext();
  const isSekretaris = currentRole === 'sekretaris';
  const isReadOnly = !isSekretaris;

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [drafts, setDrafts] = useState<{ id: string; subject: string; body: string; date: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setDrafts(prev => [...prev, {
      id: Date.now().toString(),
      subject: subject.trim(),
      body: body.trim(),
      date: new Date().toISOString().split('T')[0],
    }]);
    setSubject('');
    setBody('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      {isSekretaris && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <FileText size={16} className="text-[#10b981]" />Buat Naskah Baru
          </h3>
          <div className="space-y-3">
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Subjek surat..."
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="Isi surat..." rows={4}
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 resize-none" />
            <button type="submit" className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors">
              Simpan Naskah
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Naskah Tersimpan ({drafts.length})</h3>
        {drafts.length === 0 && (
          <p className="text-sm text-[#8c8c8e] text-center py-6">Belum ada naskah tersimpan.</p>
        )}
        {drafts.map((draft) => (
          <div key={draft.id} className="rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-[#fafafa]">{draft.subject}</p>
                <p className="text-[10px] text-[#8c8c8e]">{draft.date}</p>
              </div>
              <button onClick={() => handleCopy(`${draft.subject}\n\n${draft.body}`, draft.id)}
                className="p-1.5 rounded-lg text-[#8c8c8e] hover:text-[#10b981] hover:bg-[#10b981]/10 transition-colors">
                <Copy size={14} />
              </button>
            </div>
            <p className="text-xs text-[#8c8c8e] leading-relaxed">{draft.body}</p>
            {copied === draft.id && <p className="text-[10px] text-[#10b981] mt-1">✅ Disalin ke clipboard!</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
