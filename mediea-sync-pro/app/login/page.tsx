'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';


function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nama wajib diisi.'); return; }
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('members').insert({
        id: data.user.id,
        name: name.trim(),
        email,
        role: 'ketua',
      });
      if (profileError) {
        setError('Akun dibuat, namun gagal menyimpan profil: ' + profileError.message);
        setLoading(false);
        return;
      }
    }
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-[#1e252b] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#8c8c8e] hover:text-[#fafafa] mb-8 transition-colors">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        <div className="rounded-2xl bg-[#2c2c38] border border-white/5 p-8 shadow-2xl shadow-[#10b981]/5">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10b981]/10 p-1.5 overflow-hidden shrink-0">
              <img src="https://image2url.com/r2/default/images/1773277268169-adfa5381-c427-4ffc-9161-e6991fa138ed.png" alt="Mediea Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span className="text-2xl font-bold text-[#fafafa]">MEDIEA<span className="text-[#10b981]">.</span></span>
          </div>

          <h1 className="text-xl font-bold text-[#fafafa] text-center mb-1">
            {isSignUp ? 'Buat Akun Baru' : 'Masuk ke Dashboard'}
          </h1>
          <p className="text-sm text-[#8c8c8e] text-center mb-6">
            {isSignUp ? 'Daftarkan diri Anda untuk mulai berkolaborasi.' : 'Gunakan akun Anda untuk mengakses fitur.'}
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda..."
                    required
                    className="w-full rounded-xl bg-[#1e252b] border border-white/10 px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/20 transition-colors"
                  />
                </div>

              </>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full rounded-xl bg-[#1e252b] border border-white/10 px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#8c8c8e] uppercase tracking-widest mb-1.5">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl bg-[#1e252b] border border-white/10 px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#8c8c8e]/50 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/20 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#10b981] px-4 py-3 text-sm font-bold text-black hover:bg-[#34d399] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : isSignUp ? (
                <><UserPlus size={16} /> Daftar</>
              ) : (
                <><LogIn size={16} /> Masuk</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-[#8c8c8e] font-medium">atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={async () => {
              setLoading(true);
              setError('');
              // Preserve join intent for Google OAuth redirect
              if (redirectTo.includes('/join')) {
                localStorage.setItem('mediea_join_pending', 'true');
              }
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}${redirectTo}`,
                },
              });
              if (error) {
                setError(error.message);
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1e252b] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Masuk dengan Google
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-[#10b981] hover:text-[#34d399] transition-colors"
            >
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1e252b] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
