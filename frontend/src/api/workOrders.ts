import api from './client';
import { WorkOrder, PaginatedResponse, TechnicianScore } from '../types';

export const getWorkOrders = (params?: any): Promise<PaginatedResponse<WorkOrder>> => 
  api.get('/work-orders', { params });

export const getWorkOrder = (id: number): Promise<WorkOrder> => 
  api.get(`/work-orders/${id}`);

export const createWorkOrder = (data: any): Promise<WorkOrder> => 
  api.post('/work-orders', data);

export const updateWorkOrder = (id: number, data: any): Promise<WorkOrder> => 
  api.patch(`/work-orders/${id}`, data);

export const assignWorkOrder = (id: number, technician_id: number): Promise<WorkOrder> => 
  api.post(`/work-orders/${id}/assign`, { technician_id });

export const suggestTechnician = (category: string): Promise<TechnicianScore[]> => 
  api.get('/users/technicians/available', { params: { category } });

export const startWorkOrder = (id: number): Promise<WorkOrder> => 
  api.patch(`/work-orders/${id}/start`);

export const completeWorkOrder = (id: number, data: any): Promise<WorkOrder> => 
  api.patch(`/work-orders/${id}/complete`, data);
