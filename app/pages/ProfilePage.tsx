import { User, Mail, Phone, MapPin } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold bg-linear-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-lg">
        {/* Avatar Section */}
        <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-[#84CC16] to-[#BEF264] shadow-lg">
            <User className="h-12 w-12 text-slate-950" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Customer Name
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Premium Member</p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

        {/* Info Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
            <Mail className="h-5 w-5 text-[#84CC16]" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
              <p className="font-medium text-slate-900 dark:text-white">customer@example.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
            <Phone className="h-5 w-5 text-[#84CC16]" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
              <p className="font-medium text-slate-900 dark:text-white">+1 (555) 123-4567</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 md:col-span-2">
            <MapPin className="h-5 w-5 text-[#84CC16]" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
              <p className="font-medium text-slate-900 dark:text-white">123 Main Street, City, Country</p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-6 flex justify-center md:justify-end">
          <button className="rounded-lg bg-linear-to-r from-[#84CC16] to-[#BEF264] px-6 py-2.5 font-medium text-slate-950 shadow-lg transition-all hover:shadow-xl hover:scale-105">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
