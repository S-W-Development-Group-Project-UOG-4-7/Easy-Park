"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { BookingFilters, BookingStatus } from '@/lib/washer-types';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface FilterAndSearchProps {
  onFilterChange: (filters: BookingFilters) => void;
  isLoading?: boolean;
}

export const FilterAndSearch: React.FC<FilterAndSearchProps> = ({
  onFilterChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<BookingFilters>({
    searchQuery: '',
    statusFilter: 'ALL',
    sortBy: 'earliest',
  });

  // Generate date options for the dropdown (today and next 7 days)
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ value: dateStr, label });
    }
    return dates;
  }, []);

  // Time slot options
  const timeOptions = [
    { value: '', label: 'All Times' },
    { value: '08:00-10:00', label: '8:00 AM - 10:00 AM' },
    { value: '10:00-12:00', label: '10:00 AM - 12:00 PM' },
    { value: '12:00-14:00', label: '12:00 PM - 2:00 PM' },
    { value: '14:00-16:00', label: '2:00 PM - 4:00 PM' },
    { value: '16:00-18:00', label: '4:00 PM - 6:00 PM' },
    { value: '18:00-20:00', label: '6:00 PM - 8:00 PM' },
  ];

  const handleSearchChange = useCallback((query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleStatusChange = useCallback((status: BookingStatus | 'ALL') => {
    const newFilters = { ...filters, statusFilter: status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleDateChange = useCallback((date: string) => {
    const newFilters = { ...filters, dateFilter: date || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleTimeChange = useCallback((timeRange: string) => {
    if (!timeRange) {
      const newFilters = { ...filters, timeRange: undefined };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else {
      const [start, end] = timeRange.split('-');
      const newFilters = { ...filters, timeRange: { start, end } };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  }, [filters, onFilterChange]);

  const statusOptions: { value: BookingStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const getCurrentTimeValue = () => {
    if (!filters.timeRange) return '';
    return `${filters.timeRange.start}-${filters.timeRange.end}`;
  };

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h3 className="text-white font-semibold mb-4">Filter Bookings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search by name or vehicle..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition text-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <select
            value={filters.statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as BookingStatus | 'ALL')}
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer appearance-none text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1E293B] text-white">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={18} />
        </div>

        {/* Date Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <select
            value={filters.dateFilter || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer appearance-none text-sm"
          >
            <option value="" className="bg-[#1E293B] text-white">All Dates</option>
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1E293B] text-white">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={18} />
        </div>

        {/* Time Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <select
            value={getCurrentTimeValue()}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer appearance-none text-sm"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1E293B] text-white">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={18} />
        </div>
      </div>
    </div>
  );
};
