import React from 'react';
import PageHeader from '../../components/PageHeader';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationsPage = () => {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Notifications" 
        actions={<button onClick={markAllAsRead} className="btn-secondary">Mark All Read</button>}
      />
      <div className="card divide-y divide-slate-100">
        {notifications.map(n => (
          <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 cursor-pointer hover:bg-slate-50 ${!n.is_read ? 'bg-primary-50/20' : ''}`}>
            <p className="font-medium text-slate-800">{n.message}</p>
            <p className="text-sm text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
        {notifications.length === 0 && <div className="p-8 text-center text-slate-500">No notifications</div>}
      </div>
    </div>
  );
};

export default NotificationsPage;
