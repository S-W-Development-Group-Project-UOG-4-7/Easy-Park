'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../components/AuthProvider';
import PaymentGatewayModal from '../../components/PaymentGatewayModal';
import { Calendar, Clock, MapPin, Zap, Car, Shield, AlertCircle, CheckCircle, Loader2, Star, Wifi, Camera, Cctv, Droplets, Battery, Lock } from 'lucide-react';

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
  distance?: number;
  rating?: number;
  openingHours: string;
  contact: string;
}

interface Slot {
  id: string;
  number: string;
  type: 'EV' | 'CAR_WASH' | 'NORMAL' | 'PREMIUM' | 'DISABLED';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  pricePerHour: number;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  features?: string[];
}

interface TimeSlot {
  time: string;
  label: string;
  isPeak: boolean;
}

export default function ViewBookingsPage() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  // UI & Form State
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [selectedHubId, setSelectedHubId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('1');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Data State
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'NORMAL' | 'EV' | 'PREMIUM' | 'DISABLED'>('ALL');
  const [loading, setLoading] = useState(false);
  const [loadingHubs, setLoadingHubs] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Changed from confirmation modal
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [selectedHubDetails, setSelectedHubDetails] = useState<Hub | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Time slots config
  const timeSlots: TimeSlot[] = useMemo(() => [
    { time: '06:00 AM', label: '6:00 AM', isPeak: false },
    { time: '07:00 AM', label: '7:00 AM', isPeak: true },
    { time: '08:00 AM', label: '8:00 AM', isPeak: true },
    { time: '09:00 AM', label: '9:00 AM', isPeak: true },
    { time: '10:00 AM', label: '10:00 AM', isPeak: true },
    { time: '11:00 AM', label: '11:00 AM', isPeak: false },
    { time: '12:00 PM', label: '12:00 PM', isPeak: false },
    { time: '01:00 PM', label: '1:00 PM', isPeak: false },
    { time: '02:00 PM', label: '2:00 PM', isPeak: false },
    { time: '03:00 PM', label: '3:00 PM', isPeak: false },
    { time: '04:00 PM', label: '4:00 PM', isPeak: true },
    { time: '05:00 PM', label: '5:00 PM', isPeak: true },
    { time: '06:00 PM', label: '6:00 PM', isPeak: true },
    { time: '07:00 PM', label: '7:00 PM', isPeak: true },
    { time: '08:00 PM', label: '8:00 PM', isPeak: false },
  ], []);

  const durationOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const ADVANCE_FEE_PER_SLOT = 500;
  const TODAY = new Date().toISOString().split('T')[0];

  const filteredHubs = useMemo(() => {
    if (!searchQuery) return hubs;
    const query = searchQuery.toLowerCase();
    return hubs.filter(hub => 
      hub.name.toLowerCase().includes(query) ||
      hub.city.toLowerCase().includes(query)
    );
  }, [hubs, searchQuery]);

  // 1. Fetch Hubs
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
            city: h.name.split(' ')[0] || 'Colombo',
            pricePerHour: h.pricePerHour,
            totalSlots: h.totalSlots || 50,
            availableSlots: Math.floor(Math.random() * 20) + 5,
            amenities: ['CCTV', 'Security', 'Lighting'],
            rating: 4.5,
            openingHours: '24/7',
            contact: '011-2345678'
          }));
          setHubs(mappedHubs);
          if (mappedHubs.length > 0) {
            setSelectedHubId(mappedHubs[0].id);
            setSelectedHubDetails(mappedHubs[0]);
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
  }, [TODAY]);

  // Update selected hub details
  useEffect(() => {
    const hub = hubs.find(h => h.id === selectedHubId);
    setSelectedHubDetails(hub || null);
  }, [selectedHubId, hubs]);

  // 2. Fetch Slots
  const fetchSlots = useCallback(async () => {
    if (!selectedHubId || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parking/slots?locationId=${selectedHubId}&date=${selectedDate}`);
      const json = await res.json();
      
      if (json.success) {
        const mappedSlots: Slot[] = json.data.map((s: any) => ({
          id: s.id,
          number: s.number,
          type: s.type, 
          status: s.status,
          pricePerHour: s.pricePerHour,
          size: 'MEDIUM',
          features: s.type === 'EV' ? ['Charging'] : []
        }));
        setAllSlots(mappedSlots);
        setSelectedSlots([]);
      }
    } catch (err) {
      console.error("Slot fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [selectedHubId, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Calculate totals
  const calculateTotals = useMemo(() => {
    if (!selectedHubDetails || selectedSlots.length === 0) {
      return { totalPrice: 0, advanceToPay: 0, hourlyRate: 0, discount: 0 };
    }

    const baseHourlyRate = selectedHubDetails.pricePerHour;
    const duration = Number(selectedDuration);
    const isPeakHour = timeSlots.find(t => t.time === selectedTime)?.isPeak || false;
    
    const hourlyRate = isPeakHour ? Math.round(baseHourlyRate * 1.25) : baseHourlyRate;
    const basePrice = selectedSlots.length * duration * hourlyRate;
    const isEarlyBird = selectedTime && selectedTime.includes('AM') && parseInt(selectedTime) < 8;
    const discount = isEarlyBird ? Math.round(basePrice * 0.1) : 0;
    
    const totalPrice = basePrice - discount;
    const advanceToPay = selectedSlots.length * ADVANCE_FEE_PER_SLOT;

    return { totalPrice, advanceToPay, hourlyRate, discount, isPeakHour };
  }, [selectedHubDetails, selectedSlots, selectedDuration, selectedTime, timeSlots]);

  // Filter slots
  const filteredSlots = useMemo(() => {
    return filterType === 'ALL' ? allSlots : allSlots.filter(s => s.type === filterType);
  }, [allSlots, filterType]);

  const handleSlotClick = useCallback((slotId: string) => {
    const slot = allSlots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'AVAILABLE') return;

    setSelectedSlots(prev => {
      if (prev.includes(slotId)) return prev.filter(id => id !== slotId);
      if (prev.length >= 5) {
        setBookingError('Maximum 5 slots');
        setTimeout(() => setBookingError(null), 2000);
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
    if (selectedSlots.length === 0) {
      setBookingError('Select a slot');
      setTimeout(() => setBookingError(null), 2000);
      return;
    }
    setShowPaymentModal(true); // Open the Payment Gateway
  };

  // --- API CALL FOR BOOKING & PAYMENT ---
  const processBooking = async () => {
    if (!user) throw new Error("User not authenticated");

    const payload = {
      userId: user.id,
      locationId: selectedHubId,
      date: selectedDate,
      startTime: selectedTime,
      duration: Number(selectedDuration),
      slotIds: selectedSlots,
      totalAmount: calculateTotals.totalPrice,
      advanceAmount: calculateTotals.advanceToPay, // This triggers the payment logic on backend
    };

    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Booking failed');
    }

    // Success! Redirect to my bookings
    router.push('/customer/my-bookings');
  };

  // UI Components helpers...
  const getSlotIcon = (type: Slot['type']) => {
    switch (type) {
      case 'EV': return <Zap className="w-3 h-3" />;
      case 'CAR_WASH': return <Droplets className="w-3 h-3" />;
      case 'PREMIUM': return <Shield className="w-3 h-3" />;
      case 'DISABLED': return <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>;
      default: return <Car className="w-3 h-3" />;
    }
  };

  const getSlotColor = (type: Slot['type']) => {
    switch (type) {
      case 'EV': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      case 'CAR_WASH': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'PREMIUM': return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      case 'DISABLED': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      default: return 'bg-slate-800/50 border-slate-700 text-slate-300';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'security': return <Lock className="w-3 h-3" />;
      case 'cctv': return <Cctv className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-LK')}`;

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lime-500/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Reserve <span className="text-lime-400">Parking</span>
            </h1>
            <p className="text-slate-400 mt-2">Instant booking with secure advance payment.</p>
          </div>
          {selectedSlots.length > 0 && (
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-lime-400/30 text-right">
              <p className="text-[10px] uppercase text-lime-400 font-bold tracking-widest">Advance Due</p>
              <h3 className="text-2xl font-black text-white">Rs.{calculateTotals.advanceToPay}</h3>
            </div>
          )}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="p-6 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-6">
            
            {/* Hub Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
              {loadingHubs ? <div className="text-lime-400 text-sm animate-pulse">Loading Hubs...</div> : (
                <select
                  value={selectedHubId}
                  onChange={(e) => setSelectedHubId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-lime-400 outline-none"
                >
                  <option value="">Select a Hub</option>
                  {filteredHubs.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Date</label>
                <input type="date" min={TODAY} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-lime-400" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Duration</label>
                <select value={selectedDuration} onChange={e => setSelectedDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-lime-400">
                  {durationOptions.map(h => <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            {/* Time Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Start Time</label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {timeSlots.map(t => (
                  <button key={t.time} onClick={() => setSelectedTime(t.time)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all ${selectedTime === t.time ? 'bg-lime-400 text-slate-900 border-lime-400' : t.isPeak ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleBookNow} disabled={!selectedTime || selectedSlots.length === 0}
              className="w-full py-4 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-lime-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Confirm & Pay Advance
            </button>
          </div>
        </aside>

        {/* Right Panel: Slots */}
        <main className="lg:col-span-8 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['ALL', 'NORMAL', 'EV', 'PREMIUM'].map(t => (
              <button key={t} onClick={() => setFilterType(t as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold border ${filterType === t ? 'bg-slate-800 text-white border-slate-700' : 'text-slate-500 border-transparent hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          {bookingError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {bookingError}
            </motion.div>
          )}

          <div className="p-8 rounded-[3rem] bg-slate-900/30 border border-slate-800 relative min-h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-lime-400 animate-spin" />
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                <p>No slots available</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {filteredSlots.map(slot => {
                  const isSel = selectedSlots.includes(slot.id);
                  const isAvail = slot.status === 'AVAILABLE';
                  return (
                    <button key={slot.id} disabled={!isAvail} onClick={() => handleSlotClick(slot.id)}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all
                        ${!isAvail ? 'bg-slate-950 border-slate-900 opacity-30 cursor-not-allowed' :
                          isSel ? 'bg-lime-400 border-white scale-110 z-10 shadow-xl' :
                          'bg-slate-800 border-slate-700 hover:border-lime-500/50'}`}>
                      <span className={`text-xs font-bold ${isSel ? 'text-slate-900' : 'text-slate-300'}`}>{slot.number}</span>
                      {slot.type === 'EV' && <Zap className={`w-3 h-3 absolute top-1 right-1 ${isSel ? 'text-slate-900' : 'text-lime-400'}`} />}
                    </button>
                  );
                })}
              </div>
            )}
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
  );
}