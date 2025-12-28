"use client";

import { useState } from "react";
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
  MapPin
} from "lucide-react";

export default function AddSlots() {
  const [activeItem, setActiveItem] = useState("slots");
  const [slots, setSlots] = useState([
    { id: "A-01", zone: "A", status: "available" },
    { id: "A-02", zone: "A", status: "available" },
    { id: "A-03", zone: "A", status: "occupied" },
    { id: "B-01", zone: "B", status: "available" },
    { id: "B-02", zone: "B", status: "available" },
    { id: "C-01", zone: "C", status: "maintenance" },
  ]);
  
  const [newSlot, setNewSlot] = useState({ zone: "A", count: 1 });
  const [showAddForm, setShowAddForm] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/land_owner" },
    { id: "bookings", label: "View Booking Details", icon: CalendarDays, href: "/land_owner/view_booking" },
    { id: "slots", label: "Add Slots", icon: PlusSquare, href: "/land_owner/add_slots" },
  ];

  const zones = ["A", "B", "C", "D"];

  const getStatusStyle = (status: string) => {
    switch (status) {
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

  const addSlots = () => {
    const zone = newSlot.zone;
    const existingInZone = slots.filter(s => s.zone === zone);
    const newSlots = [];
    
    for (let i = 0; i < newSlot.count; i++) {
      const num = existingInZone.length + i + 1;
      newSlots.push({
        id: `${zone}-${num.toString().padStart(2, '0')}`,
        zone: zone,
        status: "available"
      });
    }
    
    setSlots([...slots, ...newSlots]);
    setShowAddForm(false);
    setNewSlot({ zone: "A", count: 1 });
  };

  const deleteSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const toggleStatus = (id: string) => {
    setSlots(slots.map(s => {
      if (s.id === id) {
        const statuses = ["available", "occupied", "maintenance"];
        const currentIndex = statuses.indexOf(s.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...s, status: statuses[nextIndex] };
      }
      return s;
    }));
  };

  const slotsByZone = zones.reduce((acc, zone) => {
    acc[zone] = slots.filter(s => s.zone === zone);
    return acc;
  }, {} as Record<string, typeof slots>);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0F172A] to-[#020617] border-r border-white/10 flex flex-col fixed h-full">
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
      <main className="flex-1 ml-64 bg-gradient-to-b from-[#0F172A] to-[#020617] min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#E5E7EB]">Manage Parking Slots</h1>
              <p className="text-[#94A3B8] mt-1">Add, edit, or remove parking slots</p>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Slots
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4">
              <p className="text-sm text-[#94A3B8]">Total Slots</p>
              <p className="text-2xl font-bold text-[#E5E7EB]">{slots.length}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4">
              <p className="text-sm text-[#94A3B8]">Available</p>
              <p className="text-2xl font-bold text-green-400">{slots.filter(s => s.status === "available").length}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4">
              <p className="text-sm text-[#94A3B8]">Occupied</p>
              <p className="text-2xl font-bold text-red-400">{slots.filter(s => s.status === "occupied").length}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4">
              <p className="text-sm text-[#94A3B8]">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-400">{slots.filter(s => s.status === "maintenance").length}</p>
            </div>
          </div>

          {/* Slots by Zone */}
          <div className="space-y-6">
            {zones.map(zone => (
              slotsByZone[zone]?.length > 0 && (
                <div key={zone} className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#84CC16]" />
                    <h2 className="text-xl font-semibold text-[#E5E7EB]">Zone {zone}</h2>
                    <span className="text-sm text-[#94A3B8]">({slotsByZone[zone].length} slots)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {slotsByZone[zone].map(slot => (
                      <div 
                        key={slot.id}
                        className={`relative p-3 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 ${getStatusStyle(slot.status)}`}
                        onClick={() => toggleStatus(slot.id)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlot(slot.id);
                          }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <p className="font-semibold text-sm">{slot.id}</p>
                        <p className="text-xs mt-1 capitalize">{slot.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30"></div>
              <span className="text-[#94A3B8]">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30"></div>
              <span className="text-[#94A3B8]">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
              <span className="text-[#94A3B8]">Maintenance</span>
            </div>
            <p className="text-[#94A3B8] ml-auto">Click a slot to change status</p>
          </div>
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
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-[#E5E7EB] hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSlots}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Add Slots
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
