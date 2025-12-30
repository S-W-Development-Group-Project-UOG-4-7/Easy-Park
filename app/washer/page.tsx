export default function WasherPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl p-8 border border-[#334155]/50">
          <h1 className="text-3xl font-bold text-[#E5E7EB] mb-4">Washer Dashboard</h1>
          <p className="text-[#94A3B8]">Welcome to the Washer Dashboard. View and manage your car wash tasks here.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">Pending Tasks</h3>
              <p className="text-sm text-[#94A3B8] mt-2">View cars waiting for wash</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">In Progress</h3>
              <p className="text-sm text-[#94A3B8] mt-2">Current wash jobs in progress</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">Completed</h3>
              <p className="text-sm text-[#94A3B8] mt-2">View completed wash jobs</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">My Earnings</h3>
              <p className="text-sm text-[#94A3B8] mt-2">Track your daily earnings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
