'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Enhanced type definitions
interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'BOOKING_UPDATE';
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    bookingId?: string;
    washerId?: string;
    actionUrl?: string;
  };
}

interface UserProfile {
  name?: string;
  email?: string;
  avatar?: string;
  credits?: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Auth & Menu State
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationSound, setNotificationSound] = useState<HTMLAudioElement | null>(null);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Refs
  const notificationRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: '/customer/view-bookings', label: 'Book Now', icon: '📅' },
    { href: '/customer/my-bookings', label: 'My Bookings', icon: '📋' },
  ];

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50 && currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Initialize Notification Sound ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      setNotificationSound(audio);
    }
  }, []);

  // --- Fetch User Profile ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await fetch('/api/customer/profile');
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // --- Fetch Notifications with Optimistic Updates ---
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch('/api/washer/notifications');
      const data = await res.json();
      
      if (data.success) {
        const newNotifications = data.data;
        const previousUnread = unreadCount;
        const newUnread = newNotifications.filter((n: Notification) => !n.read).length;
        
        setNotifications(newNotifications);
        setUnreadCount(newUnread);
        
        // Play notification sound for new unread notifications
        if (notificationSound && newUnread > previousUnread && previousUnread > 0) {
          notificationSound.play().catch(() => {
            // Silent fail for audio autoplay restrictions
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [unreadCount, notificationSound]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // --- Mark Notification as Read ---
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/washer/notifications/${id}/read`, {
        method: 'PUT',
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // --- Mark All as Read ---
  const markAllAsRead = async () => {
    try {
      await fetch('/api/washer/notifications/read-all', {
        method: 'PUT',
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // --- Close Notification Dropdown on Click Outside ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Close Mobile Menu on Escape ---
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // --- Handle Sign Out ---
  const openSignOutModal = () => {
    setOpen(false);
    setShowSignOutModal(true);
  };

  const closeSignOutModal = () => {
    setShowSignOutModal(false);
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setShowSignOutModal(false);
    
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear any service workers or caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  };

  // --- Body Scroll Lock ---
  useEffect(() => {
    if (showSignOutModal || open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => { document.body.style.overflow = ''; };
  }, [showSignOutModal, open]);

  // --- Close Mobile Menu on Route Change ---
  useEffect(() => {
    setOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  // --- Helper Functions ---
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      ALERT: '🚨',
      WARNING: '⚠️',
      SUCCESS: '✅',
      BOOKING_UPDATE: '🔄',
      INFO: 'ℹ️'
    };
    return <span className="text-xl">{icons[type] || '🔔'}</span>;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      ALERT: 'border-l-rose-500',
      WARNING: 'border-l-amber-500',
      SUCCESS: 'border-l-emerald-500',
      BOOKING_UPDATE: 'border-l-blue-500',
      INFO: 'border-l-slate-500'
    };
    return colors[type] || 'border-l-slate-500';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.metadata?.actionUrl) {
      router.push(notification.metadata.actionUrl);
      setShowNotifications(false);
    }
  };

  // --- Render Functions ---
  const renderLinks = (direction: 'row' | 'col') => (
    <div className={direction === 'row' ? 'hidden items-center gap-1 md:flex' : 'flex flex-col gap-2 md:hidden'}>
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`
              ${direction === 'col' 
                ? `relative w-full rounded-2xl px-4 py-3 text-base font-semibold border transition-all duration-300 flex items-center gap-3 ${
                    isActive 
                      ? 'border-lime-500/50 bg-gradient-to-r from-lime-500/10 to-emerald-500/10 text-lime-300' 
                      : 'border-slate-800/70 bg-[#111827]/40 text-slate-100 hover:bg-[#111827]/60'
                  }`
                : `
                  relative px-4 py-2.5 text-sm font-semibold transition-all duration-300 rounded-xl
                  ${isActive
                    ? 'bg-gradient-to-r from-lime-500/20 to-emerald-500/20 text-white border border-lime-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `
              }
            `}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{link.icon}</span>
              {link.label}
              {isActive && direction === 'col' && (
                <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-lime-500/20 text-lime-300">
                  ACTIVE
                </span>
              )}
            </span>
            {isActive && direction === 'row' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <nav 
        ref={navRef}
        className={`
          fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-500 backdrop-blur-xl
          ${scrolled ? '-translate-y-full' : 'translate-y-0'}
          ${pathname === '/' ? 'bg-transparent border-transparent' : 'bg-gradient-to-br from-[#0F172A]/95 to-[#1E1B4B]/95 border-slate-800/40'}
        `}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link 
              href="/customer/view-bookings" 
              className="flex items-center gap-3 group"
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 via-emerald-400 to-cyan-400 text-slate-900 shadow-xl shadow-lime-500/20 ring-1 ring-lime-400/40 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 16h14l-1.5-7H6.5L5 16Z" />
                  <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
                  <path d="M9 11h6" />
                </svg>
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
                  EasyPark
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                  SMART PARKING
                </span>
              </div>
            </Link>

            {/* Centered Nav Links */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
              {renderLinks('row')}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* User Credits Badge */}
              {userProfile?.credits !== undefined && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-bold text-amber-300">{userProfile.credits}</span>
                  <span className="text-xs text-amber-400/70">credits</span>
                </div>
              )}

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`
                    relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300
                    ${showNotifications
                      ? 'border-lime-500/50 bg-gradient-to-br from-lime-500/20 to-emerald-500/20 text-white shadow-lg shadow-lime-500/20'
                      : 'border-slate-700 bg-[#111827]/70 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800/50 hover:-translate-y-0.5 hover:shadow-lg'
                    }
                  `}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  {loadingNotifications ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  )}
                  
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-[10px] font-bold flex items-center justify-center text-white animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                      <span className="absolute inset-0 rounded-xl bg-rose-500/10 animate-ping" />
                    </>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 origin-top-right rounded-2xl border border-slate-700 bg-gradient-to-b from-[#0F172A] to-[#1E1B4B] shadow-2xl shadow-black/50 ring-1 ring-slate-800 focus:outline-none overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/30 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                            <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                          <p className="text-xs text-slate-500 mt-1">We'll notify you when something arrives</p>
                        </div>
                      ) : (
                        <>
                          {notifications.map((note) => (
                            <div
                              key={note.id}
                              className={`
                                px-4 py-3 border-b border-slate-800/50 transition-all duration-200 cursor-pointer group
                                ${!note.read ? 'bg-gradient-to-r from-slate-800/30 to-slate-900/20 hover:from-slate-800/40 hover:to-slate-900/30' : 'hover:bg-slate-800/20'}
                                ${getNotificationColor(note.type)}
                                border-l-4
                              `}
                              onClick={() => handleNotificationClick(note)}
                            >
                              <div className="flex gap-3">
                                <div className="mt-0.5 flex-shrink-0">
                                  {getNotificationIcon(note.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-200 font-medium leading-relaxed group-hover:text-white">
                                    {note.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-slate-500">
                                      {formatTime(note.createdAt)}
                                    </p>
                                    {!note.read && (
                                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    )}
                                  </div>
                                  {note.metadata?.bookingId && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800/50 text-slate-400">
                                        Booking #{note.metadata.bookingId.slice(-6)}
                                      </span>
                                      {note.metadata.actionUrl && (
                                        <span className="text-xs text-blue-400 group-hover:text-blue-300">
                                          View →
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/30">
                        <Link
                          href="/customer/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-center block text-slate-400 hover:text-white transition-colors"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="hidden md:block relative">
                <Link 
                  href="/customer/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-slate-800 hover:to-slate-900 hover:border-slate-600 transition-all duration-300 group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : userProfile?.name ? (
                      userProfile.name.charAt(0).toUpperCase()
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">
                      {userProfile?.name || 'Account'}
                    </p>
                    <p className="text-xs text-slate-400 truncate max-w-[120px]">
                      {userProfile?.email || 'View profile'}
                    </p>
                  </div>
                  <svg className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Link>
              </div>

              {/* Mobile Profile Icon */}
              <Link 
                href="/customer/profile"
                className="md:hidden h-10 w-10 rounded-full border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-400 transition-all duration-300 hover:bg-slate-700 hover:text-white hover:scale-105"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={openSignOutModal}
                disabled={signingOut}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400 font-medium text-sm transition-all duration-300 hover:from-red-500/20 hover:to-rose-500/20 hover:border-red-500/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden lg:inline">{signingOut ? '...' : 'Sign Out'}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                    <path d="M4 6h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {open && (
          <div className="md:hidden">
            <div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-50 mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
              <div className="mt-2 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-[#0F172A] to-[#1E1B4B] p-4 shadow-2xl shadow-black/40 ring-1 ring-slate-800/50 backdrop-blur-xl animate-in slide-in-from-top duration-300">
                {/* User Info */}
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{userProfile?.name || 'User'}</p>
                      <p className="text-sm text-slate-400 truncate">{userProfile?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  {userProfile?.credits !== undefined && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-300">Available Credits</span>
                        <span className="text-lg font-bold text-amber-300">{userProfile.credits}</span>
                      </div>
                    </div>
                  )}
                </div>

                {renderLinks('col')}
                
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
                  {/* Quick Actions */}
                  <Link href="/customer/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
                    Settings
                  </Link>
                  <Link href="/customer/help" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    Help Center
                  </Link>
                  
                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={openSignOutModal}
                    disabled={signingOut}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-400 font-semibold text-base transition-all hover:from-red-500/20 hover:to-rose-500/20 hover:border-red-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {signingOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sign Out Modal */}
      {showSignOutModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-300">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeSignOutModal}
          />
          <div className="relative z-[10000] mx-4 w-full max-w-md rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] p-6 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 ring-1 ring-red-500/30">
              <svg className="h-7 w-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </div>
            
            <h3 className="mb-2 text-center text-xl font-bold text-white">Sign Out</h3>
            <p className="mb-6 text-center text-slate-400">
              Are you sure you want to sign out? You'll need to sign in again to access your bookings and settings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={closeSignOutModal}
                className="flex-1 rounded-xl border border-slate-600 bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 font-semibold text-slate-300 transition-all hover:from-slate-700 hover:to-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-500/10 to-rose-500/10 px-4 py-2.5 font-semibold text-red-400 transition-all hover:from-red-500/20 hover:to-rose-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {signingOut ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    Signing Out...
                  </>
                ) : (
                  'Sign Out'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Global Styles for Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }
        
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation-duration: 200ms;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        
        .slide-in-from-top {
          animation-name: slide-in-from-top;
        }
        
        .fade-in {
          animation-name: fade-in;
        }
        
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </>
  );
}