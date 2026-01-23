"use client";

import React, { useState, useCallback } from 'react';
import { BookingFilters, BookingStatus } from '@/lib/washer-types';
import { Search, Filter, ChevronDown, Calendar, Clock, X } from 'lucide-react';

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

  const clearDateFilter = useCallback(() => {
    const newFilters = { ...filters, dateFilter: undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  // Convert 24-hour time to 12-hour AM/PM format
  const convertTo12HourFormat = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Convert 12-hour AM/PM format to 24-hour for the input
  const convertTo24HourFormat = (time12: string): string => {
    if (!time12) return '';
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return '';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleTimeChange = useCallback((time: string) => {
    // Convert the 24-hour input value to 12-hour AM/PM format for filtering
    const time12 = time ? convertTo12HourFormat(time) : undefined;
    const newFilters = { ...filters, timeFilter: time12 };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const clearTimeFilter = useCallback(() => {
    const newFilters = { ...filters, timeFilter: undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const statusOptions: { value: BookingStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

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

        {/* Date Picker */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="date"
            value={filters.dateFilter || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            style={{ colorScheme: 'dark' }}
          />
          {filters.dateFilter && (
            <button
              onClick={clearDateFilter}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition disabled:opacity-50"
              aria-label="Clear date filter"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Time Picker */}
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="time"
            value={filters.timeFilter ? convertTo24HourFormat(filters.timeFilter) : ''}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            style={{ colorScheme: 'dark' }}
            title={filters.timeFilter ? `Filter by time: ${filters.timeFilter}` : 'Filter by time'}
          />
          {filters.timeFilter && (
            <button
              onClick={clearTimeFilter}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition disabled:opacity-50"
              aria-label="Clear time filter"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
