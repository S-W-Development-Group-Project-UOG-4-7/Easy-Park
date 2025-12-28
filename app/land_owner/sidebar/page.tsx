"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, CalendarDays, PlusSquare, LogOut, User } from "lucide-react";

export default function OwnerSidebar() {
  const [activeItem, setActiveItem] = useState("home");

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/land_owner" },
    { id: "bookings", label: "View Booking Details", icon: CalendarDays, href: "/land_owner/view_booking" },
    { id: "slots", label: "Add Slots", icon: PlusSquare, href: "/land_owner/add_slots" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0F172A] to-[#020617] border-r border-white/10 flex flex-col">
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
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
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
      <main className="flex-1 bg-gradient-to-b from-[#0F172A] to-[#020617] p-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-3xl font-bold text-[#E5E7EB] mb-4">Sidebar Navigation</h1>
          <p className="text-[#94A3B8] text-center mb-8">Use the sidebar to navigate between pages</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/land_owner" className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 hover:border-[#84CC16]/50 transition-all text-center">
              <Home className="w-8 h-8 text-[#84CC16] mx-auto mb-3" />
              <p className="text-[#E5E7EB] font-medium">Home</p>
            </Link>
            <Link href="/land_owner/view_booking" className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 hover:border-[#84CC16]/50 transition-all text-center">
              <CalendarDays className="w-8 h-8 text-[#84CC16] mx-auto mb-3" />
              <p className="text-[#E5E7EB] font-medium">View Bookings</p>
            </Link>
            <Link href="/land_owner/add_slots" className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 hover:border-[#84CC16]/50 transition-all text-center">
              <PlusSquare className="w-8 h-8 text-[#84CC16] mx-auto mb-3" />
              <p className="text-[#E5E7EB] font-medium">Add Slots</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
