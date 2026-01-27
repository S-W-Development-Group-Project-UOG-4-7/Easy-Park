'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WasherNotification {
  id: string;
  type: string;
  message: string;
  bookingId: string | null;
  read: boolean;
  createdAt: string;
}

export default function WasherNotificationsPage() {
  const [notifications, setNotifications] = useState<WasherNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/washer/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every 30 seconds for new alerts
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    try {
      await fetch('/api/washer/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alert': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Notifications</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time updates for washer tasks.</p>
          </div>
          <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unread</span>
            <div className="text-xl font-black text-lime-400 text-right">{unreadCount}</div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-10 text-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-500"
              >
                No notifications right now.
              </motion.div>
            ) : (
              notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`
                    relative p-5 rounded-2xl border transition-all duration-300
                    ${n.read 
                      ? 'bg-slate-900/50 border-slate-800 opacity-70' 
                      : 'bg-slate-900 border-lime-500/30 shadow-[0_0_15px_rgba(132,204,22,0.1)]'}
                  `}
                >
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                      {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-sm font-bold ${n.read ? 'text-slate-400' : 'text-white'}`}>
                          {n.type.toUpperCase()}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-300 leading-relaxed">{n.message}</p>
                      
                      {n.bookingId && (
                        <div className="pt-2">
                          <span className="px-2 py-1 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400">
                            ID: {n.bookingId.slice(0, 8)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="absolute top-4 right-4 h-2 w-2 rounded-full bg-lime-500 animate-pulse hover:scale-150 transition-transform"
                      title="Mark as read"
                    />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}