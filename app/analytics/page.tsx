export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-[#E5E7EB]">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Peak Hours</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-800 rounded-full h-4">
                <div className="bg-gradient-to-r from-[#84CC16] to-[#BEF264] h-4 rounded-full shadow-lg shadow-lime-500/50" style={{ width: '85%' }}></div>
              </div>
              <span className="text-[#E5E7EB] text-sm">9:00 AM (85%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-800 rounded-full h-4">
                <div className="bg-gradient-to-r from-[#84CC16] to-[#BEF264] h-4 rounded-full shadow-lg shadow-lime-500/50" style={{ width: '78%' }}></div>
              </div>
              <span className="text-[#E5E7EB] text-sm">2:00 PM (78%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-800 rounded-full h-4">
                <div className="bg-gradient-to-r from-[#84CC16] to-[#BEF264] h-4 rounded-full shadow-lg shadow-lime-500/50" style={{ width: '65%' }}></div>
              </div>
              <span className="text-[#E5E7EB] text-sm">5:00 PM (65%)</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Vehicle Types</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Cars</span>
              <span className="text-[#E5E7EB] font-semibold">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">SUVs</span>
              <span className="text-[#E5E7EB] font-semibold">22%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Trucks</span>
              <span className="text-[#E5E7EB] font-semibold">10%</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Revenue Trends</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">This Week</span>
              <span className="text-[#84CC16] font-semibold">↑ 15%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">This Month</span>
              <span className="text-[#84CC16] font-semibold">↑ 12%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">This Year</span>
              <span className="text-[#84CC16] font-semibold">↑ 8%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Occupancy Chart</h2>
        <div className="flex items-end justify-between h-64 gap-2">
          {[65, 72, 68, 85, 78, 82, 75].map((height, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-[#84CC16] to-[#BEF264] rounded-t shadow-lg shadow-lime-500/30"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs text-[#94A3B8] mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
