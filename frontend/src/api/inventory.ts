import api from './client';
import { InventoryItem, PaginatedResponse, InventoryTransaction } from '../types';

export const getInventory = (params?: any): Promise<InventoryItem[]> => 
  api.get('/inventory', { params });

export const getInventoryItem = (id: number): Promise<InventoryItem> => 
  api.get(`/inventory/${id}`);

export const createInventoryItem = (data: any): Promise<InventoryItem> => 
  api.post('/inventory', data);

export const updateInventoryItem = (id: number, data: any): Promise<InventoryItem> => 
  api.patch(`/inventory/${id}`, data);

export const adjustStock = (id: number, quantity: number, reason: string): Promise<InventoryTransaction> => 
  api.post(`/inventory/${id}/adjust`, { quantity_change: quantity, reason });
