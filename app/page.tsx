'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Easy-Park</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Smart Parking Management System
          </p>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Efficiently manage your parking operations with real-time monitoring, automated booking system,
            and comprehensive analytics to optimize your parking facility.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <div className="text-3xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-white mb-2">Parking Management</h3>
            <p className="text-slate-400">Monitor and manage all parking slots</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
            <p className="text-slate-400">Get insights into parking usage</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-white mb-2">Reports</h3>
            <p className="text-slate-400">Generate detailed reports</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-block bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
