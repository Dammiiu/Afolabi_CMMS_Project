import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getNotifications } from '../api/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }

    // Fetch initial notifications
    getNotifications({ limit: 20 })
      .then((res) => setNotifications(res.items))
      .catch((err) => console.error('Failed to fetch notifications', err));

    const token = localStorage.getItem('access_token') || '';
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.host;
    
    // Connect to WebSocket using relative protocol/host via Vite proxy
    let ws: WebSocket;
    let reconnectTimeout: number;

    const connectWs = () => {
      ws = new WebSocket(`${protocol}${host}/ws?token=${token}`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setNotifications((prev) => [data, ...prev]);
          addToast(data.message || 'New notification', 'info');
        } catch (e) {
          console.error('Error parsing notification', e);
        }
      };

      ws.onclose = () => {
        // Retry connection after 5 seconds
        reconnectTimeout = window.setTimeout(connectWs, 5000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [isAuthenticated, user, addToast]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
