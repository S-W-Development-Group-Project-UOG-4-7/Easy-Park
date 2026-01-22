import { useEffect, useState } from 'react';
import { DollarSign, ParkingSquare, Users, TrendingUp } from 'lucide-react';
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
      // Mock data for development
      setStats({
        totalRevenue: 45230,
        availableSlots: 127,
        totalCustomers: 342,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,

      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-400',
      bgGradient: 'from-emerald-500/10 to-teal-400/10',
    },
    {
      title: 'Available Parking Slots',
      value: stats.availableSlots.toString(),
      icon: ParkingSquare,
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-500/10 to-cyan-400/10',
    },
    {
      title: 'Customers Using the System',
      value: stats.totalCustomers.toString(),
      icon: Users,
      gradient: 'from-purple-500 to-pink-400',
      bgGradient: 'from-purple-500/10 to-pink-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">Admin Home</h1>
        <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
          Overview of your parking management system
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6]"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border bg-linear-to-br p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${card.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <div className={`mb-4 inline-flex rounded-lg bg-linear-to-br ${card.gradient} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">{card.title}</h3>
                  <p className="mt-2 text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional Content Area */}
      <div className="mt-8 rounded-xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-linear-to-br from-[#84CC16] to-[#BEF264] p-2">
            <TrendingUp className="h-5 w-5 text-slate-950" />
          </div>
          <h2 className="text-lg font-semibold dark:text-[#E5E7EB] text-[#111827]">System Overview</h2>
        </div>
        <p className="mt-4 text-sm dark:text-[#94A3B8] text-[#6B7280]">
          Manage your parking properties, view booking details, and monitor system performance from this central hub.
        </p>
      </div>
    </div>
  );
}
