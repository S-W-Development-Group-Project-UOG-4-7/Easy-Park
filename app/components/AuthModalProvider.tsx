'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load heavy auth forms so they don't inflate every page's JS bundle.
const SignInCard = dynamic(() => import('./auth/SignInCard').then((m) => m.SignInCard), {
  ssr: false,
  loading: () => <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-slate-300">Loading...</div>,
});

const SignUpCard = dynamic(() => import('./auth/SignUpCard').then((m) => m.SignUpCard), {
  ssr: false,
  loading: () => <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-slate-300">Loading...</div>,
});

type AuthModalMode = 'sign-in' | 'sign-up';

type AuthModalContextValue = {
  openAuthModal: (mode: AuthModalMode) => void;
  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthModal: () => void;
  isOpen: boolean;
  mode: AuthModalMode;
  showSignIn: boolean;
  showSignUp: boolean;
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
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const openSignIn = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const openSignUp = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const openAuthModal = (nextMode: AuthModalMode) => {
    if (nextMode === 'sign-in') {
      openSignIn();
    } else {
      openSignUp();
    }
  };

  const closeAuthModal = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const isOpen = showSignIn || showSignUp;
  const mode: AuthModalMode = showSignUp ? 'sign-up' : 'sign-in';

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const value = useMemo<AuthModalContextValue>(
    () => ({
      openAuthModal,
      openSignIn,
      openSignUp,
      closeAuthModal,
      isOpen,
      mode,
      showSignIn,
      showSignUp,
    }),
    [isOpen, mode, showSignIn, showSignUp]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {isOpen ? <AuthModal mode={mode} onClose={closeAuthModal} /> : null}
    </AuthModalContext.Provider>
  );
}
