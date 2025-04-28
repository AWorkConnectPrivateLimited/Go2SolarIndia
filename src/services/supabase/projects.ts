import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface SolarProject {
  id: string;
  customer_id: string;
  project_type: 'physical' | 'digital';
  status: 'quote' | 'confirmed' | 'installation' | 'active';
  capacity_kw: number;
  estimated_cost: number;
  actual_cost: number | null;
  installation_date: string | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  // Additional quote fields
  monthly_bill: number;
  need_financing: 'yes' | 'no' | 'maybe';
  location: string;
  latitude: number;
  longitude: number;
  space_required: number;
  annual_energy: number;
  annual_savings: number;
  subsidy: number;
  effective_cost: number;
  // Digital solar specific fields
  solar_type?: 'physical' | 'digital';
  state?: string;
  electricity_provider?: string;
  savings_range?: number;
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

  async getProjectById(projectId: string) {
    return this.getById<SolarProject>(projectId);
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

  async updateProjectStatus(projectId: string, status: SolarProject['status']) {
    return this.update<SolarProject>(projectId, { status });
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
    try {
      const { data, error } = await supabase
        .rpc('get_project_stats');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting project stats:', error);
      throw error;
    }
  }
} 