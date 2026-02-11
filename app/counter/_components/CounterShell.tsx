"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DashboardView from "./DashboardView";
import ParkingManagementView from "./ParkingManagementView";
import ReportsView from "./ReportsView";
import AnalyticsView from "./AnalyticsView";
import NewBookingModal from "./NewBookingModal";
import type {
  CounterBooking,
  CounterParkingArea,
  CounterSlot,
  CounterStats,
  CounterViewKey,
} from "./types";

type SlotRowPayload = {
  id?: unknown;
  slotNumber?: unknown;
  number?: unknown;
  type?: unknown;
  status?: unknown;
};

type BookingSlotPayload = {
  id?: unknown;
  number?: unknown;
  zone?: unknown;
  type?: unknown;
};

type LatestCounterActionPayload = {
  action?: unknown;
  note?: unknown;
  createdAt?: unknown;
  counterName?: unknown;
};

type BookingRowPayload = {
  bookingId?: unknown;
  bookingNumber?: unknown;
  propertyId?: unknown;
  propertyName?: unknown;
  propertyAddress?: unknown;
  customerId?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  vehicleNumber?: unknown;
  vehicleType?: unknown;
  slotNumber?: unknown;
  status?: unknown;
  bookingDate?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  duration?: unknown;
  totalAmount?: unknown;
  paidAmount?: unknown;
  onlinePaid?: unknown;
  cashPaid?: unknown;
  balanceDue?: unknown;
  paymentStatus?: unknown;
  paymentMethod?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  allSlots?: unknown;
  latestCounterAction?: unknown;
};

type ParkingAreaRowPayload = {
  id?: unknown;
  name?: unknown;
  address?: unknown;
  pricePerHour?: unknown;
  pricePerDay?: unknown;
};

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeSlotType(raw: unknown): "NORMAL" | "EV" | "CAR_WASH" {
  const value = String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (value === "EV" || value === "EV_SLOT") return "EV";
  if (value === "CAR_WASH" || value === "CAR_WASHING" || value === "CARWASH") return "CAR_WASH";
  return "NORMAL";
}

function normalizeSlotStatus(raw: unknown): "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" {
  const value = String(raw || "")
    .trim()
    .toUpperCase();
  if (value === "OCCUPIED") return "OCCUPIED";
  if (value === "MAINTENANCE") return "MAINTENANCE";
  return "AVAILABLE";
}

