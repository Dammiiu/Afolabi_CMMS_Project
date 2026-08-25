import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationBell from '../components/NotificationBell';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ClipboardList,
  Inbox,
  Wrench,
  Package,
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Shield,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const { notifications, markAllAsRead } = useNotifications();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const navItems = {
    requestor: [
      { name: 'Dashboard', path: '/requestor/dashboard', icon: LayoutDashboard },
      { name: 'New Request', path: '/requestor/new-request', icon: PlusCircle },
      { name: 'My Requests', path: '/requestor/requests', icon: FileText },
    ],
    technician: [
      { name: 'My Tasks', path: '/technician/tasks', icon: ClipboardList },
    ],
    supervisor: [
      { name: 'Triage Queue', path: '/supervisor/triage', icon: Inbox },
      { name: 'Work Orders', path: '/supervisor/work-orders', icon: Wrench },
      { name: 'Inventory', path: '/supervisor/inventory', icon: Package },
      { name: 'Reports', path: '/supervisor/reports', icon: BarChart3 },
    ],
    admin: [
      { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
      { name: 'Triage Queue', path: '/supervisor/triage', icon: Inbox },
      { name: 'Work Orders', path: '/supervisor/work-orders', icon: Wrench },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Locations', path: '/admin/locations', icon: MapPin },
      { name: 'Inventory', path: '/supervisor/inventory', icon: Package },
    ],
  };

  const links = navItems[user.role] || [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-center px-4 border-b border-slate-100">
        <img src="/logo.png" alt="AATU CMMS" className="max-h-16 object-contain" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm border-l-4 border-primary-700 rounded-l-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
              }`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Area */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-sm capitalize">
            {user.full_name.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user.full_name}</p>
            <p className="text-xs text-slate-400 font-semibold capitalize mt-0.5">{user.role}</p>
          </div>
          <button 
            onClick={logout} 
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay / Drawer */}
      {mobileOpen && (
        <div className="relative z-50 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs animate-slide-in">
            <div className="relative flex flex-col flex-1 bg-white">
              <button 
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Main viewport area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-10">
          <button 
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100" 
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
            <NotificationBell notifications={notifications} onMarkAllRead={markAllAsRead} />
            <div className="h-6 w-[1px] bg-slate-200" />
            <Link to="/profile" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
              <UserIcon className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-semibold hidden sm:inline">Profile</span>
            </Link>
          </div>
        </header>

        {/* Scrollable primary content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
