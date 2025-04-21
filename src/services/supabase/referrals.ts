import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'failed';
  reward_amount: number;
  created_at: string;
  updated_at: string;
}

export class ReferralsService extends BaseDatabaseService {
  constructor() {
    super('referrals');
  }

  async getUserReferrals(userId: string) {
    return this.getByField<Referral>('referrer_id', userId);
  }

  async getReferralByReferredId(referredId: string) {
    return this.getByField<Referral>('referred_id', referredId);
  }

  async getReferralsWithDetails() {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        users!referrer_id (
          id,
          full_name,
          email,
          phone
        ),
        users!referred_id (
          id,
          full_name,
          email,
          phone
        )
      `);

    if (error) throw error;
    return data;
  }

  async updateReferralStatus(id: string, status: Referral['status']) {
    return this.update<Referral>(id, { status });
  }

  async getReferralStats(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('status, count, reward_amount')
      .eq('referrer_id', userId)
      .select('*', { count: 'exact' })
      .group('status');

    if (error) throw error;

    const stats = {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      failedReferrals: 0,
      totalRewards: 0
    };

    data.forEach(record => {
      stats.totalReferrals += record.count;
      if (record.status === 'completed') {
        stats.completedReferrals = record.count;
        stats.totalRewards += record.reward_amount;
      } else if (record.status === 'pending') {
        stats.pendingReferrals = record.count;
      } else if (record.status === 'failed') {
        stats.failedReferrals = record.count;
      }
    });

    return stats;
  }

  async getReferralsByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;
    return data as Referral[];
  }
} 