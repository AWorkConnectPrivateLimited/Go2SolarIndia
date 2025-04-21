import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'alert' | 'update' | 'promotion';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export class NotificationsService extends BaseDatabaseService {
  constructor() {
    super('notifications');
  }

  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async getUnreadNotifications(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async markAsRead(id: string) {
    return this.update<Notification>(id, { is_read: true });
  }

  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return data;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) {
    return this.create<Notification>({
      ...notification,
      is_read: false
    });
  }

  async getNotificationsByType(userId: string, type: Notification['type']) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async getRecentNotifications(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  }

  async deleteOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from(this.table)
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;
    return data;
  }
} 