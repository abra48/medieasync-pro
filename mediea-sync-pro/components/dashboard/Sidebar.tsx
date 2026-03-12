'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, User, Menu, X, Settings, Sun, Moon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import ProgressBar from '@/components/ui/ProgressBar';
import RoleBadge from '@/components/ui/RoleBadge';
import ProfileEditModal from '@/components/modals/ProfileEditModal';
import { useTheme } from '@/context/ThemeContext';

export default function Sidebar() {
  const { profile, currentRole, signOut, tasks, members } = useAppContext();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  const sidebarContent = (
    <>
      {/* Back button */}
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-3 text-xs font-semibold text-[#8c8c8e] hover:text-[#fafafa] hover:bg-white/5 transition-colors border-b border-white/5"
        onClick={() => setMobileOpen(false)}
      >
        <ArrowLeft size={14} />
        KEMBALI KE BERANDA
      </Link>

      {/* Profile section */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10b981]/10 p-1.5 overflow-hidden shrink-0">
            <img src="https://image2url.com/r2/default/images/1773277268169-adfa5381-c427-4ffc-9161-e6991fa138ed.png" alt="Mediea Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#fafafa]">Mediea Sync</h2>
            <p className="text-xs text-[#8c8c8e]">Panel Kontrol</p>
          </div>
        </div>

        {/* User Profile from DB — clickable to open edit */}
        <button
          onClick={() => setProfileModalOpen(true)}
          className="w-full mt-4 rounded-xl bg-[#2c2c38] border border-white/10 p-3 text-left hover:border-[#10b981]/30 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-[#10b981]/10 flex items-center justify-center overflow-hidden shrink-0">
              <img src="https://image2url.com/r2/default/images/1773277268169-adfa5381-c427-4ffc-9161-e6991fa138ed.png" alt="Mediea Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#fafafa] truncate">{profile?.name || 'Memuat data...'}</p>
              {profile?.nim && (
                <p className="text-[10px] text-[#10b981]/70 truncate">NIM: {profile.nim}</p>
              )}
              <p className="text-[10px] text-[#8c8c8e] truncate">{profile?.email || ''}</p>
            </div>
            <Settings size={14} className="text-[#8c8c8e] group-hover:text-[#10b981] transition-colors shrink-0" />
          </div>
          <RoleBadge role={currentRole} size="md" />
        </button>
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
            const memberTasks = tasks.filter(t => t.assignee_name === member.name);
            return (
              <div key={member.id} className="rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0">
                    <User size={10} className="text-[#10b981]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-[#fafafa] truncate block">{member.name}</span>
                    {member.nim && (
                      <span className="text-[10px] text-[#8c8c8e]/60 truncate block">NIM: {member.nim}</span>
                    )}
                  </div>
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
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-[#8c8c8e] hover:text-[#10b981] hover:border-[#10b981]/20 hover:bg-[#10b981]/5 transition-colors"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-[#8c8c8e] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={14} />
          Akhiri Sesi
        </button>
        <p className="text-[10px] text-[#8c8c8e]/50 text-center">Mediea Sync Pro v2.0.1</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button — fixed top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#2c2c38] border border-white/10 text-[#fafafa] shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop: always visible. Mobile: slide-in drawer */}
      <aside
        className={`
          fixed md:sticky top-0 h-screen z-50
          w-72 bg-[#20202a] border-r border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg text-[#8c8c8e] hover:text-[#fafafa] hover:bg-white/5 transition-colors z-10"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {sidebarContent}
      </aside>

      {/* Profile Edit Modal */}
      <ProfileEditModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  );
}
