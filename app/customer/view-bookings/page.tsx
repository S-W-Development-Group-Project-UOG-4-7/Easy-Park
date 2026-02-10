'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../components/AuthProvider';
import PaymentGatewayModal from '../../components/PaymentGatewayModal';
import { 
  Calendar, Clock, MapPin, Zap, Shield, AlertCircle, 
  Loader2, Search, Droplets
} from 'lucide-react';

// --- Interfaces ---
interface Hub {
  id: string;
  name: string;
  address: string;
  city: string;
  pricePerHour: number;
  totalSlots: number;
  availableSlots: number;
  amenities: string[];
  rating?: number;
  openingHours: string;
  contact: string;
}

interface Slot {
  id: string;
  number: string;
  type: 'EV' | 'CAR_WASH' | 'NORMAL';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  pricePerHour: number;
}

interface TimeSlot {
  time: string;
  label: string;
  isPeak: boolean;
}

// --- ✨ NEW: Futuristic Background Component ---
const FuturisticBackground = () => {
  // Generate random stars only on client to avoid hydration mismatch
  const [stars, setStars] = useState<{ top: string; left: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    const starCount = 50;
    const newStars = Array.from({ length: starCount }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      size: Math.random() * 2 + 1, // 1px to 3px
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0a0f] pointer-events-none">
      {/* 1. Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

      {/* 2. Floating Nebula Orbs */}
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-lime-500/10 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ x: [0, -100, 0], y: [0, 50, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px]"
      />

      {/* 3. Twinkling Stars */}
      {stars.map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          className="absolute rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
        />
      ))}
    </div>
  );
};

