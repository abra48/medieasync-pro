'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { Plus, Trash2, ExternalLink, LinkIcon, Loader2 } from 'lucide-react';

export default function BrankasModal() {
  const { currentRole, literatures, literaturesLoading, addLiterature, deleteLiterature } = useAppContext();
  const isSekretaris = currentRole === 'sekretaris';
  const isReadOnly = !isSekretaris;

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setSubmitting(true);
    try {
      await addLiterature(title.trim(), url.trim());
      setTitle('');
      setUrl('');
    } catch (err) {
      console.error('Failed to add literature:', err);
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
            <LinkIcon size={16} className="text-[#10b981]" />Tambah Tautan Baru
          </h3>
          <div className="space-y-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul tautan..."
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50" />
            <div className="flex gap-3">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50" />
              <button type="submit" disabled={submitting}
                className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Tautan Tersimpan ({literatures.length})</h3>
        {literaturesLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : literatures.map((lit) => (
          <div key={lit.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:border-[#10b981]/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b981]/10">
                <ExternalLink size={14} className="text-[#10b981]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#fafafa]">{lit.title}</p>
                <p className="text-xs text-[#10b981]/60 truncate max-w-[200px]">{lit.link_url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={lit.link_url} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-[#8c8c8e] hover:text-[#10b981] hover:bg-[#10b981]/10 transition-colors">
                <ExternalLink size={14} />
              </a>
              {isSekretaris && (
                <button onClick={() => deleteLiterature(lit.id)}
                  className="p-1.5 rounded-lg text-[#8c8c8e] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
