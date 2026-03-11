'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { Plus, Trash2, ScrollText, Loader2 } from 'lucide-react';

export default function PakemModal() {
  const { currentRole, guidelines, guidelinesLoading, addGuideline, deleteGuideline } = useAppContext();
  const isSekretaris = currentRole === 'sekretaris';
  const isReadOnly = !isSekretaris;

  const [newRule, setNewRule] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    setSubmitting(true);
    try {
      await addGuideline(newRule.trim(), newRule.trim());
      setNewRule('');
    } catch (err) {
      console.error('Failed to add guideline:', err);
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
            <ScrollText size={16} className="text-[#10b981]" />Tambah Aturan Baru
          </h3>
          <div className="flex gap-3">
            <input type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)}
              placeholder="Tulis aturan baru..."
              className="flex-1 rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50" />
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Daftar Aturan ({guidelines.length})</h3>
        {guidelinesLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : guidelines.map((g, i) => (
          <div key={g.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981]/10 text-xs font-bold text-[#10b981] shrink-0">{i + 1}</span>
              <p className="text-sm text-[#fafafa]">{g.content}</p>
            </div>
            {isSekretaris && (
              <button onClick={() => deleteGuideline(g.id)}
                className="p-1.5 rounded-lg text-[#8c8c8e] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
