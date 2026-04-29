'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getCurrentSession();
      if (session) {
        // Usuario autenticado
        if (session.role === 'admin') {
          router.push('/admin/db-setup');
        } else {
          router.push('/dashboard');
        }
      } else {
        // No autenticado
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-slate-600">Cargando...</p>
    </div>
  );
}
