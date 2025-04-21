import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface AgentProfile {
  id: string;
  user_id: string;
  commission_rate: number;
  total_earnings: number;
  performance_rating: number;
  created_at: string;
  updated_at: string;
}

export class AgentProfilesService extends BaseDatabaseService {
  constructor() {
    super('agent_profiles');
  }

  async getAgentProfile(userId: string) {
    return this.getByField<AgentProfile>('user_id', userId);
  }

  async getAgentProfileWithDetails(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        users (
          id,
          full_name,
          email,
          phone,
          profile_image
        ),
        service_requests (
          id,
          type,
          status,
          created_at
        ),
        solar_projects (
          id,
          project_type,
          status,
          capacity_kw,
          estimated_cost
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateCommissionRate(userId: string, commissionRate: number) {
    return this.update<AgentProfile>(userId, { commission_rate: commissionRate });
  }

  async updatePerformanceRating(userId: string, rating: number) {
    return this.update<AgentProfile>(userId, { performance_rating: rating });
  }

  async addEarnings(userId: string, amount: number) {
    const profile = await this.getAgentProfile(userId);
    const newTotal = profile.total_earnings + amount;
    return this.update<AgentProfile>(userId, { total_earnings: newTotal });
  }

  async getAgentStats(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        service_requests!assigned_to (
          id,
          status,
          type
        ),
        solar_projects!customer_id (
          id,
          status,
          project_type
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const stats = {
      totalProjects: 0,
      completedProjects: 0,
      totalServiceRequests: 0,
      resolvedServiceRequests: 0,
      averagePerformanceRating: data.performance_rating,
      totalEarnings: data.total_earnings,
      commissionRate: data.commission_rate
    };

    // Calculate project stats
    data.solar_projects?.forEach(project => {
      stats.totalProjects++;
      if (project.status === 'active') {
        stats.completedProjects++;
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

  async getTopPerformers(limit: number = 10) {
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
      .order('performance_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
} 