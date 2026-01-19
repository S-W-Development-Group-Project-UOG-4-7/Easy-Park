"use client";

import React, { useState, useCallback } from 'react';
import { BookingFilters, BookingStatus } from '@/lib/washer-types';
import { Search, Filter, X } from 'lucide-react';

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

  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const handleSortChange = useCallback((sortBy: 'earliest' | 'latest' | 'vehicle_type' | 'status') => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleDateChange = useCallback((date: string) => {
    const newFilters = { ...filters, dateFilter: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleTimeRangeChange = useCallback((start: string, end: string) => {
    const newFilters = { ...filters, timeRange: { start, end } };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleReset = useCallback(() => {
    const defaultFilters: BookingFilters = {
      searchQuery: '',
      statusFilter: 'ALL',
      sortBy: 'earliest',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setShowAdvanced(false);
  }, [onFilterChange]);

  const statusOptions: (BookingStatus | 'ALL')[] = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search by customer name or vehicle number..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition flex items-center gap-2 font-medium"
        >
          <Filter size={20} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Quick Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition disabled:opacity-50 ${
              filters.statusFilter === status
                ? 'bg-lime-500 text-black'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {status === 'ALL' ? 'All Status' : status}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Filter size={18} />
              Advanced Filters
            </h3>
            <button
              onClick={() => setShowAdvanced(false)}
              className="p-1 hover:bg-white/10 rounded transition"
            >
              <X size={20} className="text-white/60" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Booking Date</label>
              <input
                type="date"
                value={filters.dateFilter || ''}
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition cursor-pointer"
              >
                <option value="earliest">Earliest Slot</option>
                <option value="latest">Latest Slot</option>
                <option value="vehicle_type">Vehicle Type</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Time Range Start */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Time From</label>
              <input
                type="time"
                value={filters.timeRange?.start || ''}
                onChange={(e) => handleTimeRangeChange(e.target.value, filters.timeRange?.end || '')}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>

            {/* Time Range End */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Time To</label>
              <input
                type="time"
                value={filters.timeRange?.end || ''}
                onChange={(e) => handleTimeRangeChange(filters.timeRange?.start || '', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex gap-2 pt-4 border-t border-white/10">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition disabled:opacity-50 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.searchQuery || filters.dateFilter || filters.statusFilter !== 'ALL' || filters.timeRange) && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <div className="px-3 py-1 rounded-lg bg-lime-500/20 border border-lime-500/30 text-lime-300 text-sm flex items-center gap-2">
              Search: {filters.searchQuery}
              <button
                onClick={() => handleSearchChange('')}
                className="hover:text-lime-200 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {filters.statusFilter !== 'ALL' && (
            <div className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm flex items-center gap-2">
              {filters.statusFilter}
              <button
                onClick={() => handleStatusChange('ALL')}
                className="hover:text-blue-200 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {filters.dateFilter && (
            <div className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm flex items-center gap-2">
              Date: {filters.dateFilter}
              <button
                onClick={() => handleDateChange('')}
                className="hover:text-purple-200 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
