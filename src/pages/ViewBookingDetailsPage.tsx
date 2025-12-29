import { useState, useEffect } from 'react';
import { Search, Calendar, Building2, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface Booking {
  id: string;
  customerId: string;
  name: string;
  address: string;
  propertyName: string;
  parkingSlot: string;
  date: string;
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
}

export default function ViewBookingDetailsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Booking>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedProperty, selectedDate]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/properties', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Mock data
      setProperties([
        { id: '1', name: 'Downtown Parking' },
        { id: '2', name: 'Mall Parking' },
        { id: '3', name: 'Airport Parking' },
      ]);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProperty !== 'all') params.append('propertyId', selectedProperty);
      if (selectedDate) params.append('date', selectedDate);

      const response = await fetch(`http://localhost:3001/api/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Mock data
      setBookings([
        {
          id: '1',
          customerId: 'C001',
          name: 'John Doe',
          address: '123 Main St, City',
          propertyName: 'Downtown Parking',
          parkingSlot: 'A-12',
          date: '2024-01-15',
          parkingType: 'Normal',
          hoursSelected: 3,
          checkOutTime: '2024-01-15T15:30:00',
          paymentAmount: 15.00,
          paymentMethod: 'Credit Card',
          extras: 'None',
        },
        {
          id: '2',
          customerId: 'C002',
          name: 'Jane Smith',
          address: '456 Oak Ave, City',
          propertyName: 'Mall Parking',
          parkingSlot: 'B-05',
          date: '2024-01-15',
          parkingType: 'Car Washing',
          hoursSelected: 2,
          checkOutTime: '2024-01-15T14:00:00',
          paymentAmount: 25.00,
          paymentMethod: 'Cash',
          extras: 'Premium Wash',
        },
      ]);
    } finally {
      setLoading(false);
    }
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
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredBookings = sortedBookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.name.toLowerCase().includes(searchLower) ||
      booking.customerId.toLowerCase().includes(searchLower) ||
      booking.propertyName.toLowerCase().includes(searchLower) ||
      booking.parkingSlot.toLowerCase().includes(searchLower)
    );
  });

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const viewBookingDetails = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-slate-100 text-slate-900">View Booking Details</h1>
        <p className="mt-2 text-sm dark:text-slate-400 text-slate-600">
          Filter and view all customer bookings
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-slate-400 text-slate-600" />
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full rounded-lg border bg-gradient-to-br pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-slate-100 border-slate-200/60 from-white to-[#F3F4F6] text-slate-900"
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
          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-slate-400 text-slate-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border bg-gradient-to-br pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-slate-100 border-slate-200/60 from-white to-[#F3F4F6] text-slate-900"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-slate-400 text-slate-600" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border bg-gradient-to-br pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-slate-100 border-slate-200/60 from-white to-[#F3F4F6] text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-gradient-to-br dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-800/60 border-slate-200/60">
                {[
                  { key: 'customerId', label: 'Customer ID' },
                  { key: 'name', label: 'Name' },
                  { key: 'address', label: 'Address' },
                  { key: 'propertyName', label: 'Property' },
                  { key: 'parkingSlot', label: 'Parking Slot' },
                  { key: 'date', label: 'Date' },
                  { key: 'action', label: 'Action' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider dark:text-slate-300 text-slate-700 ${
                      col.key !== 'action' ? 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50' : ''
                    }`}
                    onClick={() => col.key !== 'action' && handleSort(col.key as keyof Booking)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{col.label}</span>
                      {sortField === col.key && col.key !== 'action' && (
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
                  <td colSpan={7} className="px-6 py-12 text-center dark:text-slate-400 text-slate-600">
                    Loading bookings...
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center dark:text-slate-400 text-slate-600">
                    No bookings found
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <>
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4 text-sm dark:text-slate-200 text-slate-800">{booking.customerId}</td>
                      <td className="px-6 py-4 text-sm dark:text-slate-200 text-slate-800">{booking.name}</td>
                      <td className="px-6 py-4 text-sm dark:text-slate-200 text-slate-800">{booking.address}</td>
                      <td className="px-6 py-4 text-sm dark:text-slate-200 text-slate-800">{booking.propertyName}</td>
                      <td className="px-6 py-4 text-sm dark:text-slate-200 text-slate-800">{booking.parkingSlot}</td>
                      <td className="px-6 py-4 text-sm dark:text-slate-200 text-slate-800">{booking.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => viewBookingDetails(booking.id)}
                          className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-lime-500 to-lime-400 dark:from-lime-400 dark:to-lime-300 px-3 py-1.5 text-xs font-medium text-slate-950 dark:text-slate-900 transition-all hover:scale-105"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                    {expandedBooking === booking.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 bg-slate-50/50 dark:bg-slate-900/30">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-3 text-sm font-semibold dark:text-slate-200 text-slate-800">Customer Information</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="dark:text-slate-400 text-slate-600">Name:</span> <span className="dark:text-slate-200 text-slate-800">{booking.name}</span></p>
                                <p><span className="dark:text-slate-400 text-slate-600">Address:</span> <span className="dark:text-slate-200 text-slate-800">{booking.address}</span></p>
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-3 text-sm font-semibold dark:text-slate-200 text-slate-800">Booking Details</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="dark:text-slate-400 text-slate-600">Property:</span> <span className="dark:text-slate-200 text-slate-800">{booking.propertyName}</span></p>
                                <p><span className="dark:text-slate-400 text-slate-600">Parking Slot:</span> <span className="dark:text-slate-200 text-slate-800">{booking.parkingSlot}</span></p>
                                <p><span className="dark:text-slate-400 text-slate-600">Parking Type:</span> <span className="dark:text-slate-200 text-slate-800">{booking.parkingType}</span></p>
                                <p><span className="dark:text-slate-400 text-slate-600">Hours Selected:</span> <span className="dark:text-slate-200 text-slate-800">{booking.hoursSelected}</span></p>
                                <p><span className="dark:text-slate-400 text-slate-600">Check Out Time:</span> <span className="dark:text-slate-200 text-slate-800">{new Date(booking.checkOutTime).toLocaleString()}</span></p>
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-3 text-sm font-semibold dark:text-slate-200 text-slate-800">Payment Details</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="dark:text-slate-400 text-slate-600">Amount:</span> <span className="dark:text-slate-200 text-slate-800">${booking.paymentAmount.toFixed(2)}</span></p>
                                <p><span className="dark:text-slate-400 text-slate-600">Method:</span> <span className="dark:text-slate-200 text-slate-800">{booking.paymentMethod}</span></p>
                                <p><span className="dark:text-slate-400 text-slate-600">Extras:</span> <span className="dark:text-slate-200 text-slate-800">{booking.extras || 'None'}</span></p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t dark:border-slate-800/60 border-slate-200/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm dark:text-slate-400 text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-slate-300 border-slate-200/60 from-white to-[#F3F4F6] text-slate-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-slate-300 border-slate-200/60 from-white to-[#F3F4F6] text-slate-700"
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

