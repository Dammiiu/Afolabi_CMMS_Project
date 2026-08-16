import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import DashboardLayout from './layouts/DashboardLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import RequestorDashboard from './pages/requestor/Dashboard';
import NewRequest from './pages/requestor/NewRequest';
import RequestHistory from './pages/requestor/RequestHistory';

import MyTasks from './pages/technician/MyTasks';
import TaskDetail from './pages/technician/TaskDetail';

import TriageQueue from './pages/supervisor/TriageQueue';
import WorkOrderBoard from './pages/supervisor/WorkOrderBoard';
import Inventory from './pages/supervisor/Inventory';
import Reports from './pages/supervisor/Reports';

import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import UserManagement from './pages/admin/UserManagement';
import LocationManagement from './pages/admin/LocationManagement';

import ProfilePage from './pages/shared/ProfilePage';
import NotificationsPage from './pages/shared/NotificationsPage';

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/login" replace />} />
                
                <Route path="requestor/dashboard" element={<RequestorDashboard />} />
                <Route path="requestor/new-request" element={<NewRequest />} />
                <Route path="requestor/requests" element={<RequestHistory />} />
                
                <Route path="technician/tasks" element={<MyTasks />} />
                <Route path="technician/tasks/:id" element={<TaskDetail />} />
                
                <Route path="supervisor/triage" element={<TriageQueue />} />
                <Route path="supervisor/work-orders" element={<WorkOrderBoard />} />
                <Route path="supervisor/inventory" element={<Inventory />} />
                <Route path="supervisor/reports" element={<Reports />} />
                
                <Route path="admin/analytics" element={<AnalyticsDashboard />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/locations" element={<LocationManagement />} />
                
                <Route path="profile" element={<ProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
