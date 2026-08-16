export type UserRole = 'requestor' | 'technician' | 'supervisor' | 'admin';
export type RequestStatus = 'submitted' | 'triaged' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'closed';
export type WorkOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'closed';
export type RequestCategory = 'electrical' | 'plumbing' | 'hvac' | 'structural' | 'it' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type BuildingType = 'hostel' | 'lab' | 'admin_block' | 'academic_block' | 'faculty';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department: string | null;
  skill_tags: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: number;
  name: string;
  building_type: BuildingType;
  block: string | null;
  room: string | null;
}

export interface MaintenanceRequest {
  id: number;
  requestor_id: number;
  location_id: number;
  category: RequestCategory;
  description: string;
  priority: Priority;
  status: RequestStatus;
  photo_attachment: string | null;
  submitted_at: string;
  updated_at: string;
  requestor?: User;
  location?: Location;
  work_orders?: WorkOrder[];
}

export interface WorkOrder {
  id: number;
  request_id: number;
  assigned_technician_id: number | null;
  created_by: number;
  status: WorkOrderStatus;
  scheduled_date: string | null;
  priority: Priority;
  notes: string | null;
  created_at: string;
  updated_at: string;
  request?: MaintenanceRequest;
  technician?: User;
  creator?: User;
  maintenance_record?: MaintenanceRecord;
}

export interface MaintenanceRecord {
  id: number;
  work_order_id: number;
  technician_id: number;
  completion_notes: string | null;
  parts_used: { inventory_item_id: number; name: string; quantity: number }[] | null;
  time_spent_minutes: number | null;
  completed_at: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity_in_stock: number;
  reorder_threshold: number;
}

export interface InventoryTransaction {
  id: number;
  inventory_item_id: number;
  work_order_id: number | null;
  quantity_used: number;
  logged_by: number;
  logged_at: string;
  item?: InventoryItem;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  related_request_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  timestamp: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AnalyticsOverview {
  total_requests: number;
  open_requests: number;
  completed_requests: number;
  avg_response_time_hours: number;
  completion_rate_percent: number;
  active_work_orders: number;
  total_technicians: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface TechnicianWorkload {
  technician_name: string;
  active_orders: number;
  completed_orders: number;
}

export interface ResponseTimeTrend {
  month: string;
  avg_response_hours: number;
}

export interface MonthlyTrend {
  month: string;
  submitted: number;
  completed: number;
}

export interface TechnicianScore {
  technician_id: number;
  technician_name: string;
  skill_match_score: number;
  workload_score: number;
  total_score: number;
}

export interface TriageResult {
  suggested_priority: Priority;
  is_duplicate: boolean;
  duplicate_request_id: number | null;
  priority_reason: string;
}
