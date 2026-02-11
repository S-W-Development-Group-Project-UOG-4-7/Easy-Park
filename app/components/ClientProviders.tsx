'use client';

import { AuthProvider } from './AuthProvider';
import { AuthModalProvider } from './AuthModalProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>{children}</AuthModalProvider>
    </AuthProvider>
  );
}
