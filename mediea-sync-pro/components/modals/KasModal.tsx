'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { Plus, Trash2, Receipt, UserCheck, Loader2 } from 'lucide-react';

export default function KasModal() {
  const { currentRole, finances, financesLoading, members, addFinance, deleteFinance } = useAppContext();
  const isBendahara = currentRole === 'bendahara';

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real calculation from DB data
  const totalBiaya = finances.reduce((sum, f) => sum + f.price, 0);
  const totalMembers = members.length || 1;
  const perPerson = Math.ceil(totalBiaya / totalMembers);

  // Simple paid tracking (could be a DB column in future)
  const [paidCount, setPaidCount] = useState(0);
  const incrementPaid = () => setPaidCount(prev => Math.min(prev + 1, totalMembers));

  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !price) return;
    setSubmitting(true);
    try {
      await addFinance(itemName.trim(), parseInt(price));
      setItemName('');
      setPrice('');
    } catch (err) {
      console.error('Failed to add finance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {isBendahara && (
        <form onSubmit={handleAddFinance} className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <Receipt size={16} className="text-[#10b981]" />Tambah Nota Pengeluaran
          </h3>
          <div className="space-y-3">
            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)}
              placeholder="Nama produk / pengeluaran..."
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50" />
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="Harga (Rp)..."
              className="w-full rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50" />
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50 flex items-center gap-2">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
              Tambah
            </button>
          </div>
        </form>
      )}

      {/* Finance summary - visible to all */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
          <p className="text-xs text-[#8c8c8e] mb-1">Total Biaya</p>
          <p className="text-lg font-bold text-[#fafafa]">Rp {totalBiaya.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
          <p className="text-xs text-[#8c8c8e] mb-1">Per Orang ({totalMembers} anggota)</p>
          <p className="text-lg font-bold text-[#10b981]">Rp {perPerson.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
          <p className="text-xs text-[#8c8c8e] mb-1">Sudah Bayar</p>
          <p className="text-lg font-bold text-[#fafafa]">{paidCount}/{totalMembers}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#fafafa]">Progres Pembayaran</h3>
          {isBendahara && paidCount < totalMembers && (
            <button onClick={incrementPaid}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 text-xs font-semibold text-[#10b981] hover:bg-[#10b981]/20 transition-colors">
              <UserCheck size={12} />+1 Anggota Bayar
            </button>
          )}
        </div>
        <ProgressBar value={paidCount} max={totalMembers} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">Rincian Pengeluaran ({finances.length})</h3>
        {financesLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : finances.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <p className="text-sm font-medium text-[#fafafa]">{f.item_name}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#10b981]">Rp {f.price.toLocaleString('id-ID')}</span>
              {isBendahara && (
                <button onClick={() => deleteFinance(f.id)}
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
