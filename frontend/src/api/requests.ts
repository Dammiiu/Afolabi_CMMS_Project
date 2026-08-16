import api from './client';
import { MaintenanceRequest, PaginatedResponse, TriageResult } from '../types';

export const getRequests = (params?: any): Promise<PaginatedResponse<MaintenanceRequest>> => 
  api.get('/requests', { params });

export const getRequest = (id: number): Promise<MaintenanceRequest> => 
  api.get(`/requests/${id}`);

export const createRequest = (data: any): Promise<MaintenanceRequest> => 
  api.post('/requests', data);

export const updateRequest = (id: number, data: any): Promise<MaintenanceRequest> => 
  api.patch(`/requests/${id}`, data);

export const triageRequest = (id: number, data: any): Promise<MaintenanceRequest> => 
  api.patch(`/requests/${id}/triage`, data);

export const uploadPhoto = (id: number, file: File): Promise<MaintenanceRequest> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/requests/${id}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
