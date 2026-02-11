'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider'; 
import { ArrowRight, Plus, Calendar, Settings, Car, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function CustomerDashboard() {
  const { user, loading, refreshUser } = useAuth();
  const [now, setNow] = useState<Date | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatches from Date() while still rendering instantly.
    setNow(new Date());
  }, []);

  useEffect(() => {
    if (authChecked) return;
    if (user) {
      setAuthChecked(true);
      return;
    }
    if (!loading) {
      refreshUser().finally(() => setAuthChecked(true));
    }
  }, [authChecked, loading, refreshUser, user]);

  const greeting = useMemo(() => {
    if (!now) return 'Welcome';
    const hour = now.getHours();
    return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  }, [now]);

  const todayText = useMemo(() => {
    if (!now) return '';
    return now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [now]);

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden flex flex-col">
      
      {/* --- VIDEO BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950/70 z-10" /> 
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 z-10" />
        
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          {/* ✅ FIXED: Added '/' at the start to reference public folder */}
          <source src="/dashboard-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl"
        >
          {/* Greeting Section */}
          <div className="mb-12">
            <h2 className="text-lime-400 font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              EasyPark
            </h2>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              {greeting}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {user?.fullName?.split(' ')[0] || (loading ? 'Loading...' : 'Driver')}
              </span>
            </h1>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Book a Slot */}
            <Link href="/customer/view-bookings" prefetch className="group">
              <div className="h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-400/50 backdrop-blur-md p-8 rounded-3xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-lime-900/20">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MapPin className="w-32 h-32 text-lime-400" />
                </div>
                
                <div className="w-14 h-14 rounded-2xl bg-lime-400 flex items-center justify-center mb-6 text-slate-900 group-hover:scale-110 transition-transform shadow-lg shadow-lime-400/20">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Book a Slot</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Find a nearby hub and reserve your parking spot instantly with advance payment.
                </p>
                
                <div className="flex items-center gap-2 text-lime-400 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all absolute bottom-8 left-8">
                  Start Now <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* 2. My Bookings */}
            <Link href="/customer/my-bookings" prefetch className="group">
              <div className="h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 backdrop-blur-md p-8 rounded-3xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-blue-900/20">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Calendar className="w-32 h-32 text-blue-400" />
                </div>

                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">My Bookings</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Track active reservations, view history, and manage cancellations.
                </p>
                
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all absolute bottom-8 left-8">
                  View History <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* 3. My Profile */}
            <Link href="/customer/profile" prefetch className="group">
              <div className="h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 backdrop-blur-md p-8 rounded-3xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-emerald-900/20">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Car className="w-32 h-32 text-emerald-400" />
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                  <Settings className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">My Profile</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Update vehicle details, personal information, and account settings.
                </p>
                
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all absolute bottom-8 left-8">
                  Manage <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

          </div>
        </motion.div>
      </div>

      {/* Footer Stats Bar */}
      <div className="relative z-20 border-t border-white/5 bg-slate-950/30 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Operational
          </div>
          <div className="hidden sm:block">EasyPark Sri Lanka © {new Date().getFullYear()}</div>
          <div className="text-slate-400 font-bold" suppressHydrationWarning>
            {todayText}
          </div>
        </div>
      </div>

    </div>
  );
}
