export default function ParkingPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-[#E5E7EB]">Parking Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Available Spots</h2>
          <p className="text-5xl font-bold text-[#E5E7EB]">45</p>
          <p className="text-[#94A3B8] mt-2">out of 100 total</p>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Occupied</h2>
          <p className="text-5xl font-bold text-[#E5E7EB]">55</p>
          <p className="text-[#94A3B8] mt-2">currently in use</p>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Revenue Today</h2>
          <p className="text-5xl font-bold text-[#E5E7EB]">$1,250</p>
          <p className="text-[#94A3B8] mt-2">from parking fees</p>
        </div>
      </div>
      <div className="mt-8 bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-[#E5E7EB]">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700/30">
            <span className="text-[#94A3B8]">Vehicle #1234 entered</span>
            <span className="text-[#84CC16]">2 min ago</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700/30">
            <span className="text-[#94A3B8]">Vehicle #5678 exited</span>
            <span className="text-[#84CC16]">5 min ago</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700/30">
            <span className="text-[#94A3B8]">Vehicle #9012 entered</span>
            <span className="text-[#84CC16]">8 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}




