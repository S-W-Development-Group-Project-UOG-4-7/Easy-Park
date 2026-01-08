import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Building2, User, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AdminSidebarProps {
  adminName?: string;
  onLinkClick?: () => void;
}

export default function AdminSidebar({ adminName = 'Admin', onLinkClick }: AdminSidebarProps) {
  const location = useLocation();
  const { theme } = useTheme();

  const menuItems = [
    { href: '/admin', label: 'Home', icon: Home },
    { href: '/admin/bookings', label: 'View Booking Details', icon: Calendar },
    { href: '/admin/properties', label: 'Manage Properties', icon: Building2 },
    { href: '/admin/properties/add', label: 'Add Properties', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    if (path === '/admin/properties') {
      return location.pathname === '/admin/properties';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r transition-colors duration-300 dark:border-slate-800/60 border-slate-200/60 bg-linear-to-b dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6] z-30">
      <div className="flex h-full flex-col p-6">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-linear-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">
            EasyPark
          </h1>
          <p className="text-xs mt-1 dark:text-[#94A3B8] text-[#6B7280]">Admin Panel</p>
        </div>

        {/* Admin Name */}
        <div className="mb-6 flex items-center space-x-3 rounded-lg p-3 bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6] border dark:border-slate-800/60 border-slate-200/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#84CC16] to-[#BEF264]">
            <User className="h-5 w-5 text-slate-950" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate dark:text-[#E5E7EB] text-[#111827]">{adminName}</p>
            <p className="text-xs truncate dark:text-[#94A3B8] text-[#6B7280]">Administrator</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onLinkClick}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-linear-to-r from-[#84CC16] to-[#BEF264] text-slate-950 shadow-lg'
                    : 'dark:text-[#E5E7EB] text-[#111827] dark:hover:bg-slate-800/50 hover:bg-slate-100/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
