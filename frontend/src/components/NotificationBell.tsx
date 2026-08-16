import React, { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
  notifications: any[];
  onMarkAllRead: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors rounded-full hover:bg-slate-100"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg border border-slate-200 z-50 animate-slide-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              <button
                onClick={onMarkAllRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                <Check className="h-3 w-3 mr-1" /> Mark all read
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${
                      !n.is_read ? 'border-l-2 border-l-primary-500 bg-primary-50/30' : ''
                    }`}
                  >
                    <p className="text-sm text-slate-800">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-sm text-slate-600 hover:text-primary-600 font-medium"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
