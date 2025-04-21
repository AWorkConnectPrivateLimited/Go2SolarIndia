import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface RoleWithUserCount extends Role {
  user_count: number;
}

export class RolesService extends BaseDatabaseService {
  constructor() {
    super('roles');
  }

  async getRolesWithUserCount(): Promise<RoleWithUserCount[]> {
    // First, get all roles
    const { data: roles, error: rolesError } = await supabase
      .from(this.table)
      .select('*');

    if (rolesError) throw rolesError;

    // Then, get user count for each role
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', role.name.toLowerCase());

        if (countError) throw countError;

        return {
          ...role,
          user_count: count || 0,
        };
      })
    );

    return rolesWithCount as RoleWithUserCount[];
  }

  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    return this.create<Role>(roleData);
  }

  async updateRole(id: string, roleData: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>): Promise<Role> {
    return this.update<Role>(id, roleData);
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getRoleById(id: string): Promise<Role> {
    return this.getById<Role>(id);
  }

  async searchRoles(query: string): Promise<RoleWithUserCount[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) throw error;

    // Get user count for each role
    const rolesWithCount = await Promise.all(
      data.map(async (role) => {
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', role.name.toLowerCase());

        if (countError) throw countError;

        return {
          ...role,
          user_count: count || 0,
        };
      })
    );

    return rolesWithCount as RoleWithUserCount[];
  }
} 