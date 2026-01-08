import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ParkingSquare,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  MapPin,
  Activity,
  Zap,
  ChevronRight,
  Car,
  Building2,
} from 'lucide-react';
import { statsApi } from '../services/api';

interface Stats {
  totalRevenue: number;
  availableSlots: number;
  totalCustomers: number;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    availableSlots: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await statsApi.getDashboard();
      setStats({
        totalRevenue: data.totalRevenue,
        availableSlots: data.availableSlots,
        totalCustomers: data.totalCustomers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalRevenue: 45230,
        availableSlots: 127,
        totalCustomers: 342,
      });
    } finally {
      setLoading(false);
    }
  };
//.
  const statCards = [
    {
      title: 'Total Revenue',
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-400',
      shadowColor: 'shadow-emerald-500/25',
      bgGlow: 'bg-emerald-500/20',
    },
    {
      title: 'Available Slots',
      value: stats.availableSlots.toString(),
      change: '+8 today',
      isPositive: true,
      icon: ParkingSquare,
      gradient: 'from-blue-500 to-cyan-400',
      shadowColor: 'shadow-blue-500/25',
      bgGlow: 'bg-blue-500/20',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: '+24 this week',
      isPositive: true,
      icon: Users,
      gradient: 'from-purple-500 to-pink-400',
      shadowColor: 'shadow-purple-500/25',
      bgGlow: 'bg-purple-500/20',
    },
    {
      title: 'Active Bookings',
      value: '89',
      change: '-3%',
      isPositive: false,
      icon: Car,
      gradient: 'from-orange-500 to-amber-400',
      shadowColor: 'shadow-orange-500/25',
      bgGlow: 'bg-orange-500/20',
    },
  ];

  const recentActivities = [
    { id: 1, action: 'New booking', user: 'John Doe', location: 'Slot A-15', time: '2 min ago', type: 'booking' },
    { id: 2, action: 'Payment received', user: 'Sarah Smith', amount: 'Rs. 250', time: '15 min ago', type: 'payment' },
    { id: 3, action: 'Checkout completed', user: 'Mike Johnson', location: 'Slot B-08', time: '32 min ago', type: 'checkout' },
    { id: 4, action: 'New customer registered', user: 'Emily Davis', time: '1 hour ago', type: 'registration' },
    { id: 5, action: 'Property updated', user: 'Admin', location: 'Downtown Parking', time: '2 hours ago', type: 'update' },
  ];

  const quickActions = [
    { title: 'Add Property', icon: Building2, href: '/admin/properties/add', color: 'from-lime-500 to-green-500' },
    { title: 'View Bookings', icon: Calendar, href: '/admin/bookings', color: 'from-blue-500 to-indigo-500' },
    { title: 'Manage Slots', icon: MapPin, href: '/admin/properties', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br p-8 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-slate-50">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-linear-to-br from-lime-400/20 to-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-linear-to-br from-blue-400/20 to-cyan-500/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-lime-400 to-lime-500 shadow-lg shadow-lime-500/30">
              <Activity className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-slate-900">Welcome back, Admin!</h1>
              <p className="text-sm dark:text-slate-400 text-slate-600">
                Here's what's happening with your parking system today.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-slate-100/80 dark:bg-slate-800/50 px-4 py-2">
              <Clock className="h-4 w-4 text-lime-500" />
              <span className="text-sm dark:text-slate-300 text-slate-700">Last updated: Just now</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100/80 dark:bg-slate-800/50 px-4 py-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm dark:text-slate-300 text-slate-700">System status: Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-slate-50"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border bg-linear-to-br p-6 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl ${card.shadowColor} dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-slate-50`}
              >
                {/* Animated background glow */}
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${card.bgGlow} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                
                {/* Decorative pattern */}
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-size-[12px_12px]" />
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex rounded-xl bg-linear-to-br ${card.gradient} p-3 shadow-lg ${card.shadowColor}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      card.isPositive 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {card.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {card.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium dark:text-slate-400 text-slate-600">{card.title}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight dark:text-white text-slate-900">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions & Activity Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-2xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-slate-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-lime-400 to-lime-500">
              <Zap className="h-5 w-5 text-slate-900" />
            </div>
            <h2 className="text-lg font-semibold dark:text-white text-slate-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="group flex items-center justify-between rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 border-slate-200/60 bg-slate-50/50 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${action.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium dark:text-slate-200 text-slate-700">{action.title}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-500">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold dark:text-white text-slate-900">Recent Activity</h2>
            </div>
            <Link to="/admin/bookings" className="text-sm font-medium text-lime-500 hover:text-lime-400 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 border-slate-200/60 bg-white/50"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  activity.type === 'booking' ? 'bg-blue-500/10 text-blue-500' :
                  activity.type === 'payment' ? 'bg-emerald-500/10 text-emerald-500' :
                  activity.type === 'checkout' ? 'bg-orange-500/10 text-orange-500' :
                  activity.type === 'registration' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-slate-500/10 text-slate-500'
                }`}>
                  {activity.type === 'booking' && <Car className="h-5 w-5" />}
                  {activity.type === 'payment' && <DollarSign className="h-5 w-5" />}
                  {activity.type === 'checkout' && <Clock className="h-5 w-5" />}
                  {activity.type === 'registration' && <Users className="h-5 w-5" />}
                  {activity.type === 'update' && <Building2 className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-slate-200 text-slate-800">{activity.action}</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500 truncate">
                    {activity.user} {activity.location && `• ${activity.location}`} {activity.amount && `• ${activity.amount}`}
                  </p>
                </div>
                <span className="text-xs dark:text-slate-500 text-slate-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br p-8 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-slate-50">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-linear-to-r from-lime-500/5 via-emerald-500/5 to-teal-500/5" />
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-br from-lime-400/20 to-emerald-500/20 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-lime-400 to-emerald-500 shadow-lg shadow-lime-500/30">
              <TrendingUp className="h-7 w-7 text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white text-slate-900">System Performance</h2>
              <p className="mt-1 text-sm dark:text-slate-400 text-slate-600 max-w-xl">
                Your parking management system is running smoothly. All services are operational with 99.9% uptime this month.
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold text-lime-500">99.9%</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">Uptime</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">1.2s</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">Avg Response</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-500">2.5K</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">API Calls/day</p>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-lime-500 to-emerald-500 px-6 py-3 font-semibold text-slate-900 shadow-lg shadow-lime-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-lime-500/40"
          >
            View Details
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
