'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Infinity, ArrowLeft, LogOut, User } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import ProgressBar from '@/components/ui/ProgressBar';
import RoleBadge from '@/components/ui/RoleBadge';

export default function Sidebar() {
  const { profile, currentRole, signOut, tasks, members } = useAppContext();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Dynamic progress based on real data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Selesai').length;
  const assignedTasks = tasks.filter(t => t.assignee_name).length;
  const fairness = totalTasks > 0 ? Math.round((assignedTasks / totalTasks) * 100) : 0;
  const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const transparency = Math.min(100, fairness + 10);

  return (
    <aside className="w-72 min-h-screen bg-[#20202a] border-r border-white/5 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
      {/* Back button */}
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-3 text-xs font-semibold text-[#8c8c8e] hover:text-[#fafafa] hover:bg-white/5 transition-colors border-b border-white/5"
      >
        <ArrowLeft size={14} />
        KEMBALI KE BERANDA
      </Link>

      {/* Profile section */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/20">
            <Infinity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#fafafa]">Mediea Sync</h2>
            <p className="text-xs text-[#8c8c8e]">Control Panel</p>
          </div>
        </div>

        {/* User Profile from DB */}
        <div className="mt-4 rounded-xl bg-[#2c2c38] border border-white/10 p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-[#10b981]/10 flex items-center justify-center text-sm font-bold text-[#10b981]">
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#fafafa] truncate">{profile?.name || 'Loading...'}</p>
              <p className="text-[10px] text-[#8c8c8e] truncate">{profile?.email || ''}</p>
            </div>
          </div>
          <RoleBadge role={currentRole} size="md" />
        </div>
      </div>

      {/* Progress indicators */}
      <div className="px-5 py-6 space-y-5">
        <div>
          <h3 className="text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-4">
            Indikator Kemahiran
          </h3>
          <div className="space-y-4">
            <ProgressBar value={fairness} label="⚖️ Keadilan" color="bg-[#10b981]" />
            <ProgressBar value={efficiency} label="⚡ Efisiensi" color="bg-[#3b82f6]" />
            <ProgressBar value={transparency} label="🔍 Transparansi" color="bg-[#f59e0b]" />
          </div>
        </div>
      </div>

      {/* Workload Status Widget */}
      <div className="px-5 pb-5 flex-1">
        <h3 className="text-[10px] font-bold text-[#8c8c8e] uppercase tracking-widest mb-3">
          Status Beban Kerja
        </h3>
        <div className="overflow-y-auto max-h-48 space-y-1.5 custom-scrollbar pr-1">
          {members.map((member) => {
            const memberTasks = tasks.filter(t => t.assignee_id === member.id || t.assignee_name === member.name);
            return (
              <div key={member.id} className="rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0">
                    <User size={10} className="text-[#10b981]" />
                  </div>
                  <span className="text-sm font-semibold text-[#fafafa] truncate">{member.name}</span>
                </div>
                {memberTasks.length > 0 ? (
                  memberTasks.map((task) => (
                    <p key={task.id} className="text-xs text-[#8c8c8e] ml-7 mt-0.5 truncate">
                      ↳ {task.task_name}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-[#8c8c8e]/50 ml-7 mt-0.5 italic">↳ Belum ada tugas</p>
                )}
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="text-xs text-[#8c8c8e]/50 italic text-center py-3">Belum ada anggota</p>
          )}
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-5 py-4 border-t border-white/5 space-y-3">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-[#8c8c8e] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={14} />
          Keluar
        </button>
        <p className="text-[10px] text-[#8c8c8e]/50 text-center">Mediea Sync Pro v2.0.1</p>
      </div>
    </aside>
  );
}
