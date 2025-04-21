import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface CustomerProfile {
  id: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  electricity_provider: string;
  average_bill: number;
  created_at: string;
  updated_at: string;
}

export class CustomerProfilesService extends BaseDatabaseService {
  constructor() {
    super('customer_profiles');
  }

  async getCustomerProfile(userId: string) {
    return this.getByField<CustomerProfile>('user_id', userId);
  }

  async getCustomerProfileWithDetails(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        users (
          id,
          full_name,
          email,
          phone,
          profile_image,
          kyc_status
        ),
        solar_projects (
          id,
          project_type,
          status,
          capacity_kw,
          estimated_cost,
          installation_date
        ),
        service_requests (
          id,
          type,
          status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, profile: Partial<CustomerProfile>) {
    return this.update<CustomerProfile>(userId, profile);
  }

  async getCustomersByCity(city: string) {
    return this.getByField<CustomerProfile>('city', city);
  }

  async getCustomersByState(state: string) {
    return this.getByField<CustomerProfile>('state', state);
  }

  async getCustomerStats(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        solar_projects (
          id,
          status,
          project_type,
          capacity_kw,
          estimated_cost
        ),
        service_requests (
          id,
          status,
          type
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const stats = {
      totalProjects: 0,
      activeProjects: 0,
      totalServiceRequests: 0,
      resolvedServiceRequests: 0,
      averageBillAmount: data.average_bill,
      totalInvestment: 0
    };

    // Calculate project stats
    data.solar_projects?.forEach(project => {
      stats.totalProjects++;
      if (project.status === 'active') {
        stats.activeProjects++;
        stats.totalInvestment += project.estimated_cost;
      }
    });

    // Calculate service request stats
    data.service_requests?.forEach(request => {
      stats.totalServiceRequests++;
      if (request.status === 'resolved') {
        stats.resolvedServiceRequests++;
      }
    });

    return stats;
  }

  async searchCustomers(query: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        users (
          id,
          full_name,
          email,
          phone
        )
      `)
      .or(`city.ilike.%${query}%,state.ilike.%${query}%,pincode.ilike.%${query}%`);

    if (error) throw error;
    return data;
  }
} 