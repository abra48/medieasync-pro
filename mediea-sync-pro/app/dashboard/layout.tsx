'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppProvider, useAppContext } from '@/context/AppContext';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppContext();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // Fail-safe: force loading=false after 3 seconds to prevent infinite loading
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const isReady = !loading || timedOut;
    if (isReady && !user) {
      router.push('/login');
    }
  }, [user, loading, timedOut, router]);

  // Show loading only if still within timeout window
  if (loading && !timedOut) {
    return (
      <div className="min-h-screen bg-[#1e252b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />
          <p className="text-sm text-[#8c8c8e]">Memuat dasbor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthGuard>{children}</AuthGuard>
    </AppProvider>
  );
}
