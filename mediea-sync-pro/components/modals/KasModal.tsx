'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { Plus, Trash2, Receipt, Loader2, RefreshCw, Check } from 'lucide-react';

export default function KasModal() {
  const {
    currentRole, finances, financesLoading, members,
    addFinance, deleteFinance,
    kasPayments, kasPaymentsLoading, toggleKasPayment, syncKasPayments,
  } = useAppContext();
  const isBendahara = currentRole === 'bendahara';

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Real calculation from DB data
  const totalBiaya = finances.reduce((sum, f) => sum + f.price, 0);
  const totalMembers = members.length || 1;
  const perPerson = Math.ceil(totalBiaya / totalMembers);

  // Real paid tracking from DB
  const paidCount = kasPayments.filter(kp => kp.paid).length;
  const totalPaymentMembers = kasPayments.length || totalMembers;

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

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncKasPayments();
    } finally {
      setSyncing(false);
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
          <p className="text-lg font-bold text-[#fafafa]">{paidCount}/{totalPaymentMembers}</p>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#fafafa]">Progres Pembayaran</h3>
          {isBendahara && (
            <button onClick={handleSync} disabled={syncing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 text-xs font-semibold text-[#10b981] hover:bg-[#10b981]/20 transition-colors disabled:opacity-50">
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Sinkronkan Anggota
            </button>
          )}
        </div>
        <ProgressBar value={paidCount} max={totalPaymentMembers} />

        {/* Member payment list */}
        {kasPaymentsLoading ? (
          <div className="flex justify-center py-4 mt-3">
            <Loader2 size={16} className="animate-spin text-[#10b981]" />
          </div>
        ) : kasPayments.length > 0 ? (
          <div className="mt-4 space-y-2">
            {kasPayments.map((kp) => (
              <div key={kp.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2.5">
                <button
                  onClick={() => isBendahara && toggleKasPayment(kp.id, !kp.paid)}
                  disabled={!isBendahara}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    kp.paid
                      ? 'bg-[#10b981] border-[#10b981]'
                      : 'border-[#8c8c8e]/30 hover:border-[#10b981]/50'
                  } ${!isBendahara ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {kp.paid && <Check size={12} className="text-black" />}
                </button>
                <span className={`text-sm flex-1 ${kp.paid ? 'text-[#fafafa]' : 'text-[#8c8c8e]'}`}>
                  {kp.member_name}
                </span>
                {kp.paid && (
                  <span className="text-[10px] font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
                    Lunas
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8c8c8e] text-center py-4 mt-2">
            {isBendahara
              ? 'Klik "Sinkronkan Anggota" untuk memuat daftar pembayaran.'
              : 'Belum ada data pembayaran.'}
          </p>
        )}
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
