import api from './client';
import { AuthResponse, User } from '../types';

export const login = (data: any): Promise<AuthResponse> => {
  const params = new URLSearchParams();
  params.append('username', data.email);
  params.append('password', data.password);
  return api.post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
export const register = (data: any): Promise<AuthResponse> => api.post('/auth/register', data);
export const getMe = (): Promise<User> => api.get('/auth/me');
export const updateProfile = (data: any): Promise<User> => api.put('/auth/profile', data);
