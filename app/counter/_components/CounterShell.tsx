"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DashboardView from "./DashboardView";
import ParkingManagementView from "./ParkingManagementView";
import ReportsView from "./ReportsView";
import AnalyticsView from "./AnalyticsView";
import NewBookingModal from "./NewBookingModal";

type ViewKey = "dashboard" | "parking" | "reports" | "analytics";

export default function CounterShell() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] text-white">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="ml-64 min-h-screen px-8 py-6">
        <TopBar
          activeView={activeView}
          onNewBooking={() => setShowModal(true)}
        />

        {activeView === "dashboard" && <DashboardView />}
        {activeView === "parking" && <ParkingManagementView />}
        {activeView === "reports" && <ReportsView />}
        {activeView === "analytics" && <AnalyticsView />}
      </main>

      <NewBookingModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
