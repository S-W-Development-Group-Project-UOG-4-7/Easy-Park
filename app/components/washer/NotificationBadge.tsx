"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { NotificationAlert } from '@/lib/washer-types';
import { Bell, X, AlertCircle, Clock, Zap } from 'lucide-react';

interface NotificationBadgeProps {
  notifications: NotificationAlert[];
  onDismiss: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  notifications,
  onDismiss,
  onMarkAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState<NotificationAlert | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationAlert['type']) => {
    switch (type) {
      case 'new_booking':
        return <Zap size={18} className="text-blue-400" />;
      case 'urgent_reminder':
        return <AlertCircle size={18} className="text-red-400" />;
      case 'upcoming_slot':
        return <Clock size={18} className="text-yellow-400" />;
      default:
        return <Bell size={18} className="text-white/60" />;
    }
  };

  const getNotificationColor = (type: NotificationAlert['type']) => {
    switch (type) {
      case 'new_booking':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'urgent_reminder':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'upcoming_slot':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      default:
        return 'bg-white/5 border-white/10 text-white';
    }
  };

  const getNotificationTitle = (type: NotificationAlert['type']) => {
    switch (type) {
      case 'new_booking':
        return 'New Booking';
      case 'urgent_reminder':
        return 'Urgent Reminder';
      case 'upcoming_slot':
        return 'Upcoming Slot';
      default:
        return 'Notification';
    }
  };

  // Auto-dismiss new notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const newestNotification = notifications[0];
      setShowToast(newestNotification);

      const timer = setTimeout(() => {
        setShowToast(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleNotificationClick = useCallback((notification: NotificationAlert) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  }, [onMarkAsRead]);

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-white/10 rounded-lg transition"
        >
          <Bell size={24} className="text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 rounded-xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-2xl z-40">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Bell size={18} />
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition"
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-white/60">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-white/5 transition ${!notification.read ? 'bg-white/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">
                                {getNotificationTitle(notification.type)}
                              </p>
                              <p className="text-white/70 text-xs mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-white/40 text-xs mt-2">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-400 mt-1" />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(notification.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition"
                        >
                          <X size={16} className="text-white/60" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/10 text-center">
                <button className="text-xs text-blue-300 hover:text-blue-200 font-medium">
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 max-w-sm rounded-lg border border-white/10 bg-gradient-to-r from-[#1E293B] to-[#0F172A] shadow-2xl p-4 animate-slide-up">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(showToast.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">
                {getNotificationTitle(showToast.type)}
              </p>
              <p className="text-white/70 text-xs mt-1">
                {showToast.message}
              </p>
            </div>
            <button
              onClick={() => setShowToast(null)}
              className="flex-shrink-0 p-1"
            >
              <X size={16} className="text-white/60 hover:text-white transition" />
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
