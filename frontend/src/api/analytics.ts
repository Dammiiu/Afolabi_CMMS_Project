import api from './client';
import { 
  AnalyticsOverview, 
  CategoryCount, 
  TechnicianWorkload, 
  ResponseTimeTrend, 
  MonthlyTrend 
} from '../types';

export const getOverview = (): Promise<AnalyticsOverview> => 
  api.get('/analytics/overview');

export const getRequestsByCategory = (): Promise<CategoryCount[]> => 
  api.get('/analytics/by-category');

export const getRequestsByLocation = (): Promise<{location_name: string, count: number}[]> => 
  api.get('/analytics/by-location');

export const getTechnicianWorkload = (): Promise<TechnicianWorkload[]> => 
  api.get('/analytics/technician-workload');

export const getResponseTimeTrends = (): Promise<ResponseTimeTrend[]> => 
  api.get('/analytics/response-time-trend');

export const getMonthlyTrends = (): Promise<MonthlyTrend[]> => 
  api.get('/analytics/monthly-trend');
