'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clipboard, LogOut } from 'lucide-react';

// --- Types ---
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
  
  // --- State ---
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const notificationsRef = useRef<Notification[]>([]);
  
  // Toast State
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Refs & Scroll
  const notificationRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: '/customer/view-bookings', label: 'Book Now', icon: Calendar },
    { href: '/customer/my-bookings', label: 'My Bookings', icon: Clipboard },
  ];

  // --- Effects ---

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50 && currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.4;
      notificationSoundRef.current = audio;
    }
  }, []);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

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

  const fetchNotifications = useCallback(async () => {
    try {
      const prevNotifications = notificationsRef.current;
      if (prevNotifications.length === 0) setLoadingNotifications(true);
      
      const res = await fetch('/api/customer/notifications');
      const data = await res.json();
      
      if (data.success) {
        const newNotifications: Notification[] = data.data;
        const newUnreadCount = newNotifications.filter((n) => !n.read).length;
        
        if (newNotifications.length > prevNotifications.length && prevNotifications.length > 0) {
           const newest = newNotifications[0];
           if (!newest.read && newest.id !== prevNotifications[0]?.id) {
             setLatestNotification(newest);
             notificationSoundRef.current?.play().catch(() => {});
             setTimeout(() => setLatestNotification(null), 5000);
           }
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // --- Handlers ---

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(`/api/washer/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch('/api/washer/notifications/read-all', { method: 'PUT' });
    } catch (err) { console.error(err); }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);
    if (notification.metadata?.actionUrl) {
      router.push(notification.metadata.actionUrl);
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openSignOutModal = () => { setOpen(false); setShowSignOutModal(true); };
  const closeSignOutModal = () => setShowSignOutModal(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setShowSignOutModal(false);
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  };

  // Body scroll lock
  useEffect(() => {
    if (showSignOutModal || open) { document.body.style.overflow = 'hidden'; } 
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [showSignOutModal, open]);

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  // --- Render Helpers ---
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = { ALERT: '🚨', WARNING: '⚠️', SUCCESS: '✅', BOOKING_UPDATE: '🔄', INFO: 'ℹ️' };
    return <span className="text-xl">{icons[type] || '🔔'}</span>;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = { ALERT: 'border-l-rose-500', WARNING: 'border-l-amber-500', SUCCESS: 'border-l-emerald-500', BOOKING_UPDATE: 'border-l-blue-500', INFO: 'border-l-slate-500' };
    return colors[type] || 'border-l-slate-500';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const renderLinks = (direction: 'row' | 'col') => {
    const isCustomerRoute = pathname.startsWith('/customer');
    return (
      <div className={direction === 'row' ? 'hidden items-center gap-1 md:flex' : 'flex flex-col gap-2 md:hidden'}>
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon as any;

          // Icon color classes: only apply custom customer palette on customer dashboard
          const iconBase = isCustomerRoute ? 'text-lime-400' : 'text-slate-400';
          const iconHover = isCustomerRoute ? 'hover:text-lime-300' : 'hover:text-white';
          const iconActive = isCustomerRoute ? 'text-lime-200' : 'text-white';
          const iconClasses = `${iconBase} ${iconHover} transition-colors duration-200 ease-in-out` + (isActive ? ` ${iconActive}` : '');

          return (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              prefetch
              onClick={() => setOpen(false)}
              className={`${direction === 'col' ? `relative w-full rounded-2xl px-4 py-3 text-base font-semibold border transition-all duration-300 flex items-center gap-3 ${isActive ? 'border-lime-500/50 bg-gradient-to-r from-lime-500/10 to-emerald-500/10 text-lime-300' : 'border-slate-800/70 bg-[#111827]/40 text-slate-100 hover:bg-[#111827]/60'}` : `relative px-4 py-2.5 text-sm font-semibold transition-all duration-300 rounded-xl ${isActive ? 'bg-gradient-to-r from-lime-500/20 to-emerald-500/20 text-white border border-lime-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}`}
            >
              <span className="flex items-center gap-2">
                <span className={`text-base ${iconClasses}`}><Icon className="h-5 w-5" /></span>{link.label}
                {isActive && direction === 'col' && <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-lime-500/20 text-lime-300">ACTIVE</span>}
              </span>
              {isActive && direction === 'row' && <motion.span layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full" />}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-500 backdrop-blur-xl ${scrolled ? '-translate-y-full' : 'translate-y-0'} ${pathname === '/' ? 'bg-transparent border-transparent' : 'bg-gradient-to-br from-[#0F172A]/95 to-[#1E1B4B]/95 border-slate-800/40'}`}>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/customer" prefetch className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#84CC16] to-[#BEF264] text-slate-900 shadow-lg shadow-lime-200/40 ring-1 ring-lime-200/60 transition-transform duration-300 group-hover:scale-105">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M5 16h14l-1.5-7H6.5L5 16Z" />
                  <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
                  <path d="M9 11h6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                  EasyPark
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Smart Parking
                </span>
              </div>
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">{renderLinks('row')}</div>

            <div className="flex items-center gap-3">
              {/* Credits */}
              {userProfile?.credits !== undefined && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-bold text-amber-300">{userProfile.credits}</span>
                  <span className="text-xs text-amber-400/70">credits</span>
                </div>
              )}

              {/* --- NOTIFICATIONS --- */}
              <div className="relative" ref={notificationRef}>
                <button 
                  type="button" 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${showNotifications ? 'border-lime-500/50 bg-gradient-to-br from-lime-500/20 to-emerald-500/20 text-white' : 'border-slate-700 bg-[#111827]/70 text-slate-300 hover:text-white'}`}
                >
                  {/* Bell Icon & Badge */}
                  <motion.div animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.5, repeat: 0 }}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  </motion.div>
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-96 origin-top-right rounded-2xl border border-slate-700 bg-[#0F172A] shadow-2xl shadow-black/50 ring-1 ring-slate-800 overflow-hidden z-50"
                    >
                      {/* Header & Tabs */}
                      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                        <div className="px-4 py-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white">Notifications</h3>
                          {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] uppercase font-bold tracking-wider text-lime-400 hover:text-lime-300">Mark all read</button>}
                        </div>
                        <div className="flex px-4 gap-4 pb-0">
                          <button onClick={() => setActiveTab('all')} className={`pb-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-lime-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>All</button>
                          <button onClick={() => setActiveTab('unread')} className={`pb-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'unread' ? 'border-lime-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Unread ({unreadCount})</button>
                        </div>
                      </div>
                      
                      {/* List */}
                      <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                        {loadingNotifications ? (
                          <div className="p-8 text-center text-slate-500"><div className="w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"/>Loading...</div>
                        ) : filteredNotifications.length === 0 ? (
                          <div className="px-4 py-12 text-center">
                            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-600"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></div>
                            <p className="text-sm text-slate-400">No notifications</p>
                          </div>
                        ) : (
                          filteredNotifications.map((note) => (
                            <div
                              key={note.id}
                              onClick={() => handleNotificationClick(note)}
                              className={`px-4 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer group ${!note.read ? 'bg-slate-800/20' : ''} ${getNotificationColor(note.type)} border-l-2`}
                            >
                              <div className="flex gap-3">
                                <div className="mt-0.5 text-lg">{getNotificationIcon(note.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-snug ${!note.read ? 'text-white font-medium' : 'text-slate-400'}`}>{note.message}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-slate-500">{formatTime(note.createdAt)}</span>
                                    {!note.read ? (
                                      <button 
                                        onClick={(e) => markAsRead(note.id, e)}
                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full transition-colors"
                                      >
                                        Mark read
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-slate-600 font-medium">Read</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 text-center">
                        <Link href="/customer/notifications" onClick={() => setShowNotifications(false)} className="text-xs font-medium text-slate-400 hover:text-white transition-colors">View all notifications</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown (Desktop) */}
              <div className="hidden md:block relative">
                <Link href="/customer/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-slate-800 hover:to-slate-900 hover:border-slate-600 transition-all duration-300">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {userProfile?.avatar ? <img src={userProfile.avatar} alt="Profile" className="h-full w-full object-cover" /> : userProfile?.name?.charAt(0).toUpperCase() || <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white max-w-[100px] truncate">{userProfile?.name || 'Account'}</p>
                    <p className="text-[10px] text-slate-400 max-w-[100px] truncate">View Profile</p>
                  </div>
                </Link>
              </div>

              {/* ✅ ADDED: Desktop Sign Out Button */}
              <button 
                type="button"
                onClick={openSignOutModal}
                disabled={signingOut}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 font-medium text-sm transition hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline">Sign Out</span>
              </button>

              {/* Mobile Toggle */}
              <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl bg-slate-800 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-[#0F172A] border-b border-slate-800 overflow-hidden">
              <div className="px-4 pt-2 pb-4 space-y-2">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{userProfile?.name?.charAt(0) || 'U'}</div>
                  <div><p className="text-white font-medium">{userProfile?.name || 'User'}</p><p className="text-xs text-slate-400">{userProfile?.email}</p></div>
                </div>
                {renderLinks('col')}
                <div className="pt-4 border-t border-slate-800 mt-2 space-y-2">
                  <Link href="/customer/profile" prefetch onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Profile</Link>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setShowSignOutModal(true); }}
                    disabled={signingOut}
                    className="inline-flex w-full items-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 font-medium text-sm transition hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Toast Notification */}
      <AnimatePresence>
        {latestNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-slate-800/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-start gap-3"
          >
            <div className="text-2xl">{getNotificationIcon(latestNotification.type)}</div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">New Notification</h4>
              <p className="text-xs text-slate-300 line-clamp-2">{latestNotification.message}</p>
            </div>
            <button onClick={() => setLatestNotification(null)} className="text-slate-500 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}
