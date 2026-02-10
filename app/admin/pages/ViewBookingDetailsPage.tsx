'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Building2, Eye, Clock, DollarSign, BookOpen } from 'lucide-react';
import ParkingSlotVisualization from '../components/ParkingSlotVisualization';
import { propertiesApi, bookingsApi } from '../../services/api';
import {
  adminCard,
  adminInputWithIcon,
  adminPrimaryButtonSm,
  adminSecondaryButton,
} from '../components/adminTheme';

interface Booking {
  id: string;
  customerId: string;
  name: string;
  address: string;
  propertyName: string;
  propertyId: string;
  parkingSlot: string;
  parkingSlotId: string;
  date: string;
  time: string;
  parkingType: 'Car Washing' | 'Normal' | 'EV Slot';
  hoursSelected: number;
  checkOutTime: string;
  paymentAmount: number;
  paymentMethod: string;
  extras?: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  slots: {
    id: string;
    number: string;
    type: 'Normal' | 'Car Washing' | 'EV Slot';
  }[];
}

interface FilterStats {
  totalRevenue: number;
  totalBookings: number;
}

export default function ViewBookingDetailsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Booking>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStats, setFilterStats] = useState<FilterStats>({ totalRevenue: 0, totalBookings: 0 });
  const [showSlotVisualization, setShowSlotVisualization] = useState(false);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedProperty, selectedDate, selectedTime]);

  useEffect(() => {
    calculateFilterStats();
  }, [bookings, selectedProperty]);

  const fetchProperties = async () => {
    try {
      const data = await propertiesApi.getAll();
      setProperties(
        data.map((property) => ({
          id: String(property.id),
          name: property.name,
          address: property.address,
          slots: (property.slots || []).map((slot) => ({
            id: String(slot.id),
            number: slot.number,
            type: slot.type === 'EV' ? 'EV Slot' : slot.type,
          })),
        }))
      );
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Mock data
      setProperties([
        {
          id: '1',
          name: 'Downtown Parking',
          address: '123 Main St, City',
          slots: [
            { id: 's1', number: 'A-01', type: 'Normal' },
            { id: 's2', number: 'A-02', type: 'Normal' },
            { id: 's3', number: 'A-03', type: 'Normal' },
            { id: 's4', number: 'B-01', type: 'Car Washing' },
            { id: 's5', number: 'B-02', type: 'Car Washing' },
            { id: 's6', number: 'C-01', type: 'EV Slot' },
            { id: 's7', number: 'C-02', type: 'EV Slot' },
          ],
        },
        {
          id: '2',
          name: 'Mall Parking',
          address: '456 Oak Ave, City',
          slots: [
            { id: 's8', number: 'D-01', type: 'Normal' },
            { id: 's9', number: 'D-02', type: 'Normal' },
            { id: 's10', number: 'E-01', type: 'Car Washing' },
            { id: 's11', number: 'F-01', type: 'EV Slot' },
          ],
        },
      ]);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.getAll({
        propertyId: selectedProperty,
        date: selectedDate,
        time: selectedTime,
      });
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback mock data for when server is not running
      setBookings([
        {
          id: '1',
          customerId: 'C001',
          name: 'John Doe',
          address: '123 Main St, City',
          propertyName: 'Downtown Parking',
          propertyId: '1',
          parkingSlot: 'A-01',
          parkingSlotId: 's1',
          date: '2024-01-15',
          time: '10:00',
          parkingType: 'Normal',
          hoursSelected: 3,
          checkOutTime: '2024-01-15T15:30:00',
          paymentAmount: 15.00,
          paymentMethod: 'Credit Card',
          extras: 'None',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateFilterStats = () => {
    const filtered = bookings.filter((booking) => {
      if (selectedProperty !== 'all' && booking.propertyId !== selectedProperty) {
        return false;
      }
      return true;
    });

    const revenue = filtered.reduce((sum, booking) => sum + booking.paymentAmount, 0);
    const totalBookings = filtered.length;

    setFilterStats({ totalRevenue: revenue, totalBookings });
  };

  const handleSort = (field: keyof Booking) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === undefined || bVal === undefined) return 0;
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredBookings = sortedBookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Search filter
    const matchesSearch = !searchTerm || 
      (booking.name || '').toLowerCase().includes(searchLower) ||
      (booking.customerId || '').toLowerCase().includes(searchLower) ||
      (booking.propertyName || '').toLowerCase().includes(searchLower) ||
      (booking.parkingSlot || '').toLowerCase().includes(searchLower);
    
    // Property filter - match by ID or by name
    let matchesProperty = selectedProperty === 'all';
    if (!matchesProperty) {
      const selectedProp = properties.find(p => String(p.id) === selectedProperty);
      matchesProperty = booking.propertyId === selectedProperty || 
        (selectedProp ? booking.propertyName === selectedProp.name : false);
    }
    
    // Date filter (client-side backup)
    let matchesDate = true;
    if (selectedDate) {
      const bookingDate = booking.date ? new Date(booking.date).toISOString().split('T')[0] : '';
      matchesDate = bookingDate === selectedDate;
    }
    
    // Time filter (client-side backup)
    let matchesTime = true;
    if (selectedTime && booking.time) {
      const bookingTime = booking.time.includes('T') 
        ? booking.time.split('T')[1]?.substring(0, 5) 
        : booking.time.substring(0, 5);
      matchesTime = bookingTime === selectedTime;
    }
    
    return matchesSearch && matchesProperty && matchesDate && matchesTime;
  });

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const viewBookingDetails = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  // Get parking slots for visualization
  const getParkingSlotsForVisualization = () => {
    if (selectedProperty === 'all') return null;
    
    const property = properties.find(p => String(p.id) === selectedProperty);
    if (!property || !property.slots) return null;

    const bookedSlotIds = new Set(
      bookings
        .filter(b => b.propertyId === selectedProperty)
        .map(b => b.parkingSlotId)
    );

    return property.slots.map(slot => ({
      id: slot.id,
      number: slot.number,
      type: slot.type,
      isBooked: bookedSlotIds.has(slot.id),
      bookingId: bookings.find(b => b.parkingSlotId === slot.id)?.id,
      customerName: bookings.find(b => b.parkingSlotId === slot.id)?.name,
      customerId: bookings.find(b => b.parkingSlotId === slot.id)?.customerId,
    }));
  };

  const parkingSlots = getParkingSlotsForVisualization();
  const selectedPropertyName = selectedProperty !== 'all' 
    ? properties.find(p => p.id === selectedProperty)?.name || 'Property'
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">View Booking Details</h1>
        <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
          Filter and view all customer bookings
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
          <select
            value={selectedProperty}
            onChange={(e) => {
              setSelectedProperty(e.target.value);
              setShowSlotVisualization(e.target.value !== 'all');
            }}
            className={adminInputWithIcon}
          >
            <option value="all">All Properties</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={adminInputWithIcon}
          />
        </div>

        <div className="relative">
          <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className={adminInputWithIcon}
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={adminInputWithIcon}
          />
        </div>
      </div>

      {/* Filter Stats */}
      {(selectedProperty !== 'all' || selectedDate || selectedTime) && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className={adminCard}>
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-linear-to-br from-[#84CC16] to-[#BEF264] p-3">
                <DollarSign className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <p className="text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">Total Revenue</p>
                <p className="text-2xl font-bold dark:text-[#E5E7EB] text-[#111827]">
                  Rs. {filterStats.totalRevenue.toFixed(2)}
                </p>
                {selectedProperty !== 'all' && (
                  <p className="text-xs dark:text-[#94A3B8] text-[#6B7280]">{selectedPropertyName}</p>
                )}
              </div>
            </div>
          </div>
          <div className={adminCard}>
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-linear-to-br from-[#84CC16] to-[#BEF264] p-3">
                <BookOpen className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <p className="text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">Total Bookings</p>
                <p className="text-2xl font-bold dark:text-[#E5E7EB] text-[#111827]">
                  {filterStats.totalBookings}
                </p>
                {selectedProperty !== 'all' && (
                  <p className="text-xs dark:text-[#94A3B8] text-[#6B7280]">{selectedPropertyName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parking Slot Visualization */}
      {showSlotVisualization && parkingSlots && selectedProperty !== 'all' && (
        <div className={adminCard}>
          <h2 className="mb-4 text-xl font-semibold dark:text-[#E5E7EB] text-[#111827]">
            Parking Slots - {selectedPropertyName}
          </h2>
          <ParkingSlotVisualization slots={parkingSlots} propertyName={selectedPropertyName} />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-800/60 border-slate-200/60">
                {[
                  { key: 'customerId', label: 'Customer ID', sortable: true },
                  { key: 'name', label: 'Name', sortable: true },
                  { key: 'address', label: 'Address', sortable: true },
                  { key: 'propertyName', label: 'Property', sortable: true },
                  { key: 'parkingSlot', label: 'Parking Slot', sortable: true },
                  { key: 'date', label: 'Date', sortable: true },
                  { key: 'action', label: 'Action', sortable: false },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                      col.sortable ? 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key as keyof Booking)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{col.label}</span>
                      {sortField === col.key && col.sortable && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/60 divide-slate-200/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center dark:text-[#94A3B8] text-[#6B7280]">
                    Loading bookings...
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center dark:text-[#94A3B8] text-[#6B7280]">
                    No bookings found
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <React.Fragment key={booking.id}>
                    <tr
                      className="transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{booking.customerId}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{booking.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{booking.address}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{booking.propertyName}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{booking.parkingSlot}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">{booking.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => viewBookingDetails(booking.id)}
                          className={`flex items-center space-x-2 ${adminPrimaryButtonSm}`}
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                    {expandedBooking === booking.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 bg-slate-50/50 dark:bg-slate-950/40">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-3 text-sm font-semibold dark:text-[#E5E7EB] text-[#111827]">Customer Information</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Name:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.name}</span></p>
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Address:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.address}</span></p>
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-3 text-sm font-semibold dark:text-[#E5E7EB] text-[#111827]">Booking Details</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Property:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.propertyName}</span></p>
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Parking Slot:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.parkingSlot}</span></p>
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Parking Type:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.parkingType}</span></p>
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Hours Selected:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.hoursSelected}</span></p>
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Check Out Time:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{new Date(booking.checkOutTime).toLocaleString()}</span></p>
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-3 text-sm font-semibold dark:text-[#E5E7EB] text-[#111827]">Payment Details</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Amount:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">Rs. {booking.paymentAmount.toFixed(2)}</span></p>
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Method:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.paymentMethod}</span></p>
                                <p><span className="dark:text-[#94A3B8] text-[#6B7280]">Extras:</span> <span className="dark:text-[#E5E7EB] text-[#111827]">{booking.extras || 'None'}</span></p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t dark:border-slate-800/60 border-slate-200/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm dark:text-[#94A3B8] text-[#6B7280]">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`${adminSecondaryButton} disabled:opacity-50`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`${adminSecondaryButton} disabled:opacity-50`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
