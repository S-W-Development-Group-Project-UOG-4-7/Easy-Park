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

  // State for time range inputs
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

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

  const handleStartTimeChange = useCallback((time: string) => {
    setStartTime(time);
    if (time && endTime) {
      const newFilters = { ...filters, timeRange: { start: time, end: endTime } };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else if (time && !endTime) {
      // If only start time is set, filter from that time onwards (set end to 23:59)
      const newFilters = { ...filters, timeRange: { start: time, end: '23:59' } };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else if (!time) {
      // Clear time filter if start time is removed
      const newFilters = { ...filters, timeRange: undefined };
      setFilters(newFilters);
      onFilterChange(newFilters);
      setEndTime('');
    }
  }, [filters, onFilterChange, endTime]);

  const handleEndTimeChange = useCallback((time: string) => {
    setEndTime(time);
    if (startTime && time) {
      const newFilters = { ...filters, timeRange: { start: startTime, end: time } };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else if (!startTime && time) {
      // If only end time is set, filter from start of day (00:00) to that time
      const newFilters = { ...filters, timeRange: { start: '00:00', end: time } };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  }, [filters, onFilterChange, startTime]);

  const clearTimeFilter = useCallback(() => {
    setStartTime('');
    setEndTime('');
    const newFilters = { ...filters, timeRange: undefined };
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

        {/* Time Range Pickers */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              disabled={isLoading}
              placeholder="From"
              className="w-full pl-9 pr-2 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              style={{ colorScheme: 'dark' }}
              title="Start time"
            />
          </div>
          <span className="text-white/40 text-sm flex-shrink-0">to</span>
          <div className="relative flex-1">
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              disabled={isLoading}
              placeholder="To"
              className="w-full pl-3 pr-2 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              style={{ colorScheme: 'dark' }}
              title="End time"
            />
          </div>
          {(startTime || endTime) && (
            <button
              onClick={clearTimeFilter}
              disabled={isLoading}
              className="text-white/40 hover:text-white/80 transition disabled:opacity-50 flex-shrink-0"
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
