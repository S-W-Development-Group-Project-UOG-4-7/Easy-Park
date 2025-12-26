'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/customer/view-bookings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Redirecting...</p>
      </div>
    </div>
  );
}



