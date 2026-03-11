'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { UserPlus, Trash2, Crown, PenTool, Coins, User, Loader2, Link2, Copy, Check } from 'lucide-react';
import { Role } from '@/lib/types';

const roleIcons: Record<Role, React.ReactNode> = {
  ketua: <Crown size={14} className="text-green-400" />,
  sekretaris: <PenTool size={14} className="text-blue-400" />,
  bendahara: <Coins size={14} className="text-amber-400" />,
  anggota: <User size={14} className="text-purple-400" />,
};

const roleColors: Record<Role, string> = {
  ketua: 'bg-green-500/10 text-green-400 border-green-500/20',
  sekretaris: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  bendahara: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  anggota: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const roleOptions: { value: Role; label: string }[] = [
  { value: 'ketua', label: 'Ketua' },
  { value: 'sekretaris', label: 'Sekretaris' },
  { value: 'bendahara', label: 'Bendahara' },
  { value: 'anggota', label: 'Anggota' },
];

export default function ScanModal() {
  const { currentRole, members, membersLoading, addMember, deleteMember, updateMemberRole } = useAppContext();
  const isReadOnly = currentRole !== 'ketua';
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('anggota');
  const [submitting, setSubmitting] = useState(false);

  // Invite link state
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await addMember(name.trim(), role);
    setName('');
    setRole('anggota');
    setSubmitting(false);
  };

  const generateInviteLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/join?code=mediea-sync-${randomCode}`;
    setInviteLink(link);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.querySelector<HTMLInputElement>('#invite-link-input');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    await updateMemberRole(memberId, newRole);
  };

  return (
    <div>
      <ReadOnlyBanner show={isReadOnly} />

      {!isReadOnly && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <UserPlus size={16} className="text-[#10b981]" />
            Tambah Anggota Baru
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap..."
              className="flex-1 rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#10b981]/50"
            >
              <option value="anggota">Anggota</option>
              <option value="ketua">Ketua</option>
              <option value="sekretaris">Sekretaris</option>
              <option value="bendahara">Bendahara</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors shrink-0 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              Tambah
            </button>
          </div>
        </form>
      )}

      {/* Invite Link Section — Ketua Only */}
      {!isReadOnly && (
        <div className="mb-6 rounded-xl bg-white/5 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-3 flex items-center gap-2">
            <Link2 size={16} className="text-[#10b981]" />
            Buat Tautan Undangan
          </h3>
          <p className="text-xs text-[#8c8c8e] mb-3">
            Buat link undangan agar anggota baru bisa bergabung otomatis.
          </p>
          <button
            onClick={generateInviteLink}
            className="rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2 text-sm font-semibold text-[#10b981] hover:bg-[#10b981]/20 transition-colors flex items-center gap-2 mb-3"
          >
            <Link2 size={14} />
            Buat Tautan Baru
          </button>
          {inviteLink && (
            <div className="flex gap-2">
              <input
                id="invite-link-input"
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 rounded-lg bg-[#1e252b] border border-white/10 px-3 py-2 text-sm text-[#fafafa]/70 focus:outline-none select-all font-mono text-xs"
              />
              <button
                onClick={copyToClipboard}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-white/5 text-[#fafafa] border border-white/10 hover:bg-white/10'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Tersalin!' : 'Salin Tautan'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8c8c8e] uppercase tracking-wider mb-3">
          Daftar Anggota ({members.length})
        </h3>
        {membersLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#10b981]" /></div>
        ) : members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#10b981]/10 flex items-center justify-center text-sm font-bold text-[#10b981]">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#fafafa]">{member.name}</p>
                {member.nim && (
                  <p className="text-[10px] text-[#8c8c8e]/60">NIM: {member.nim}</p>
                )}
                {/* Ketua sees role dropdown, others see badge */}
                {!isReadOnly ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                    className="mt-1 rounded-md bg-[#1e252b] border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#fafafa] focus:outline-none focus:border-[#10b981]/50 cursor-pointer"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 border ${roleColors[member.role]}`}>
                    {roleIcons[member.role]}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                )}
              </div>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => deleteMember(member.id)}
                className="p-1.5 rounded-lg text-[#8c8c8e] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