export default function ViewBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // --- UI State ---
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [selectedHubId, setSelectedHubId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Data State ---
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'NORMAL' | 'EV' | 'CAR_WASH'>('ALL');
  
  // --- Loading & Status ---
  const [loading, setLoading] = useState(false);
  const [loadingHubs, setLoadingHubs] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [selectedHubDetails, setSelectedHubDetails] = useState<Hub | null>(null);

  // --- Constants ---
  const ADVANCE_FEE_PER_SLOT = 150;
  const TODAY = new Date().toISOString().split('T')[0];
  
  const timeSlots: TimeSlot[] = useMemo(() => [
    { time: '06:00', label: '06:00 AM', isPeak: false },
    { time: '07:00', label: '07:00 AM', isPeak: true },
    { time: '08:00', label: '08:00 AM', isPeak: true },
    { time: '09:00', label: '09:00 AM', isPeak: true },
    { time: '10:00', label: '10:00 AM', isPeak: true },
    { time: '11:00', label: '11:00 AM', isPeak: false },
    { time: '12:00', label: '12:00 PM', isPeak: false },
    { time: '13:00', label: '01:00 PM', isPeak: false },
    { time: '14:00', label: '02:00 PM', isPeak: false },
    { time: '15:00', label: '03:00 PM', isPeak: false },
    { time: '16:00', label: '04:00 PM', isPeak: true },
    { time: '17:00', label: '05:00 PM', isPeak: true },
    { time: '18:00', label: '06:00 PM', isPeak: true },
    { time: '19:00', label: '07:00 PM', isPeak: true },
    { time: '20:00', label: '08:00 PM', isPeak: false },
  ], []);

  // --- 1. Fetch Locations ---
  useEffect(() => {
    setMounted(true);
    const fetchHubs = async () => {
      setLoadingHubs(true);
      try {
        const res = await fetch('/api/parking/locations');
        const json = await res.json();
        
        if (json.success) {
          const mappedHubs: Hub[] = json.data.map((h: any) => ({
            id: h.id,
            name: h.name,
            address: h.address || 'Sri Lanka',
            city: h.name.split(' ')[0] || 'City',
            pricePerHour: h.pricePerHour,
            totalSlots: h.totalSlots || 50,
            availableSlots: h.availableSlots ?? 20,
            amenities: ['CCTV', 'Security', 'EV'],
            rating: 4.8,
            openingHours: '24/7',
            contact: h.contact || 'N/A'
          }));
          setHubs(mappedHubs);
          if (mappedHubs.length > 0) {
            setSelectedHubId(mappedHubs[0].id);
          }
        }
      } catch (err) {
        console.error("Hub fetch error:", err);
      } finally {
        setLoadingHubs(false);
      }
    };
    fetchHubs();
    setSelectedDate(TODAY);
  }, []);

  // --- 2. Update Selected Hub ---
  useEffect(() => {
    const hub = hubs.find(h => h.id === selectedHubId);
    setSelectedHubDetails(hub || null);
  }, [selectedHubId, hubs]);

  // --- 3. Fetch Slots ---
  const fetchSlots = useCallback(async () => {
    if (!selectedHubId || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/parking/slots?locationId=${selectedHubId}&date=${selectedDate}&time=${selectedTime}&duration=${selectedDuration}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      
      if (json.success) {
        // Map backend slot data
        const mappedSlots: Slot[] = json.data.map((s: any) => ({
          id: s.id,
          number: s.number,
          type: s.type, 
          status: s.status, // AVAILABLE, OCCUPIED, etc.
          pricePerHour: s.pricePerHour
        }));
        setAllSlots(mappedSlots);
        setSelectedSlots([]); // Clear selections on new fetch
      }
    } catch (err) {
      console.error("Slot fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [selectedHubId, selectedDate, selectedTime, selectedDuration]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // --- Calculations ---
  const calculateTotals = useMemo(() => {
    if (!selectedHubDetails || selectedSlots.length === 0) {
      return { totalPrice: 0, advanceToPay: 0, hourlyRate: 0 };
    }

    const baseHourlyRate = 300; // Fixed rate: 300 per hour, 150 for half hour
    const duration = Number(selectedDuration);
    
    // Check if peak hour
    const isPeakHour = timeSlots.find(t => t.time === selectedTime)?.isPeak || false;
    // Peak hour is 1.25x but we'll keep base rate at 300 for now
    const hourlyRate = baseHourlyRate;
    
    // Total = Duration (hours) * Rate (300/hour) * Number of Slots
    const totalPrice = duration * hourlyRate * selectedSlots.length;
    
    // Advance = 150 per slot
    const advanceToPay = ADVANCE_FEE_PER_SLOT * selectedSlots.length;

    return { totalPrice, advanceToPay, hourlyRate, isPeakHour };
  }, [selectedHubDetails, selectedSlots.length, selectedDuration, selectedTime, timeSlots]);

  const filteredSlots = useMemo(() => {
    return filterType === 'ALL' ? allSlots : allSlots.filter(s => s.type === filterType);
  }, [allSlots, filterType]);

  // --- Handlers ---
  const handleSlotClick = useCallback((slotId: string) => {
    const slot = allSlots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'AVAILABLE') return;

    setSelectedSlots(prev => {
      if (prev.includes(slotId)) return prev.filter(id => id !== slotId);
      if (prev.length >= 3) {
        setBookingError('Max 3 slots allowed per booking');
        setTimeout(() => setBookingError(null), 3000);
        return prev;
      }
      return [...prev, slotId];
    });
  }, [allSlots]);

  const handleBookNow = () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (!selectedTime) {
      setBookingError('Please select a start time');
      setTimeout(() => setBookingError(null), 3000);
      return;
    }
    if (selectedSlots.length === 0) {
      setBookingError('Please select at least one slot');
      setTimeout(() => setBookingError(null), 3000);
      return;
    }
    setShowPaymentModal(true);
  };

  // --- Payment & Booking Process ---
  const processBooking = async (paymentId?: string) => {
    if (!user) return;

    const payload = {
      userId: user.id,
      locationId: selectedHubId,
      date: selectedDate,
      startTime: selectedTime,
      duration: Number(selectedDuration),
      slotIds: selectedSlots,
      totalAmount: calculateTotals.totalPrice,
      advanceAmount: calculateTotals.advanceToPay,
      paymentId: paymentId || 'manual_bypass',
    };

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Booking failed');
      }

      router.push('/customer/my-bookings');
    } catch (err: any) {
      setBookingError(err.message || 'Failed to create booking');
      setTimeout(() => setBookingError(null), 4000);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <FuturisticBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
        
        {/* --- HEADER --- */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/60 backdrop-blur-2xl overflow-hidden shadow-2xl"
        >
          {/* Subtle moving sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Select <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">Parking Space</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" /> Real-time availability
              </p>
            </div>
            
            {selectedSlots.length > 0 && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="px-6 py-4 bg-slate-950/80 rounded-2xl border border-lime-500/30 text-right shadow-[0_0_20px_rgba(132,204,22,0.15)]"
              >
                <p className="text-[10px] uppercase text-lime-400 font-bold tracking-widest mb-1">Advance Payable</p>
                <h3 className="text-3xl font-black text-white">Rs. {calculateTotals.advanceToPay}</h3>
              </motion.div>
            )}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT PANEL: CONTROLS --- */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl space-y-6 shadow-lg">
              
              {/* Location */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-lime-400"/> Location
                </label>
                {loadingHubs ? (
                  <div className="h-12 w-full bg-slate-800/50 rounded-xl animate-pulse"/>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedHubId}
                      onChange={(e) => setSelectedHubId(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-white text-sm focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/50 outline-none appearance-none transition-all hover:bg-slate-900"
                    >
                      {hubs.map(h => (
                        <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                  </div>
                )}
              </div>

              {/* Date & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-lime-400"/> Date
                  </label>
                  <input 
                    type="date" 
                    min={TODAY} 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)} 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs font-medium outline-none focus:border-lime-500/50 transition-all hover:bg-slate-900" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3 h-3 text-lime-400"/> Duration
                  </label>
                  <select 
                    value={selectedDuration} 
                    onChange={e => setSelectedDuration(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-3 text-white text-xs font-medium outline-none focus:border-lime-500/50 transition-all hover:bg-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h} Hr{h > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              {/* Time Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {timeSlots.map(t => (
                    <button 
                      key={t.time} 
                      onClick={() => setSelectedTime(t.time)}
                      className={`
                        px-1 py-2.5 rounded-lg text-[10px] font-bold border transition-all duration-200
                        ${selectedTime === t.time 
                          ? 'bg-lime-400 text-slate-900 border-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.4)] scale-[1.02]' 
                          : t.isPeak 
                            ? 'bg-slate-900/50 text-amber-400 border-amber-500/20 hover:border-amber-500/50 hover:bg-slate-800' 
                            : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white hover:bg-slate-800'
                        }
                      `}
                    >
                      {t.label}
                      {t.isPeak && <span className="block text-[8px] opacity-60 font-normal mt-0.5">Peak</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleBookNow} 
                disabled={!selectedTime || selectedSlots.length === 0}
                className="w-full py-4 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 relative overflow-hidden group"
              >
                <span className="relative z-10">Proceed to Payment</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

            </div>
          </aside>

          {/* --- RIGHT PANEL: SLOTS --- */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {['ALL', 'NORMAL', 'EV', 'CAR_WASH'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setFilterType(t as any)}
                  className={`
                    px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                    ${filterType === t 
                      ? 'bg-slate-800 text-white border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-900 hover:text-slate-300'
                    }
                  `}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Error Toast */}
            <AnimatePresence>
              {bookingError && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-medium shadow-lg backdrop-blur-md"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {bookingError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slot Grid (High Density) */}
            <div className="p-6 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/60 relative min-h-[500px] backdrop-blur-sm">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-lime-400 animate-spin" />
                  <p className="text-slate-500 text-xs uppercase tracking-widest animate-pulse">Scanning Availability...</p>
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <Search className="w-12 h-12 mb-3 opacity-20" />
                  <p>No slots match criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {filteredSlots.map(slot => {
                    const isSel = selectedSlots.includes(slot.id);
                    const isAvail = slot.status === 'AVAILABLE';
                    
                    // Dynamic styles
                    let slotStyle = "bg-slate-950 border-slate-800 text-slate-500";
                    if (slot.status === 'OCCUPIED') slotStyle = "bg-rose-950/20 border-rose-900/30 text-rose-800/50 cursor-not-allowed";
                    else if (slot.status === 'MAINTENANCE') slotStyle = "bg-amber-950/20 border-amber-900/30 text-amber-800/50 cursor-not-allowed";
                    else if (isSel) slotStyle = "bg-lime-400 border-lime-300 text-slate-900 shadow-[0_0_20px_rgba(132,204,22,0.6)] scale-110 z-10 font-bold";
                    else if (isAvail) slotStyle = "bg-slate-800/30 border-slate-700/50 text-slate-300 hover:border-lime-500/50 hover:text-white hover:bg-slate-800 hover:shadow-[0_0_10px_rgba(132,204,22,0.1)]";

                    return (
                      <motion.button 
                        key={slot.id} 
                        disabled={!isAvail} 
                        onClick={() => handleSlotClick(slot.id)}
                        whileHover={isAvail ? { scale: 1.1 } : {}}
                        whileTap={isAvail ? { scale: 0.9 } : {}}
                        className={`
                          aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 relative transition-all duration-300
                          ${slotStyle}
                        `}
                      >
                        <span className="text-[8px] font-bold uppercase tracking-wide opacity-70">
                          {slot.type === 'NORMAL' ? 'STD' : slot.type}
                        </span>
                        <span className="text-sm">{slot.number}</span>
                        
                        {/* Icons */}
                        {slot.type === 'EV' && <Zap className={`w-2.5 h-2.5 absolute top-1.5 right-1.5 ${isSel ? 'text-slate-900' : 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]'}`} />}
                        {slot.type === 'CAR_WASH' && <Droplets className={`w-2.5 h-2.5 absolute top-1.5 right-1.5 ${isSel ? 'text-slate-900' : 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]'}`} />}
                        
                        {/* Status Dot */}
                        {!isAvail && <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-current opacity-50"/>}
                      </motion.button>
                    );
                  })}
                </div>
              )}
              
              {/* Legend */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-[10px] uppercase font-bold text-slate-500">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-700"/> Available</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_5px_rgba(132,204,22,0.8)]"/> Selected</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-900 opacity-50"/> Occupied</span>
              </div>
            </div>
          </main>
        </div>

        {/* Payment Gateway Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <PaymentGatewayModal 
              amount={calculateTotals.advanceToPay} 
              onSuccess={processBooking} 
              onClose={() => setShowPaymentModal(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
