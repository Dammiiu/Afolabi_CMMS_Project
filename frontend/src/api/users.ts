import api from './client';
import { User, PaginatedResponse } from '../types';

export const getUsers = (params?: { role?: string; skip?: number; limit?: number }): Promise<PaginatedResponse<User>> => {
  return api.get('/users', { params });
};

export const getUser = (id: number): Promise<User> => 
  api.get(`/users/${id}`);

export const createUser = (data: any): Promise<User> => 
  api.post('/users', data);

export const updateUser = (id: number, data: any): Promise<User> => 
  api.patch(`/users/${id}`, data);

export const deleteUser = (id: number): Promise<void> => 
  api.delete(`/users/${id}`);
