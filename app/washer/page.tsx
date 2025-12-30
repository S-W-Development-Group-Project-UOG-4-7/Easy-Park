'use client';

export default function WasherPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#E5E7EB] mb-4">Washer Dashboard</h1>
        <p className="text-[#94A3B8]">Welcome to the Washer Dashboard. View and manage car wash requests.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
            <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">Pending Jobs</h3>
            <p className="text-[#94A3B8] text-sm">View pending car wash requests</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
            <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">In Progress</h3>
            <p className="text-[#94A3B8] text-sm">Track ongoing wash jobs</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
            <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">Completed</h3>
            <p className="text-[#94A3B8] text-sm">View completed wash history</p>
          </div>
        </div>
      </div>
    </div>
  );
}
