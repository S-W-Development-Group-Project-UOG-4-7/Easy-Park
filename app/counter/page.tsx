export default function CounterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl p-8 border border-[#334155]/50">
          <h1 className="text-3xl font-bold text-[#E5E7EB] mb-4">Counter Dashboard</h1>
          <p className="text-[#94A3B8]">Welcome to the Counter Dashboard. Process bookings and manage payments here.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">Check-In</h3>
              <p className="text-sm text-[#94A3B8] mt-2">Process customer check-ins</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">Check-Out</h3>
              <p className="text-sm text-[#94A3B8] mt-2">Process customer check-outs</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">Payments</h3>
              <p className="text-sm text-[#94A3B8] mt-2">Handle payment processing</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-[#334155]">
              <h3 className="text-lg font-semibold text-[#84CC16]">Today&apos;s Bookings</h3>
              <p className="text-sm text-[#94A3B8] mt-2">View all bookings for today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
