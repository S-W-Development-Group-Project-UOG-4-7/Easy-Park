import Link from 'next/link';
import { SignUpCard } from '../components/auth/SignUpCard';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-[#0F172A] to-[#020617] px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-300 transition hover:text-lime-300"
        >
          Back to home
        </Link>
        <SignUpCard />
      </div>
    </main>
  );
}
