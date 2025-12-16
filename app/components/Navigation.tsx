"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact Us", href: "#contact" },
  { name: "About Us", href: "#about" },
];

export function Navigation() {
  const [active, setActive] = useState("Home");
  const [open, setOpen] = useState(false);

  const linkClasses = useMemo(
    () =>
      "relative px-3 py-2 text-sm font-semibold transition-colors duration-300 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
    []
  );

  const activePillClasses =
    "absolute inset-x-2 -bottom-0.5 h-1 rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]";

  const renderLinks = (direction: "row" | "col") => (
    <div
      className={
        direction === "row"
          ? "hidden items-center gap-1 lg:flex"
          : "mt-4 flex flex-col gap-2 lg:hidden"
      }
    >
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => {
            setActive(item.name);
            setOpen(false);
          }}
          className={linkClasses}
        >
          <span className="relative flex items-center justify-center">
            {item.name}
            {active === item.name && <span className={activePillClasses} />}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#84CC16] to-[#BEF264] text-slate-900 shadow-lg shadow-lime-200/40 ring-1 ring-lime-200/60 dark:shadow-lime-900/30">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M5 16h14l-1.5-7H6.5L5 16Z" />
              <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
              <path d="M9 11h6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
              EasyPark
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Smart Parking
            </span>
          </div>
        </div>

        {renderLinks("row")}

        <div className="hidden items-center gap-3 lg:flex">
          <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400">
            Login
          </button>
          <button className="rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264] px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-200/60 transition hover:-translate-y-0.5 hover:shadow-lime-300/70 focus:outline-none focus:ring-2 focus:ring-lime-300">
            Sign Up
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-[#111827]/70 text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-lime-400 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 p-4 shadow-lg ring-1 ring-slate-900/60 backdrop-blur-md transition">
            {renderLinks("col")}
            <div className="mt-4 flex flex-col gap-3">
              <button className="w-full rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400">
                Login
              </button>
              <button className="w-full rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264] px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-200/60 transition hover:-translate-y-0.5 hover:shadow-lime-300/70 focus:outline-none focus:ring-2 focus:ring-lime-300">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


