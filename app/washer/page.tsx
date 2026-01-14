"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Car, MapPin, Clock } from "lucide-react";

export default function WasherDashboard() {
  const router = useRouter();
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [acceptedCars, setAcceptedCars] = useState<Set<string>>(new Set());
  const [finishedCars, setFinishedCars] = useState<Set<string>>(new Set());
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const openSignOutModal = () => setShowSignOutModal(true);
  const closeSignOutModal = () => setShowSignOutModal(false);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setShowSignOutModal(false);

    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    if (!showSignOutModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSignOutModal]);

  const cars = [
    { id: "EP-1023", location: "Colombo 07", time: "10:30 AM", type: "Sedan" },
    { id: "EP-1041", location: "Colombo 03", time: "11:15 AM", type: "SUV" },
    { id: "EP-1088", location: "Malabe", time: "12:00 PM", type: "Hatchback" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0b1220] to-[#05080f] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-lime-400">EasyPark</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">Washer Dashboard</span>
          <button
            type="button"
            onClick={openSignOutModal}
            disabled={signingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/50 bg-red-500/10 text-red-400 font-medium text-sm transition hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign Out"
          >
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </header>

      {/* Page Title */}
      <section className="text-center mt-14">
        <h2 className="text-4xl font-bold">Available Cars for Wash</h2>
        <p className="text-white/60 mt-3">
          View parked cars, accept a job, and confirm once washing is completed.
        </p>
      </section>

      {/* Cars Grid */}
      <section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className={`rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur transition ${
              selectedCar === car.id ? "ring-2 ring-lime-400" : "hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Car className="text-lime-400" />
              <h3 className="font-semibold text-lg">Car #{car.id}</h3>
            </div>

            <div className="space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-2"><MapPin size={16} /> {car.location}</p>
              <p className="flex items-center gap-2"><Clock size={16} /> {car.time}</p>
              <p>Type: {car.type}</p>
            </div>

            <button
              onClick={() => {
              setSelectedCar(car.id);
              if (acceptedCars.has(car.id)) {
                setFinishedCars(prev => new Set(prev).add(car.id));
              } else {
                setAcceptedCars(prev => new Set(prev).add(car.id));
              }
            }}
              className="mt-6 w-full py-2 rounded-xl bg-lime-500 text-black font-semibold hover:bg-lime-400"
            >
              {finishedCars.has(car.id) ? "Finished" : acceptedCars.has(car.id) ? "Done" : "Accept for Washing"}
            </button>
          </div>
        ))}
      </section>

      
      {/* Footer spacing */}
      <div className="h-24"></div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeSignOutModal}
            />

            {/* Modal */}
            <div className="relative z-10000 mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-500/40">
                <svg
                  className="h-7 w-7 text-amber-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-white">Sign Out</h3>
              <p className="mb-6 text-center text-white/60">
                Are you sure you want to sign out? You will need to sign in again to access your account.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeSignOutModal}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex-1 rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/30 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
