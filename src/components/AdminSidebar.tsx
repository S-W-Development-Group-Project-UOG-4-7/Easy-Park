import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Building2, LogOut, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AdminSidebarProps {
  adminName?: string;
  onLinkClick?: () => void;
}

export default function AdminSidebar({ adminName = 'Admin', onLinkClick }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSignOut = () => {
    // Clear admin session/token
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { href: '/admin', label: 'Home', icon: Home },
    { href: '/admin/bookings', label: 'View Booking Details', icon: Calendar },
    { href: '/admin/properties/add', label: 'Add Properties', icon: Building2 },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r transition-colors duration-300 dark:border-slate-800/60 border-slate-200/60 bg-gradient-to-b dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6] z-30">
      <div className="flex h-full flex-col p-6">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-lime-500 to-lime-400 bg-clip-text text-transparent dark:from-lime-400 dark:to-lime-300">
            EasyPark
          </h1>
          <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Admin Panel</p>
        </div>

        {/* Admin Name */}
        <div className="mb-6 flex items-center space-x-3 rounded-lg p-3 bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 from-slate-100 to-slate-50 border dark:border-slate-700/50 border-slate-200/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime-500 to-lime-400 dark:from-lime-400 dark:to-lime-300">
            <User className="h-5 w-5 text-slate-950 dark:text-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate dark:text-slate-200 text-slate-800">{adminName}</p>
            <p className="text-xs truncate dark:text-slate-400 text-slate-600">Administrator</p>
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
                    ? 'bg-gradient-to-r from-lime-500 to-lime-400 dark:from-lime-400 dark:to-lime-300 text-slate-950 dark:text-slate-900 shadow-lg'
                    : 'dark:text-slate-300 text-slate-700 dark:hover:bg-slate-800/50 hover:bg-slate-100/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="mt-auto flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 dark:text-slate-300 text-slate-700 dark:hover:bg-red-900/20 hover:bg-red-50 border dark:border-slate-800/50 border-slate-200/50"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

