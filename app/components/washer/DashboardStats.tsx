"use client";

import React from 'react';
import { DashboardStats as DashboardStatsType } from '@/lib/washer-types';
import { TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, Database } from 'lucide-react';

interface AllTimeStats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  cancelled: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsType;
  allTimeStats?: AllTimeStats;
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  allTimeStats,
  isLoading = false,
}) => {
  // Ensure all stats values are valid numbers
  const safeStats = {
    totalBookings: stats?.totalBookings || 0,
    pendingBookings: stats?.pendingBookings || 0,
    acceptedBookings: stats?.acceptedBookings || 0,
    completedBookings: stats?.completedBookings || 0,
    cancelledBookings: stats?.cancelledBookings || 0,
  };

  const safeAllTime = {
    total: allTimeStats?.total || 0,
    pending: allTimeStats?.pending || 0,
    accepted: allTimeStats?.accepted || 0,
    completed: allTimeStats?.completed || 0,
    cancelled: allTimeStats?.cancelled || 0,
  };

  const completionRate = safeStats.totalBookings > 0 
    ? Math.round((safeStats.completedBookings / safeStats.totalBookings) * 100) 
    : 0;

  const statCards = [
    {
      icon: BarChart3,
      label: 'Total Bookings',
      value: safeAllTime.total,
      bg: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      textColor: 'text-blue-300',
    },
    {
      icon: AlertCircle,
      label: 'Pending',
      value: safeAllTime.pending,
      bg: 'from-yellow-500/20 to-yellow-500/5',
      border: 'border-yellow-500/30',
      textColor: 'text-yellow-300',
    },
    {
      icon: Clock,
      label: 'Accepted',
      value: safeAllTime.accepted,
      bg: 'from-purple-500/20 to-purple-500/5',
      border: 'border-purple-500/30',
      textColor: 'text-purple-300',
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: safeAllTime.completed,
      bg: 'from-green-500/20 to-green-500/5',
      border: 'border-green-500/30',
      textColor: 'text-green-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-6 rounded-xl border ${card.border} bg-gradient-to-br ${card.bg} backdrop-blur transition hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white/5 ${card.textColor}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="text-white/60 text-sm font-medium mb-1">{card.label}</div>
              <div className={`text-3xl font-bold ${card.textColor}`}>
                {isLoading ? (
                  <div className="h-8 w-12 bg-white/10 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completion Rate */}
        <div className="p-6 rounded-xl border border-lime-500/30 bg-gradient-to-br from-lime-500/20 to-lime-500/5">
          <div className="flex items-start justify-between mb-4">
            <div className="text-white/60 text-sm font-medium">Today's Completion Rate</div>
            <TrendingUp className="text-lime-300" size={24} />
          </div>
          <div className="mb-4">
            <div className="text-4xl font-bold text-lime-300">
              {isLoading ? (
                <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
              ) : (
                `${completionRate}%`
              )}
            </div>
            <div className="text-sm text-lime-200">
              {safeStats.completedBookings} of {safeStats.totalBookings} completed
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-lime-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Day Summary */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <div className="text-white/60 text-sm font-medium mb-4">Today's Summary</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/70">
                <AlertCircle size={18} className="text-yellow-400" />
                <span className="text-sm">Pending Actions</span>
              </div>
              <div className="text-white font-bold">{safeStats.pendingBookings}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/70">
                <Clock size={18} className="text-blue-400" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="text-white font-bold">{safeStats.acceptedBookings}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle size={18} className="text-green-400" />
                <span className="text-sm">Finished Today</span>
              </div>
              <div className="text-white font-bold">{safeStats.completedBookings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {safeStats.totalBookings > 0 && (
        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/0">
          <div className="text-white/70 text-sm">
            {safeStats.completedBookings === safeStats.totalBookings && safeStats.totalBookings > 0 ? (
              <span className="text-lime-300 font-medium">🎉 Amazing work! All bookings for today are completed!</span>
            ) : safeStats.pendingBookings === 0 ? (
              <span className="text-blue-300 font-medium">✓ No pending bookings. Keep up the great work!</span>
            ) : (
              <span>You have <span className="text-yellow-300 font-medium">{safeStats.pendingBookings}</span> booking{safeStats.pendingBookings !== 1 ? 's' : ''} awaiting your attention.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