export default function CounterShell() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<CounterViewKey>("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [parkingAreas, setParkingAreas] = useState<CounterParkingArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [bookings, setBookings] = useState<CounterBooking[]>([]);
  const [slots, setSlots] = useState<CounterSlot[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalPrefilledSlotIds, setModalPrefilledSlotIds] = useState<string[]>([]);
  const [modalPrefilledStartTime, setModalPrefilledStartTime] = useState("");
  const [cancelTarget, setCancelTarget] = useState<{
    bookingId: string;
    bookingNumber: string;
    customerName: string;
    slotNumber: string;
  } | null>(null);
  const [cancellingFromSlot, setCancellingFromSlot] = useState(false);

  const selectedArea = useMemo(
    () => parkingAreas.find((area) => area.id === selectedAreaId) || null,
    [parkingAreas, selectedAreaId]
  );

  const fetchBookingsAndSlots = useCallback(
    async (propertyId: string, silent = false) => {
      if (!propertyId) {
        setBookings([]);
        setSlots([]);
        return;
      }
      if (!silent) setLoadingData(true);
      if (silent) setRefreshing(true);
      setDataError(null);
      try {
        const [slotsRes, bookingsRes] = await Promise.all([
          fetch(`/api/slots?propertyId=${propertyId}`, {
            cache: "no-store",
            credentials: "include",
          }),
          fetch(`/api/counter/bookings?propertyId=${propertyId}`, {
            cache: "no-store",
            credentials: "include",
          }),
        ]);

        const slotsPayload = await slotsRes.json().catch(() => ({}));
        const bookingsPayload = await bookingsRes.json().catch(() => ({}));
        if (!slotsRes.ok) {
          throw new Error(
            String(slotsPayload?.error || slotsPayload?.message || "Failed to fetch parking slots")
          );
        }
        if (!bookingsRes.ok) {
          throw new Error(
            String(bookingsPayload?.error || bookingsPayload?.message || "Failed to fetch bookings")
          );
        }

        const bookingRows = (Array.isArray(bookingsPayload?.bookings) ? bookingsPayload.bookings : []) as BookingRowPayload[];
        const mappedBookings: CounterBooking[] = bookingRows.map((booking) => ({
          bookingId: String(booking?.bookingId || ""),
          bookingNumber: String(booking?.bookingNumber || ""),
          propertyId: String(booking?.propertyId || ""),
          propertyName: String(booking?.propertyName || ""),
          propertyAddress: String(booking?.propertyAddress || ""),
          customerId: String(booking?.customerId || ""),
          customerName: String(booking?.customerName || "N/A"),
          customerEmail: String(booking?.customerEmail || "N/A"),
          customerPhone: booking?.customerPhone ? String(booking.customerPhone) : null,
          vehicleNumber: String(booking?.vehicleNumber || "N/A"),
          vehicleType: booking?.vehicleType ? String(booking.vehicleType) : null,
          slotNumber: String(booking?.slotNumber || "N/A"),
          status: String(booking?.status || "PENDING").toUpperCase() as CounterBooking["status"],
          bookingDate: String(booking?.bookingDate || ""),
          startTime: String(booking?.startTime || ""),
          endTime: String(booking?.endTime || ""),
          duration: Number(booking?.duration || 1),
          totalAmount: Number(booking?.totalAmount || 0),
          paidAmount: Number(booking?.paidAmount || 0),
          onlinePaid: Number(booking?.onlinePaid || 0),
          cashPaid: Number(booking?.cashPaid || 0),
          balanceDue: Number(booking?.balanceDue || 0),
          paymentStatus: String(booking?.paymentStatus || "UNPAID").toUpperCase() as CounterBooking["paymentStatus"],
          paymentMethod: String(booking?.paymentMethod || "N/A"),
          createdAt: String(booking?.createdAt || booking?.bookingDate || ""),
          updatedAt: String(booking?.updatedAt || booking?.bookingDate || ""),
          allSlots: Array.isArray(booking?.allSlots)
            ? (booking.allSlots as BookingSlotPayload[]).map((slot) => ({
                id: String(slot?.id || ""),
                number: String(slot?.number || ""),
                zone: String(slot?.zone || "A"),
                type: normalizeSlotType(slot?.type),
              }))
            : [],
          latestCounterAction:
            booking?.latestCounterAction &&
            typeof booking.latestCounterAction === "object"
              ? {
                  action: String((booking.latestCounterAction as LatestCounterActionPayload).action || ""),
                  note:
                    (booking.latestCounterAction as LatestCounterActionPayload).note === null
                      ? null
                      : String((booking.latestCounterAction as LatestCounterActionPayload).note || ""),
                  createdAt: String((booking.latestCounterAction as LatestCounterActionPayload).createdAt || ""),
                  counterName: String((booking.latestCounterAction as LatestCounterActionPayload).counterName || ""),
                }
              : null,
        }));

        const nowMs = Date.now();
        const reservedSlotIds = new Set<string>();
        const reservedSlotNumbers = new Set<string>();
        for (const booking of mappedBookings) {
          const endMs = new Date(booking.endTime).getTime();
          if (booking.status === "CANCELLED") continue;
          if (!Number.isFinite(endMs) || endMs <= nowMs) continue;
          for (const slot of booking.allSlots) {
            if (slot.id) reservedSlotIds.add(slot.id);
            if (slot.number) reservedSlotNumbers.add(slot.number);
          }
        }

        const slotRows = (Array.isArray(slotsPayload?.data) ? slotsPayload.data : []) as SlotRowPayload[];
        const mappedSlots: CounterSlot[] = slotRows.map((slot) => {
          const baseStatus = normalizeSlotStatus(slot?.status);
          const slotId = String(slot?.id || "");
          const slotNumber = String(slot?.slotNumber || slot?.number || "");
          const isReserved =
            baseStatus !== "MAINTENANCE" &&
            (reservedSlotIds.has(slotId) || reservedSlotNumbers.has(slotNumber));
          const status: CounterSlot["status"] = baseStatus === "MAINTENANCE" ? "MAINTENANCE" : isReserved ? "OCCUPIED" : "AVAILABLE";
          return {
            id: slotId,
            slotNumber,
            type: normalizeSlotType(slot?.type),
            status,
            isAvailable: status === "AVAILABLE",
          };
        });

        setBookings(mappedBookings);
        setSlots(mappedSlots);
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "Failed to fetch counter data");
      } finally {
        setLoadingData(false);
        setRefreshing(false);
      }
    },
    []
  );

  const fetchParkingAreas = useCallback(async () => {
    setLoadingAreas(true);
    setDataError(null);
    try {
      const response = await fetch("/api/parking-lots?showAll=true", {
        cache: "no-store",
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(payload?.error || payload?.message || "Failed to fetch parking areas"));
      }
      const rows = (Array.isArray(payload?.parkingLots) ? payload.parkingLots : []) as ParkingAreaRowPayload[];
      const mapped: CounterParkingArea[] = rows.map((row) => ({
        id: String(row?.id || ""),
        name: String(row?.name || ""),
        address: String(row?.address || ""),
        pricePerHour: Number(row?.pricePerHour || 0),
        pricePerDay: Number(row?.pricePerDay || 0),
      }));
      setParkingAreas(mapped);
      setSelectedAreaId((prev) => {
        if (prev && mapped.some((area) => area.id === prev)) return prev;
        return mapped[0]?.id || "";
      });
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Failed to load parking areas");
      setParkingAreas([]);
      setSelectedAreaId("");
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function verifyCounterAccess() {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.success || !payload?.data) {
          router.replace("/sign-in");
          return;
        }
        const roles: string[] = Array.isArray(payload.data.roles)
          ? payload.data.roles.map((role: unknown) =>
              String(role || "")
                .trim()
                .toUpperCase()
                .replace(/[\s-]+/g, "_")
            )
          : [];
        const primaryRole = String(payload.data.role || "")
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, "_");
        const allowed = roles.includes("COUNTER") || roles.includes("ADMIN") || primaryRole === "COUNTER" || primaryRole === "ADMIN";
        if (!allowed) {
          setAuthError("You do not have permission to access counter dashboard.");
          return;
        }
        await fetchParkingAreas();
      } catch {
        if (!cancelled) setAuthError("Failed to verify your account. Please sign in again.");
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }
    verifyCounterAccess();
    return () => {
      cancelled = true;
    };
  }, [fetchParkingAreas, router]);

  useEffect(() => {
    if (!selectedAreaId || authLoading) return;
    fetchBookingsAndSlots(selectedAreaId);
  }, [authLoading, fetchBookingsAndSlots, selectedAreaId]);

  useEffect(() => {
    if (!selectedAreaId || authLoading) return;
    const intervalId = window.setInterval(() => {
      fetchBookingsAndSlots(selectedAreaId, true);
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [authLoading, fetchBookingsAndSlots, selectedAreaId]);

  const stats = useMemo<CounterStats>(() => {
    const now = new Date();
    const todayKey = toLocalDateKey(now);
    const totalSlots = slots.length;
    const availableSlots = slots.filter((slot) => slot.status === "AVAILABLE").length;
    const occupiedSlots = slots.filter((slot) => slot.status === "OCCUPIED").length;
    const maintenanceSlots = slots.filter((slot) => slot.status === "MAINTENANCE").length;
    const activeBookings = bookings.filter((booking) => {
      if (booking.status === "CANCELLED") return false;
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= now && end > now;
    }).length;
    const todayRevenue = bookings
      .filter((booking) => {
        if (booking.status === "CANCELLED") return false;
        const bookingDate = new Date(booking.startTime || booking.bookingDate);
        if (Number.isNaN(bookingDate.getTime())) return false;
        return toLocalDateKey(bookingDate) === todayKey;
      })
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    return {
      totalSlots,
      availableSlots,
      occupiedSlots,
      maintenanceSlots,
      activeBookings,
      todayRevenue,
    };
  }, [bookings, slots]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
  }, [bookings]);

  const reservedBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((booking) => {
        if (booking.status === "CANCELLED") return false;
        const end = new Date(booking.endTime);
        return !Number.isNaN(end.getTime()) && end > now;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings]);

  const activeBookings = useMemo(() => {
    const now = new Date();
    return reservedBookings.filter((booking) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= now && end > now;
    });
  }, [reservedBookings]);

  const handleManualRefresh = () => {
    if (!selectedAreaId) return;
    fetchBookingsAndSlots(selectedAreaId, true);
  };

  const handleBookingCreated = async () => {
    if (!selectedAreaId) return;
    await fetchBookingsAndSlots(selectedAreaId);
    setActiveView("dashboard");
    setModalPrefilledSlotIds([]);
    setModalPrefilledStartTime("");
  };

  const handleSlotClick = (slot: CounterSlot) => {
    if (slot.status === "AVAILABLE") {
      const now = new Date();
      const rounded = new Date(now);
      rounded.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      const hh = String(rounded.getHours()).padStart(2, "0");
      const mm = String(rounded.getMinutes()).padStart(2, "0");
      setModalPrefilledSlotIds([slot.id]);
      setModalPrefilledStartTime(`${hh}:${mm}`);
      setShowModal(true);
      return;
    }

    const bookingForSlot = reservedBookings.find((booking) =>
      booking.allSlots.some((slotItem) => slotItem.id === slot.id || slotItem.number === slot.slotNumber)
    );

    if (!bookingForSlot) {
      return;
    }

    setCancelTarget({
      bookingId: bookingForSlot.bookingId,
      bookingNumber: bookingForSlot.bookingNumber,
      customerName: bookingForSlot.customerName,
      slotNumber: slot.slotNumber,
    });
  };

  const handleCancelBySlot = async () => {
    if (!cancelTarget) return;
    setCancellingFromSlot(true);
    try {
      const response = await fetch(`/api/counter/bookings/${cancelTarget.bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "CANCELLED",
          note: `Cancelled by counter by clicking slot ${cancelTarget.slotNumber}`,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success) {
        throw new Error(String(payload?.error || payload?.message || "Failed to cancel booking"));
      }
      setCancelTarget(null);
      await fetchBookingsAndSlots(selectedAreaId || "");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Failed to cancel booking");
    } finally {
      setCancellingFromSlot(false);
    }
  };

  if (authLoading || loadingAreas) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] text-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] text-white flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-rose-300">Counter Access Error</h2>
          <p className="mt-2 text-sm text-rose-200/90">{authError}</p>
          <button
            type="button"
            onClick={() => router.replace("/sign-in")}
            className="mt-5 rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] text-white">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="ml-64 min-h-screen px-8 py-6">
        <TopBar
          activeView={activeView}
          parkingAreas={parkingAreas}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
          onRefresh={handleManualRefresh}
          refreshing={refreshing}
          onNewBooking={() => {
            setModalPrefilledSlotIds([]);
            setModalPrefilledStartTime("");
            setShowModal(true);
          }}
        />

        {dataError ? (
          <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {dataError}
          </div>
        ) : null}

        {activeView === "dashboard" && (
          <DashboardView
            selectedArea={selectedArea}
            stats={stats}
            slots={slots}
            bookings={recentBookings}
            activeBookings={activeBookings}
            loading={loadingData}
            onSlotClick={handleSlotClick}
          />
        )}
        {activeView === "parking" && (
          <ParkingManagementView
            selectedArea={selectedArea}
            stats={stats}
            slots={slots}
            bookings={bookings}
            loading={loadingData}
            onRefresh={handleManualRefresh}
          />
        )}
        {activeView === "reports" && (
          <ReportsView
            selectedArea={selectedArea}
            bookings={bookings}
            loading={loadingData}
          />
        )}
        {activeView === "analytics" && (
          <AnalyticsView
            selectedArea={selectedArea}
            stats={stats}
            bookings={bookings}
            slots={slots}
            loading={loadingData}
          />
        )}
      </main>

      <NewBookingModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setModalPrefilledSlotIds([]);
          setModalPrefilledStartTime("");
        }}
        parkingAreas={parkingAreas}
        defaultPropertyId={selectedAreaId}
        preselectedSlotIds={modalPrefilledSlotIds}
        prefilledStartTime={modalPrefilledStartTime}
        onCreated={handleBookingCreated}
      />

      {cancelTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Cancel Booking?</h3>
            <p className="mt-2 text-sm text-slate-300">
              Slot <span className="font-semibold text-lime-300">{cancelTarget.slotNumber}</span> is currently booked
              by <span className="font-semibold text-white"> {cancelTarget.customerName}</span>.
            </p>
            <p className="mt-1 text-xs text-slate-500">Booking: {cancelTarget.bookingNumber}</p>
            <p className="mt-3 text-xs text-rose-300">
              Are you sure you want to cancel this booking and release the slot?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={cancellingFromSlot}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBySlot}
                disabled={cancellingFromSlot}
                className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-200 disabled:opacity-50"
              >
                {cancellingFromSlot ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
