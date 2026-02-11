'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Lazy-load heavy auth forms so they don't inflate every page's JS bundle.
const SignInCard = dynamic(() => import('./auth/SignInCard').then((m) => m.SignInCard), {
  ssr: false,
  loading: () => <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-slate-300">Loading...</div>,
});

const SignUpCard = dynamic(() => import('./auth/SignUpCard').then((m) => m.SignUpCard), {
  ssr: false,
  loading: () => <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-slate-300">Loading...</div>,
});

const ForgotPasswordCard = dynamic(
  () => import('./auth/ForgotPasswordCard').then((m) => m.ForgotPasswordCard),
  {
    ssr: false,
    loading: () => <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-slate-300">Loading...</div>,
  }
);

const ResetPasswordCard = dynamic(
  () => import('./auth/ResetPasswordCard').then((m) => m.ResetPasswordCard),
  {
    ssr: false,
    loading: () => <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-slate-300">Loading...</div>,
  }
);

type AuthModalMode = 'sign-in' | 'sign-up' | 'forgot' | 'reset';

type AuthModalContextValue = {
  openAuthModal: (mode: AuthModalMode) => void;
  openSignIn: (options?: { clearToken?: boolean }) => void;
  openSignUp: () => void;
  openForgot: (prefillEmail?: string) => void;
  openReset: (token: string) => void;
  closeAuthModal: () => void;
  isOpen: boolean;
  mode: AuthModalMode | null;
  resetToken: string;
  forgotEmail: string;
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
  const { resetToken, forgotEmail } = useAuthModal();

  const renderContent = () => {
    if (mode === 'sign-in') return <SignInCard />;
    if (mode === 'sign-up') return <SignUpCard />;
    if (mode === 'forgot') return <ForgotPasswordCard initialEmail={forgotEmail} />;
    return <ResetPasswordCard token={resetToken} />;
  };

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
        {renderContent()}
      </div>
    </div>
  );
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tokenFromQuery = String(searchParams.get('token') || '').trim();
  const [mode, setMode] = useState<AuthModalMode | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const removeTokenQueryParam = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has('token')) return;
    params.delete('token');
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  };

  const openSignIn = (options?: { clearToken?: boolean }) => {
    if (options?.clearToken) {
      removeTokenQueryParam();
      setResetToken('');
    }
    setMode('sign-in');
  };

  const openSignUp = () => {
    setMode('sign-up');
  };

  const openForgot = (prefillEmail = '') => {
    setForgotEmail(prefillEmail);
    setMode('forgot');
  };

  const openReset = (token: string) => {
    setResetToken(token);
    setMode('reset');
  };

  const openAuthModal = (nextMode: AuthModalMode) => {
    if (nextMode === 'sign-in') {
      openSignIn();
    } else if (nextMode === 'forgot') {
      openForgot();
    } else if (nextMode === 'reset') {
      openReset(resetToken);
    } else {
      openSignUp();
    }
  };

  const closeAuthModal = () => {
    setMode(null);
  };

  const isOpen = mode !== null;
  const showSignIn = mode === 'sign-in';
  const showSignUp = mode === 'sign-up';

  useEffect(() => {
    if (!tokenFromQuery) return;
    const id = window.setTimeout(() => {
      setResetToken(tokenFromQuery);
      setMode('reset');
    }, 0);
    return () => window.clearTimeout(id);
  }, [tokenFromQuery]);

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

  const value: AuthModalContextValue = {
    openAuthModal,
    openSignIn,
    openSignUp,
    openForgot,
    openReset,
    closeAuthModal,
    isOpen,
    mode,
    resetToken,
    forgotEmail,
    showSignIn,
    showSignUp,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {isOpen && mode ? <AuthModal mode={mode} onClose={closeAuthModal} /> : null}
    </AuthModalContext.Provider>
  );
}
