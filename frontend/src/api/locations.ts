import api from './client';
import { Location, PaginatedResponse } from '../types';

export const getLocations = (params?: any): Promise<PaginatedResponse<Location>> => 
  api.get('/locations', { params });

export const getLocation = (id: number): Promise<Location> => 
  api.get(`/locations/${id}`);

export const createLocation = (data: any): Promise<Location> => 
  api.post('/locations', data);

export const updateLocation = (id: number, data: any): Promise<Location> => 
  api.patch(`/locations/${id}`, data);

export const deleteLocation = (id: number): Promise<void> => 
  api.delete(`/locations/${id}`);
