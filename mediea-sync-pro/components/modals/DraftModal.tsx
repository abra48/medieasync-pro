'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { FileText, Download, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Task } from '@/lib/types';

export default function DraftModal() {
  const { currentRole, tasks, tasksLoading } = useAppContext();
  const isSekretaris = currentRole === 'sekretaris';
  const isReadOnly = !isSekretaris;

  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfTasks, setPdfTasks] = useState<Task[]>([]);

  // Filter completed tasks with PDF file_urls
  useEffect(() => {
    const completed = tasks.filter(
      (t) =>
        t.status === 'Selesai' &&
        t.file_url &&
        t.file_url.trim() !== '' &&
        t.file_url.toLowerCase().endsWith('.pdf')
    );
    setPdfTasks(completed);
  }, [tasks]);

  const handleMergePDFs = async () => {
    if (pdfTasks.length === 0) return;
    setMerging(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const task of pdfTasks) {
        try {
          const response = await fetch(task.file_url!);
          if (!response.ok) throw new Error(`Gagal mengunduh: ${task.task_name}`);
          const pdfBytes = await response.arrayBuffer();
          const sourcePdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (err) {
          console.error(`Failed to process PDF for task "${task.task_name}":`, err);
          throw new Error(`Gagal memproses PDF dari tugas "${task.task_name}": ${err instanceof Error ? err.message : 'Kesalahan tidak diketahui'}`);
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Kompilasi_Naskah_Mediea.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF merge failed:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menggabungkan PDF.';
      setError(msg);
      alert('Gagal menggabungkan PDF: ' + msg);
    } finally {
      setMerging(false);
    }
  };

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      {/* PDF Task List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">
          Tugas Selesai dengan File PDF ({pdfTasks.length})
        </h3>

        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-[#10b981]" />
          </div>
        ) : pdfTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText size={32} className="text-[#8c8c8e]/40 mb-3" />
            <p className="text-sm text-[#8c8c8e]">
              Belum ada tugas selesai dengan file PDF.
            </p>
            <p className="text-xs text-[#8c8c8e]/60 mt-1">
              Tugas yang berstatus &quot;Selesai&quot; dengan file .pdf akan muncul di sini.
            </p>
          </div>
        ) : (
          <>
            {pdfTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3"
              >
                <FileCheck size={16} className="text-[#10b981] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#fafafa] truncate">
                    {task.task_name}
                  </p>
                  <p className="text-[10px] text-[#8c8c8e]">
                    {task.assignee_name}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Merge button - only for sekretaris */}
      {isSekretaris && pdfTasks.length > 0 && (
        <button
          onClick={handleMergePDFs}
          disabled={merging}
          className="mt-6 w-full rounded-xl bg-[#10b981] px-4 py-3 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {merging ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menggabungkan PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Gabungkan & Unduh PDF ({pdfTasks.length} file)
            </>
          )}
        </button>
      )}
    </div>
  );
}
