'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Infinity, Loader2, CheckCircle2, XCircle } from 'lucide-react';

type JoinStatus = 'checking' | 'joining' | 'success' | 'already_member' | 'error';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const [status, setStatus] = useState<JoinStatus>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processJoin = async () => {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Store join intent so ensureMemberProfile() assigns 'anggota' role
        // even after Google OAuth redirects away from /join
        localStorage.setItem('mediea_join_pending', 'true');
        const redirectUrl = `/join${code ? `?code=${encodeURIComponent(code)}` : ''}`;
        router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      // 2. Check if user already has a member profile
      setStatus('joining');
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingMember) {
        // Already a member, just redirect
        setStatus('already_member');
        setTimeout(() => router.replace('/dashboard'), 1500);
        return;
      }

      // 3. Insert new member with default role 'anggota'
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Anggota Baru';

      const { error } = await supabase.from('members').insert({
        id: user.id,
        name: displayName,
        email: user.email || null,
        role: 'anggota',
      });

      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }

      setStatus('success');
      setTimeout(() => router.replace('/dashboard'), 1500);
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
      subtitle: 'Mengalihkan ke dashboard...',
    },
    already_member: {
      icon: <CheckCircle2 size={28} className="text-blue-400" />,
      title: 'Anda sudah terdaftar',
      subtitle: 'Mengalihkan ke dashboard...',
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
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/20">
          <Infinity className="h-6 w-6 text-white" />
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
            Kembali ke Login
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
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/20">
          <Infinity className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-[#fafafa]">MEDIEA<span className="text-[#10b981]">.</span></span>
      </div>
      <div className="flex flex-col items-center text-center gap-4">
        <Loader2 size={28} className="animate-spin text-[#10b981]" />
        <p className="text-sm text-[#8c8c8e]">Memuat...</p>
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
