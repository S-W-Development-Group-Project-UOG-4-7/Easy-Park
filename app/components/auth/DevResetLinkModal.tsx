'use client';

import { useState } from 'react';

type DevResetLinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resetUrl: string;
};

export function DevResetLinkModal({ isOpen, onClose, resetUrl }: DevResetLinkModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !resetUrl) return null;

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resetUrl);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy reset link:', error);
      setCopied(false);
    }
  };

  const handleOpenResetPage = () => {
    setCopied(false);
    window.location.href = resetUrl;
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#334155]/50 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-reset-link-title"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#111827]/70 text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          <span className="text-2xl leading-none">×</span>
        </button>

        <h2 id="dev-reset-link-title" className="mb-2 text-2xl font-bold text-[#E5E7EB]">
          Reset Link (DEV)
        </h2>
        <p className="mb-4 text-sm text-[#94A3B8]">Use this link to open the reset password flow in development.</p>

        <a
          href={resetUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-6 block rounded-lg border border-[#334155] bg-[#0B1220] px-3 py-3 text-sm text-[#84CC16] underline break-all hover:text-[#BEF264]"
        >
          {resetUrl}
        </a>

        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-[#84CC16] px-3 py-2 text-sm font-semibold text-[#84CC16] hover:bg-[#84CC16]/10"
          >
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <button
            type="button"
            onClick={handleOpenResetPage}
            className="rounded-lg bg-gradient-to-r from-[#84CC16] to-[#BEF264] px-3 py-2 text-sm font-semibold text-[#0F172A]"
          >
            Open Reset Page
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-[#334155] px-3 py-2 text-sm font-semibold text-[#E5E7EB] hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
