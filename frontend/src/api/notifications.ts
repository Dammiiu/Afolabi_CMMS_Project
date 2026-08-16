import api from './client';
import { Notification, PaginatedResponse } from '../types';

export const getNotifications = (params?: any): Promise<PaginatedResponse<Notification>> => 
  api.get('/notifications', { params });

export const markAsRead = (id: number): Promise<void> => 
  api.patch(`/notifications/${id}/read`);

export const markAllAsRead = (): Promise<void> => 
  api.patch('/notifications/read-all');
