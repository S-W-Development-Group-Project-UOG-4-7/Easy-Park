'use client';

export default function LandOwnerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#E5E7EB] mb-4">Land Owner Dashboard</h1>
        <p className="text-[#94A3B8]">Welcome to the Land Owner Dashboard. Manage your parking locations and view earnings.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
            <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">My Locations</h3>
            <p className="text-[#94A3B8] text-sm">View and manage your parking locations</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
            <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">Earnings</h3>
            <p className="text-[#94A3B8] text-sm">Track your revenue and payouts</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
            <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">Analytics</h3>
            <p className="text-[#94A3B8] text-sm">View occupancy and usage statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
