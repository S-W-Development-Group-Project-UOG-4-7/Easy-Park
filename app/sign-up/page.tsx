import { SignUpCard } from "../components/auth/SignUpCard";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-[#0F172A] to-[#020617]">
      <div className="w-full max-w-md">
        <SignUpCard />
      </div>
    </div>
  );
}

