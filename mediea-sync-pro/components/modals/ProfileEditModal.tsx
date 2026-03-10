'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Loader2, Save } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { profile, updateProfile } = useAppContext();
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setNim(profile.nim || '');
      setSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await updateProfile(name.trim(), nim.trim());
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#2c2c38] rounded-2xl border border-[#10b981]/20 shadow-2xl shadow-[#10b981]/5 w-full max-w-md animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-[#fafafa]">Pengaturan Profil</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c8c8e] hover:text-[#fafafa] hover:bg-white/5 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-[#1e252b] border border-white/10 px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">NIM (Nomor Induk Mahasiswa)</label>
            <input
              type="text"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 2201234567"
              className="w-full rounded-xl bg-[#1e252b] border border-white/10 px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">Role Saat Ini</label>
            <div className="mt-1">
              <RoleBadge role={profile?.role || 'anggota'} size="md" />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              success
                ? 'bg-green-500 text-white'
                : 'bg-[#10b981] text-black hover:bg-[#34d399]'
            }`}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : success ? (
              '✓ Tersimpan!'
            ) : (
              <><Save size={16} /> Simpan Perubahan</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
