import Link from 'next/link';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-[#F3F4F6] to-[#E5E7EB] dark:from-[#0F172A] dark:via-[#0A0F1C] dark:to-[#020617] transition-colors duration-300">
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-lime-400 via-lime-300 to-lime-400 bg-clip-text text-transparent animate-pulse">
              EasyPark
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              Your Smart Parking Solution
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Book your parking slots online with ease. Choose from EV slots, Car Wash slots, or Normal parking spaces.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/customer/view-bookings"
              className="px-8 py-4 bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Book Now →
            </Link>
            <Link
              href="/customer/my-bookings"
              className="px-8 py-4 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-slate-600"
            >
              My Bookings
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-3xl mb-3">🚗</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Easy Booking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Quick and simple slot selection process</p>
            </div>
            <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">EV Charging</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Dedicated slots for electric vehicles</p>
            </div>
            <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-3xl mb-3">🧼</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Car Wash</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Premium slots with car wash service</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
