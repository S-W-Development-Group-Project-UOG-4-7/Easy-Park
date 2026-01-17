"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Home, 
  CalendarDays, 
  PlusSquare, 
  LogOut, 
  User, 
  Plus,
  Trash2,
  Save,
  MapPin,
  Menu,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Slot {
  id: string;
  slotNumber: string;
  zone: string;
  status: string;
  pricePerHour: number;
  parkingLotId: string;
}

interface ParkingLot {
  id: string;
  name: string;
  address: string;
}

export default function AddSlots() {
  const [activeItem, setActiveItem] = useState("slots");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [newSlot, setNewSlot] = useState({ zone: "A", count: 1, pricePerHour: 15 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSlotForStatus, setSelectedSlotForStatus] = useState<Slot | null>(null);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/land_owner" },
    { id: "bookings", label: "View Booking Details", icon: CalendarDays, href: "/land_owner/view_booking" },
    { id: "slots", label: "Add Slots", icon: PlusSquare, href: "/land_owner/add_slots" },
  ];

  const zones = ["A", "B", "C", "D"];

  // Fetch parking lots on mount
  useEffect(() => {
    async function fetchParkingLots() {
      try {
        const response = await fetch('/api/parking-lots');
        if (!response.ok) throw new Error('Failed to fetch parking lots');
        const data = await response.json();
        // API returns { parkingLots: [...] } format
        const lots = data.parkingLots || [];
        setParkingLots(lots);
        if (lots.length > 0) {
          setSelectedParkingLot(lots[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchParkingLots();
  }, []);

  // Fetch slots when parking lot changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedParkingLot) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`/api/slots?parkingLotId=${selectedParkingLot}`);
        if (!response.ok) throw new Error('Failed to fetch slots');
        const data = await response.json();
        // API returns { success: true, data: [...] } format from successResponse
        const slotsData = data.data || data.slots || [];
        setSlots(slotsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [selectedParkingLot]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "occupied":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-[#94A3B8]/20 text-[#94A3B8] border-white/10";
    }
  };

  const addSlots = async () => {
    if (!selectedParkingLot) {
      setError('Please select a parking lot first');
      return;
    }
    
    try {
      setActionLoading('add');
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parkingLotId: selectedParkingLot,
          zone: newSlot.zone,
          count: newSlot.count,
          pricePerHour: newSlot.pricePerHour,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add slots');
      }

      // Refresh slots from database
      const slotsResponse = await fetch(`/api/slots?parkingLotId=${selectedParkingLot}`);
      const slotsData = await slotsResponse.json();
      setSlots(slotsData.data || slotsData.slots || []);
      
      setShowAddForm(false);
      setNewSlot({ zone: "A", count: 1, pricePerHour: 15 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add slots');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSlot = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/slots?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete slot');
      }

      setSlots(slots.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete slot');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleStatus = async (id: string) => {
    const slot = slots.find(s => s.id === id);
    if (!slot) return;
    setSelectedSlotForStatus(slot);
  };

  const updateSlotStatus = async (newStatus: string) => {
    if (!selectedSlotForStatus) return;

    try {
      setActionLoading(selectedSlotForStatus.id);
      console.log('Updating slot:', selectedSlotForStatus.id, 'to status:', newStatus);
      
      const response = await fetch('/api/slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSlotForStatus.id, status: newStatus }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update slot');
      }

      // Refresh slots from database to ensure sync
      const slotsResponse = await fetch(`/api/slots?parkingLotId=${selectedParkingLot}`);
      const slotsData = await slotsResponse.json();
      setSlots(slotsData.data || slotsData.slots || []);
      
      setSelectedSlotForStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update slot');
    } finally {
      setActionLoading(null);
    }
  };

  const slotsByZone = zones.reduce((acc, zone) => {
    acc[zone] = slots.filter(s => s.zone === zone);
    return acc;
  }, {} as Record<string, typeof slots>);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-[#0F172A] to-[#020617] border-r border-white/10 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#E5E7EB]"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Owner Profile Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#84CC16] to-[#BEF264] flex items-center justify-center">
              <User className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#E5E7EB]">John Doe</h2>
              <p className="text-sm text-[#94A3B8]">Lot Owner</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold shadow-lg shadow-lime-500/20"
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E5E7EB]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#0F172A]" : ""}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-[#94A3B8]">© 2024 EasyPark</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 bg-gradient-to-b from-[#0F172A] to-[#020617] min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 text-[#E5E7EB]"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 mt-16 lg:mt-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#E5E7EB]">Manage Parking Slots</h1>
              <p className="text-[#94A3B8] mt-1 text-sm sm:text-base">Add, edit, or remove parking slots</p>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              disabled={!selectedParkingLot}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add Slots
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Parking Lot Selector */}
          <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4 mb-6">
            <label className="block text-sm text-[#94A3B8] mb-2">Select Parking Lot</label>
            <select
              value={selectedParkingLot}
              onChange={(e) => setSelectedParkingLot(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
            >
              {parkingLots.length === 0 ? (
                <option value="">No parking lots available</option>
              ) : (
                parkingLots.map(lot => (
                  <option key={lot.id} value={lot.id}>{lot.name} - {lot.address}</option>
                ))
              )}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-[#94A3B8]">Total Slots</p>
              <p className="text-xl sm:text-2xl font-bold text-[#E5E7EB]">{slots.length}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-[#94A3B8]">Available</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{slots.filter(s => s.status.toLowerCase() === "available").length}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-[#94A3B8]">Occupied</p>
              <p className="text-xl sm:text-2xl font-bold text-red-400">{slots.filter(s => s.status.toLowerCase() === "occupied").length}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-[#94A3B8]">Maintenance</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{slots.filter(s => s.status.toLowerCase() === "maintenance").length}</p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#84CC16] animate-spin mb-4" />
              <p className="text-[#94A3B8]">Loading slots...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-8 text-center">
              <MapPin className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
              <p className="text-[#E5E7EB] text-lg">No slots found</p>
              <p className="text-[#94A3B8] text-sm mt-2">Click "Add Slots" to create parking slots</p>
            </div>
          ) : (
            /* Slots by Zone */
            <div className="space-y-4 sm:space-y-6">
              {zones.map(zone => (
                slotsByZone[zone]?.length > 0 && (
                  <div key={zone} className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#84CC16]" />
                      <h2 className="text-lg sm:text-xl font-semibold text-[#E5E7EB]">Zone {zone}</h2>
                      <span className="text-xs sm:text-sm text-[#94A3B8]">({slotsByZone[zone].length} slots)</span>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                      {slotsByZone[zone].map(slot => (
                        <div 
                          key={slot.id}
                          className={`relative p-2 sm:p-3 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 ${getStatusStyle(slot.status)} ${actionLoading === slot.id ? 'opacity-50' : ''}`}
                          onClick={() => !actionLoading && toggleStatus(slot.id)}
                        >
                          {actionLoading === slot.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSlot(slot.id);
                                }}
                                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                              >
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                              <p className="font-semibold text-xs sm:text-sm">{slot.slotNumber}</p>
                              <p className="text-[10px] sm:text-xs mt-1 capitalize">{slot.status.toLowerCase()}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Legend */}
          {!loading && slots.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500/20 border border-green-500/30"></div>
                <span className="text-[#94A3B8]">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500/20 border border-red-500/30"></div>
                <span className="text-[#94A3B8]">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
                <span className="text-[#94A3B8]">Maintenance</span>
              </div>
              <p className="text-[#94A3B8] w-full sm:w-auto sm:ml-auto">Click a slot to change status</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Slots Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
          <div 
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-[#84CC16] mb-6">Add New Slots</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Select Zone</label>
                <select
                  value={newSlot.zone}
                  onChange={(e) => setNewSlot({ ...newSlot, zone: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
                >
                  {zones.map(zone => (
                    <option key={zone} value={zone}>Zone {zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Number of Slots</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newSlot.count}
                  onChange={(e) => setNewSlot({ ...newSlot, count: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Price per Hour ($)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={newSlot.pricePerHour}
                  onChange={(e) => setNewSlot({ ...newSlot, pricePerHour: parseFloat(e.target.value) || 15 })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                disabled={actionLoading === 'add'}
                className="flex-1 py-3 rounded-xl border border-white/10 text-[#E5E7EB] hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={addSlots}
                disabled={actionLoading === 'add'}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'add' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Add Slots
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Status Modal */}
      {selectedSlotForStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedSlotForStatus(null)}>
          <div 
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#84CC16]">Change Slot Status</h3>
              <button 
                onClick={() => setSelectedSlotForStatus(null)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Slot Info */}
            <div className="bg-[#0F172A] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#94A3B8] text-sm">Slot Number</p>
                  <p className="text-[#E5E7EB] text-lg font-semibold">{selectedSlotForStatus.slotNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#94A3B8] text-sm">Current Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedSlotForStatus.status)}`}>
                    {selectedSlotForStatus.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Status Options */}
            <div className="space-y-3">
              <p className="text-sm text-[#94A3B8] mb-2">Select New Status</p>
              
              <button
                onClick={() => updateSlotStatus('available')}
                disabled={actionLoading === selectedSlotForStatus.id || selectedSlotForStatus.status.toLowerCase() === 'available'}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  selectedSlotForStatus.status.toLowerCase() === 'available'
                    ? 'bg-green-500/30 border-green-500/50 cursor-not-allowed'
                    : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                } ${actionLoading === selectedSlotForStatus.id ? 'opacity-50' : ''}`}
              >
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div className="text-left flex-1">
                  <p className="text-green-400 font-medium">Available</p>
                  <p className="text-green-400/60 text-xs">Slot is ready for booking</p>
                </div>
                {selectedSlotForStatus.status.toLowerCase() === 'available' && (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">Current</span>
                )}
              </button>

              <button
                onClick={() => updateSlotStatus('occupied')}
                disabled={actionLoading === selectedSlotForStatus.id || selectedSlotForStatus.status.toLowerCase() === 'occupied'}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  selectedSlotForStatus.status.toLowerCase() === 'occupied'
                    ? 'bg-red-500/30 border-red-500/50 cursor-not-allowed'
                    : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                } ${actionLoading === selectedSlotForStatus.id ? 'opacity-50' : ''}`}
              >
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <div className="text-left flex-1">
                  <p className="text-red-400 font-medium">Occupied</p>
                  <p className="text-red-400/60 text-xs">Slot is currently in use</p>
                </div>
                {selectedSlotForStatus.status.toLowerCase() === 'occupied' && (
                  <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">Current</span>
                )}
              </button>

              <button
                onClick={() => updateSlotStatus('maintenance')}
                disabled={actionLoading === selectedSlotForStatus.id || selectedSlotForStatus.status.toLowerCase() === 'maintenance'}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  selectedSlotForStatus.status.toLowerCase() === 'maintenance'
                    ? 'bg-yellow-500/30 border-yellow-500/50 cursor-not-allowed'
                    : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                } ${actionLoading === selectedSlotForStatus.id ? 'opacity-50' : ''}`}
              >
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <div className="text-left flex-1">
                  <p className="text-yellow-400 font-medium">Maintenance</p>
                  <p className="text-yellow-400/60 text-xs">Slot is under maintenance</p>
                </div>
                {selectedSlotForStatus.status.toLowerCase() === 'maintenance' && (
                  <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">Current</span>
                )}
              </button>
            </div>

            {/* Loading indicator */}
            {actionLoading === selectedSlotForStatus.id && (
              <div className="flex items-center justify-center gap-2 mt-4 text-[#94A3B8]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating status...</span>
              </div>
            )}

            <button
              onClick={() => setSelectedSlotForStatus(null)}
              className="w-full mt-6 py-3 rounded-xl border border-white/10 text-[#E5E7EB] hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
