import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface ServiceRequest {
  id: string;
  customer_id: string;
  project_id: string;
  type: 'maintenance' | 'repair' | 'inspection';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved';
  description: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export class ServiceRequestsService extends BaseDatabaseService {
  constructor() {
    super('service_requests');
  }

  async getRequestsByStatus(status: ServiceRequest['status']) {
    return this.getByField<ServiceRequest>('status', status);
  }

  async getRequestsByType(type: ServiceRequest['type']) {
    return this.getByField<ServiceRequest>('type', type);
  }

  async getCustomerRequests(customerId: string) {
    return this.getByField<ServiceRequest>('customer_id', customerId);
  }

  async getAssignedRequests(agentId: string) {
    return this.getByField<ServiceRequest>('assigned_to', agentId);
  }

  async getRequestsWithDetails() {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        users!customer_id (
          id,
          full_name,
          email,
          phone
        ),
        users!assigned_to (
          id,
          full_name,
          email,
          phone
        ),
        solar_projects (
          id,
          project_type,
          capacity_kw,
          installation_date
        )
      `);

    if (error) throw error;
    return data;
  }

  async updateRequestStatus(id: string, status: ServiceRequest['status']) {
    return this.update<ServiceRequest>(id, { status });
  }

  async assignRequest(id: string, agentId: string) {
    return this.update<ServiceRequest>(id, { 
      assigned_to: agentId,
      status: 'assigned'
    });
  }

  async getRequestsByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;
    return data as ServiceRequest[];
  }

  async getRequestStats() {
    const { data, error } = await supabase
      .from(this.table)
      .select('status, type, count')
      .select('*', { count: 'exact' })
      .group('status, type');

    if (error) throw error;
    return data;
  }
} 