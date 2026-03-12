'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type JoinStatus = 'checking' | 'joining' | 'success' | 'already_member' | 'error';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [status, setStatus] = useState<JoinStatus>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processJoin = async () => {
      try {
        // Persist ref (Ketua ID) so it survives OAuth redirects
        if (ref) {
          localStorage.setItem('mediea_join_ref', ref);
        }

        // 1. Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Store join intent so ensureMemberProfile() assigns 'anggota' role
          // even after Google OAuth redirects away from /join
          localStorage.setItem('mediea_join_pending', 'true');
          const redirectUrl = `/join${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
          router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
          return;
        }

        // 2. Check if user already has a member profile in members table
        setStatus('joining');
        const { data: existingMember } = await supabase
          .from('members')
          .select('id, invited_by')
          .eq('id', user.id)
          .single();

        // Resolve the Ketua ID who invited this member
        const refId = ref || localStorage.getItem('mediea_join_ref') || null;

        if (existingMember) {
          // If member exists but has no invited_by, update it with the current ref
          if (!existingMember.invited_by && refId) {
            await supabase.from('members').update({ invited_by: refId }).eq('id', user.id);
          }
          setStatus('already_member');
          localStorage.removeItem('mediea_join_ref');
          localStorage.removeItem('mediea_join_pending');
          setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
          return;
        }

        // 3. Also check if user already exists in anggota_link by email
        const { data: existingLinkMember } = await supabase
          .from('anggota_link')
          .select('id')
          .eq('email', user.email || '')
          .maybeSingle();

        if (existingLinkMember) {
          setStatus('already_member');
          localStorage.removeItem('mediea_join_ref');
          localStorage.removeItem('mediea_join_pending');
          setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
          return;
        }

        // 4. INSERT into anggota_link table (NOT members)
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Anggota Baru';

        const { error } = await supabase.from('anggota_link').insert({
          nama: displayName,
          peran: 'Anggota',
          email: user.email || null,
          invited_by: refId,
        });

        // Clean up localStorage
        localStorage.removeItem('mediea_join_ref');
        localStorage.removeItem('mediea_join_pending');

        if (error) {
          setStatus('error');
          setErrorMsg(error.message);
          return;
        }

        // Also create a basic members profile so auth works (with invited_by set)
        const { error: memberError } = await supabase.from('members').insert({
          id: user.id,
          name: displayName,
          email: user.email || null,
          role: 'anggota',
          invited_by: refId,
        });

        if (memberError && memberError.code !== '23505') {
          console.error('Failed to create auth member profile:', memberError.message);
        }

        setStatus('success');
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      } catch (err) {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
      }
    };

    processJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusConfig = {
    checking: {
      icon: <Loader2 size={28} className="animate-spin text-[#10b981]" />,
      title: 'Memeriksa sesi...',
      subtitle: 'Memverifikasi akun Anda.',
    },
    joining: {
      icon: <Loader2 size={28} className="animate-spin text-[#10b981]" />,
      title: 'Mendaftarkan Anda...',
      subtitle: 'Menambahkan profil ke tim.',
    },
    success: {
      icon: <CheckCircle2 size={28} className="text-[#10b981]" />,
      title: 'Berhasil bergabung! 🎉',
      subtitle: 'Mengalihkan ke dasbor...',
    },
    already_member: {
      icon: <CheckCircle2 size={28} className="text-blue-400" />,
      title: 'Anda sudah terdaftar',
      subtitle: 'Mengalihkan ke dasbor...',
    },
    error: {
      icon: <XCircle size={28} className="text-red-400" />,
      title: 'Gagal bergabung',
      subtitle: errorMsg || 'Terjadi kesalahan. Silakan coba lagi.',
    },
  };

  const current = statusConfig[status];

  return (
    <div className="rounded-2xl bg-[#2c2c38] border border-white/5 p-8 shadow-2xl shadow-[#10b981]/5">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10b981]/10 p-1.5 overflow-hidden shrink-0">
          <img src="https://image2url.com/r2/default/images/1773277268169-adfa5381-c427-4ffc-9161-e6991fa138ed.png" alt="Mediea Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <span className="text-2xl font-bold text-[#fafafa]">MEDIEA<span className="text-[#10b981]">.</span></span>
      </div>

      {/* Status */}
      <div className="flex flex-col items-center text-center gap-4">
        {current.icon}
        <div>
          <h1 className="text-lg font-bold text-[#fafafa] mb-1">{current.title}</h1>
          <p className="text-sm text-[#8c8c8e]">{current.subtitle}</p>
        </div>

        {status === 'error' && (
          <button
            onClick={() => router.replace('/login')}
            className="mt-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#34d399] transition-colors"
          >
            Kembali ke Halaman Masuk
          </button>
        )}
      </div>
    </div>
  );
}

function JoinFallback() {
  return (
    <div className="rounded-2xl bg-[#2c2c38] border border-white/5 p-8 shadow-2xl shadow-[#10b981]/5">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10b981]/10 p-1.5 overflow-hidden shrink-0">
          <img src="https://image2url.com/r2/default/images/1773277268169-adfa5381-c427-4ffc-9161-e6991fa138ed.png" alt="Mediea Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <span className="text-2xl font-bold text-[#fafafa]">MEDIEA<span className="text-[#10b981]">.</span></span>
      </div>
      <div className="flex flex-col items-center text-center gap-4">
        <Loader2 size={28} className="animate-spin text-[#10b981]" />
        <p className="text-sm text-[#8c8c8e]">Memuat data...</p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#1e252b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<JoinFallback />}>
          <JoinContent />
        </Suspense>
      </div>
    </div>
  );
}
