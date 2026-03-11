import Link from 'next/link';
import { Infinity, ArrowRight, Zap, Users, BarChart3, Shield, Menu, Scale, Clock, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1e252b]">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#1e252b]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10b981]/10">
                <Infinity className="h-5 w-5 text-[#10b981]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#fafafa]">
                MEDIEA<span className="text-[#10b981]">.</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-[#8c8c8e] hover:text-[#fafafa] transition-colors">Fitur</a>
              <a href="#about" className="text-sm text-[#8c8c8e] hover:text-[#fafafa] transition-colors">Tentang</a>
              <a href="#contact" className="text-sm text-[#8c8c8e] hover:text-[#fafafa] transition-colors">Kontak</a>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#34d399] transition-colors"
              >
                Akses Demo
                <ArrowRight size={14} />
              </Link>
            </div>
            <button className="md:hidden p-2 text-[#8c8c8e]">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#10b981]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#10b981]/3 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/5 px-4 py-1.5 mb-6">
                <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs font-medium text-[#10b981]">Platform Kolaborasi Akademik #1</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#fafafa] mb-6">
                Kami mengaktifkan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#34d399]">
                  kolaborasi akademik
                </span>{' '}
                dengan teknologi cerdas.
              </h1>

              <p className="text-lg text-[#8c8c8e] mb-8 leading-relaxed max-w-lg">
                Satu dashboard untuk mengelola tim, tugas, keuangan, dan dokumen kelas Anda — transparan, efisien, dan adil.
              </p>

              {/* Role Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/5 px-4 py-2 text-sm font-medium text-[#10b981]">
                  👑 Ketua Kelas
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/5 px-4 py-2 text-sm font-medium text-[#10b981]">
                  ✒️ Sekretaris Kelas
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/5 px-4 py-2 text-sm font-medium text-[#10b981]">
                  👛 Bendahara Kelas
                </span>
              </div>

              <Link
                href="/dashboard"
                className="shimmer-btn inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold text-black shadow-lg shadow-[#10b981]/25 hover:shadow-[#10b981]/40 transition-shadow pulse-glow"
              >
                Masuk ke Dasbor
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Right - Visual Mockups */}
            <div className="relative animate-fade-in-up-delay-2 hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {/* Mobile App Mockup */}
                <div className="col-span-1 row-span-2 rounded-2xl bg-[#a7f3d0] p-5 shadow-xl">
                  <div className="rounded-xl bg-white/80 p-3 mb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-[#10b981]/20" />
                      <div>
                        <div className="h-2.5 w-20 rounded bg-[#2c2c38]/30" />
                        <div className="h-2 w-14 rounded bg-[#2c2c38]/15 mt-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-[#10b981]/20" />
                      <div className="h-3 w-3/4 rounded bg-[#10b981]/15" />
                      <div className="h-3 w-5/6 rounded bg-[#10b981]/10" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-2.5 w-16 rounded bg-[#2c2c38]/30" />
                      <div className="h-5 w-5 rounded-full bg-[#10b981]/30" />
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#10b981]/20">
                      <div className="h-full w-2/3 rounded-full bg-[#10b981]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 rounded-lg bg-white/50 flex items-center justify-center">
                      <Users size={14} className="text-[#10b981]/60" />
                    </div>
                    <div className="h-10 rounded-lg bg-white/50 flex items-center justify-center">
                      <BarChart3 size={14} className="text-[#10b981]/60" />
                    </div>
                    <div className="h-10 rounded-lg bg-white/50 flex items-center justify-center">
                      <Shield size={14} className="text-[#10b981]/60" />
                    </div>
                  </div>
                </div>

                {/* Org Chart Mockup */}
                <div className="rounded-2xl bg-[#2c2c38] border border-white/5 p-5 shadow-xl">
                  <div className="text-xs font-semibold text-[#8c8c8e] mb-4 uppercase tracking-wider">Struktur Organisasi</div>
                  <div className="flex flex-col items-center">
                    {/* Ketua */}
                    <div className="flex items-center gap-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-2 mb-1">
                      <span className="text-xs">👑</span>
                      <span className="text-xs font-semibold text-[#10b981]">Ketua</span>
                    </div>
                    {/* Vertical line */}
                    <div className="w-px h-4 bg-[#10b981]/30" />
                    {/* Horizontal connector */}
                    <div className="w-32 h-px bg-[#10b981]/30" />
                    {/* Children */}
                    <div className="flex gap-4 mt-1">
                      <div className="flex flex-col items-center">
                        <div className="w-px h-3 bg-[#10b981]/30" />
                        <div className="flex items-center gap-1 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5">
                          <span className="text-[10px]">✒️</span>
                          <span className="text-[10px] font-semibold text-blue-400">Sekretaris</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-px h-3 bg-[#10b981]/30" />
                        <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5">
                          <span className="text-[10px]">👛</span>
                          <span className="text-[10px] font-semibold text-amber-400">Bendahara</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Dashboard Mockup */}
                <div className="rounded-2xl bg-[#ecfdf5] p-5 shadow-xl">
                  <div className="text-xs font-semibold text-[#2c2c38]/60 mb-3 uppercase tracking-wider">Dasbor</div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-2 h-20 mb-3">
                    <div className="flex-1 bg-[#10b981]/80 rounded-t-sm animate-bar" style={{ height: '60%' }} />
                    <div className="flex-1 bg-[#10b981]/60 rounded-t-sm animate-bar" style={{ height: '80%' }} />
                    <div className="flex-1 bg-[#10b981]/80 rounded-t-sm animate-bar" style={{ height: '45%' }} />
                    <div className="flex-1 bg-[#10b981] rounded-t-sm animate-bar" style={{ height: '100%' }} />
                    <div className="flex-1 bg-[#10b981]/70 rounded-t-sm animate-bar" style={{ height: '70%' }} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-[#10b981]/10 p-2 text-center">
                      <div className="text-sm font-bold text-[#10b981]">85%</div>
                      <div className="text-[9px] text-[#2c2c38]/50">Progres</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-[#10b981]/10 p-2 text-center">
                      <div className="text-sm font-bold text-[#10b981]">12</div>
                      <div className="text-[9px] text-[#2c2c38]/50">Tugas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Platform - Value Proposition Section */}
      <section id="about" className="bg-[#20202a] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-5">Apa itu Mediea Sync?</h2>
            <p className="text-[#8c8c8e] max-w-2xl mx-auto leading-relaxed">
              Mediea Sync adalah inovasi Micro-SaaS di bawah ekosistem Mediea, dirancang khusus sebagai
              &lsquo;Asisten Digital Pengurus Kelas/Kelompok&rsquo; untuk memanajemen tugas akademik secara cerdas,
              transparan, dan berkeadilan tanpa membebani biaya server bulanan.
            </p>
          </div>

          {/* 3-Column Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group rounded-2xl bg-[#191923] border border-white/5 p-6 hover:border-[#10b981]/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981] mb-5 group-hover:scale-110 transition-transform">
                <Scale size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#fafafa] mb-2">Keadilan Akademik</h3>
              <p className="text-sm text-[#8c8c8e] leading-relaxed">
                Membasmi budaya &lsquo;numpang nama&rsquo; dengan memberikan bukti autentik berupa data kontribusi nyata ke dosen pengampu.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl bg-[#191923] border border-white/5 p-6 hover:border-[#10b981]/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981] mb-5 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#fafafa] mb-2">Efisiensi Waktu Pengurus</h3>
              <p className="text-sm text-[#8c8c8e] leading-relaxed">
                Memangkas waktu berjam-jam yang biasanya habis untuk menagih tugas, uang kas, dan menyatukan format file makalah.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl bg-[#191923] border border-white/5 p-6 hover:border-[#10b981]/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981] mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#fafafa] mb-2">Manajemen Konflik</h3>
              <p className="text-sm text-[#8c8c8e] leading-relaxed">
                Mencegah pertengkaran di grup WhatsApp karena semua aturan main, batas waktu, dan teguran dilakukan secara objektif oleh sistem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-white/5 bg-[#20202a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#fafafa] mb-4">Fitur Unggulan</h2>
            <p className="text-[#8c8c8e] max-w-2xl mx-auto">Semua yang dibutuhkan untuk mengelola organisasi kelas dalam satu platform terpadu.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users size={24} />, title: 'Manajemen Anggota', desc: 'Kelola struktur dan data tim dengan mudah.' },
              { icon: <Zap size={24} />, title: 'Delegasi Cerdas', desc: 'Alokasi tugas secara otomatis dan transparan.' },
              { icon: <BarChart3 size={24} />, title: 'Pantau Waktu Nyata', desc: 'Dasbor progres yang senantiasa mutakhir.' },
              { icon: <Shield size={24} />, title: 'Akses Terkontrol', desc: 'RBAC untuk keamanan data organisasi.' },
            ].map((f, i) => (
              <div key={i} className="group rounded-2xl border border-white/5 bg-[#2c2c38] p-6 hover:border-[#10b981]/20 hover:bg-[#2c2c38]/80 transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981] mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-[#fafafa] mb-2">{f.title}</h3>
                <p className="text-sm text-[#8c8c8e] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#1e252b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#10b981]/10">
                <Infinity className="h-4 w-4 text-[#10b981]" />
              </div>
              <span className="text-sm font-bold text-[#fafafa]">MEDIEA<span className="text-[#10b981]">.</span></span>
            </div>
            <p className="text-xs text-[#8c8c8e]">© 2026 Mediea Sync Pro. Kolaborasi akademik tanpa batas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
