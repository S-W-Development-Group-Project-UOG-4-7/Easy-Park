'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SignInCard } from './auth/SignInCard';
import { SignUpCard } from './auth/SignUpCard';

type AuthModalMode = 'sign-in' | 'sign-up';

type AuthModalContextValue = {
  openAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
  isOpen: boolean;
  mode: AuthModalMode;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const value = useContext(AuthModalContext);
  if (!value) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return value;
}

function AuthModal({ mode, onClose }: { mode: AuthModalMode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#111827]/70 text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          <span className="text-2xl leading-none">×</span>
        </button>
        {mode === 'sign-in' ? <SignInCard /> : <SignUpCard />}
      </div>
    </div>
  );
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>('sign-in');

  const openAuthModal = (nextMode: AuthModalMode) => {
    setMode(nextMode);
    setIsOpen(true);
  };

  const closeAuthModal = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const value = useMemo<AuthModalContextValue>(
    () => ({ openAuthModal, closeAuthModal, isOpen, mode }),
    [isOpen, mode]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {isOpen ? <AuthModal mode={mode} onClose={closeAuthModal} /> : null}
    </AuthModalContext.Provider>
  );
}
