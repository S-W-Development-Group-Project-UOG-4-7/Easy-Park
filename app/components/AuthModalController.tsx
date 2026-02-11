'use client';

import React from 'react';
import { AuthModalProvider } from './AuthModalProvider';

export default function AuthModalController({ children }: { children: React.ReactNode }) {
  return <AuthModalProvider>{children}</AuthModalProvider>;
}
