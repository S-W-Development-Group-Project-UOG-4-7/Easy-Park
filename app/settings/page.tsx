export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-[#E5E7EB]">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Parking Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[#94A3B8] mb-2">Total Parking Spots</label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-2">Hourly Rate ($)</label>
              <input
                type="number"
                defaultValue="5.00"
                step="0.01"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-2">Daily Maximum ($)</label>
              <input
                type="number"
                defaultValue="25.00"
                step="0.01"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
              />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#84CC16] peer-checked:to-[#BEF264]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">SMS Alerts</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#84CC16] peer-checked:to-[#BEF264]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Low Capacity Alerts</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#84CC16] peer-checked:to-[#BEF264]"></div>
              </label>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">System Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#94A3B8] mb-2">Time Zone</label>
              <select className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-6 (Central Time)</option>
                <option>UTC-7 (Mountain Time)</option>
                <option>UTC-8 (Pacific Time)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-2">Date Format</label>
              <select className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-lime-500/50 transition-all">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
