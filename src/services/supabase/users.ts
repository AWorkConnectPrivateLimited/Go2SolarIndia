import { BaseDatabaseService } from './database';
import { supabase } from './client';
import { User, UserFormData } from '../../types/user';
import { Database } from '../../types/database.types';

type DatabaseUser = Database['public']['Tables']['users']['Row'];

const mapDatabaseUserToUser = (dbUser: DatabaseUser): User => {
  console.log('Mapping database user:', {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status
  });
  
  return {
    id: dbUser.id,
    email: dbUser.email,
    full_name: dbUser.full_name || '',
    role: dbUser.role || 'customer',
    phone: dbUser.phone || '',
    status: dbUser.status || 'active',
    created_at: dbUser.created_at || new Date().toISOString(),
    updated_at: dbUser.updated_at || new Date().toISOString()
  };
};

const mapUserToDatabaseUser = (user: UserFormData): Partial<DatabaseUser> => ({
  email: user.email,
  full_name: user.full_name,
  role: user.role,
  phone: user.phone,
  is_active: user.status === 'active'
});

export class UsersService extends BaseDatabaseService {
  constructor() {
    super('users');
  }

  async getUsersByRole(role: User['role']) {
    const users = await this.getByField<DatabaseUser>('role', role);
    return users.map(mapDatabaseUserToUser);
  }

  async getActiveUsers() {
    const users = await this.getByField<DatabaseUser>('is_active', true);
    return users.map(mapDatabaseUserToUser);
  }

  async updateUserStatus(id: string, status: User['status']) {
    const is_active = status === 'active';
    return this.update<DatabaseUser>(id, { is_active }).then(mapDatabaseUserToUser);
  }

  async updateKycStatus(id: string, kyc_status: DatabaseUser['kyc_status']) {
    return this.update<DatabaseUser>(id, { kyc_status }).then(mapDatabaseUserToUser);
  }

  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);

    if (error) throw error;
    return (data as DatabaseUser[]).map(mapDatabaseUserToUser);
  }

  async getUsersWithProfile() {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        customer_profiles (*),
        agent_profiles (*)
      `);

    if (error) throw error;
    return (data as DatabaseUser[]).map(mapDatabaseUserToUser);
  }

  async createUser(userData: UserFormData & { id: string }): Promise<{ data: User; error: null } | { data: null; error: Error }> {
    try {
      const { data, error } = await this.create(userData);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error: error as Error };
    }
  }

  async updateUser(userId: string, updates: Partial<UserFormData>): Promise<{ data: User; error: null } | { data: null; error: Error }> {
    try {
      const { data, error } = await this.update(userId, updates);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error: error as Error };
    }
  }

  async getAll(): Promise<{ data: User[]; error: null } | { data: null; error: Error }> {
    try {
      console.log('Fetching all users from database...');
      
      // First check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        return { data: null, error: new Error('Authentication error: ' + sessionError.message) };
      }
      
      if (!sessionData.session) {
        console.error('No active session');
        return { data: null, error: new Error('No active session') };
      }
      
      // Check if user has admin role
      const userRole = sessionData.session.user?.user_metadata?.role;
      console.log('Current user role:', userRole);
      
      if (userRole !== 'admin') {
        console.error('User is not an admin');
        return { data: null, error: new Error('Unauthorized: User is not an admin') };
      }
      
      // Use the new function to get all users
      const { data, error } = await supabase
        .rpc('get_all_users');
      
      if (error) {
        console.error('Error fetching users:', error);
        return { data: null, error: new Error('Error fetching users: ' + error.message) };
      }

      if (!data) {
        console.error('No data returned from database');
        return { data: null, error: new Error('No data returned from database') };
      }

      console.log('Raw data from database:', JSON.stringify(data, null, 2));
      console.log('Successfully fetched users:', data.length);
      
      const mappedUsers = data.map(mapDatabaseUserToUser);
      console.log('Mapped users:', mappedUsers.length);
      console.log('Final mapped users:', JSON.stringify(mappedUsers, null, 2));
      
      return { 
        data: mappedUsers, 
        error: null 
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
    }
  }

  async getUserById(userId: string): Promise<{ data: User; error: null } | { data: null; error: Error }> {
    try {
      const { data, error } = await this.getById(userId);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { data: null, error: error as Error };
    }
  }

  async deleteUser(userId: string): Promise<{ data: null; error: null } | { data: null; error: Error }> {
    try {
      const { error } = await this.delete(userId);
      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { data: null, error: error as Error };
    }
  }

  async getById(id: string): Promise<User> {
    const dbUser = await this.getById<DatabaseUser>(id);
    return mapDatabaseUserToUser(dbUser);
  }

  async getByEmail(email: string): Promise<User | null> {
    const dbUser = await this.getByField<DatabaseUser>('email', email);
    return dbUser ? mapDatabaseUserToUser(dbUser) : null;
  }
}

export const usersService = new UsersService(); 