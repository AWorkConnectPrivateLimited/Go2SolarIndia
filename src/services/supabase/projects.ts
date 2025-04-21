import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface SolarProject {
  id: string;
  customer_id: string;
  project_type: 'physical' | 'digital';
  status: 'quote' | 'confirmed' | 'installation' | 'active';
  capacity_kw: number;
  estimated_cost: number;
  actual_cost: number;
  installation_date: string;
  completion_date: string;
  created_at: string;
  updated_at: string;
}

export class ProjectsService extends BaseDatabaseService {
  constructor() {
    super('solar_projects');
  }

  async getProjectsByStatus(status: SolarProject['status']) {
    return this.getByField<SolarProject>('status', status);
  }

  async getProjectsByType(type: SolarProject['project_type']) {
    return this.getByField<SolarProject>('project_type', type);
  }

  async getCustomerProjects(customerId: string) {
    return this.getByField<SolarProject>('customer_id', customerId);
  }

  async getProjectsWithDetails() {
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
        energy_consumption (
          id,
          date,
          consumption_kwh,
          generation_kwh,
          battery_level
        ),
        service_requests (
          id,
          type,
          status,
          description
        )
      `);

    if (error) throw error;
    return data;
  }

  async updateProjectStatus(id: string, status: SolarProject['status']) {
    return this.update<SolarProject>(id, { status });
  }

  async getProjectsByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;
    return data as SolarProject[];
  }

  async getProjectStats() {
    const { data, error } = await supabase
      .from(this.table)
      .select('status, project_type, count')
      .select('*', { count: 'exact' })
      .group('status, project_type');

    if (error) throw error;
    return data;
  }
} 