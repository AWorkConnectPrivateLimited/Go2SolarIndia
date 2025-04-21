import { supabase } from './supabase/client';
import { User } from '../types/user';

export const usersService = {
  async getAll(): Promise<{ data: User[] | null; error: any }> {
    try {
      console.log('Fetching all users from database...');
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return { data: null, error: new Error('Authentication error: ' + sessionError.message) };
      }
      
      if (!session) {
        console.error('No active session');
        return { data: null, error: new Error('No active session') };
      }
      
      // Check if user has admin role
      const userRole = session.user?.user_metadata?.role;
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
        return { data: null, error };
      }

      if (!data) {
        console.error('No data returned from database');
        return { data: null, error: new Error('No data returned from database') };
      }

      console.log('Raw data from database:', JSON.stringify(data, null, 2));

      // Map the database user to our User type
      const mappedUsers: User[] = data.map(user => {
        console.log('Processing user:', {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        });
        
        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name || '',  // Add fallback for null values
          role: user.role || 'customer',    // Add fallback for null values
          phone: user.phone || '',          // Add fallback for null values
          status: user.status || 'active',  // Use status field directly
          created_at: user.created_at || new Date().toISOString(),  // Add fallback for null values
          updated_at: user.updated_at || new Date().toISOString()   // Add fallback for null values
        };
      });

      console.log(`Successfully mapped ${mappedUsers.length} users`);
      console.log('Final mapped users:', JSON.stringify(mappedUsers, null, 2));
      
      return { data: mappedUsers, error: null };
    } catch (error) {
      console.error('Error in getAll:', error);
      return { data: null, error };
    }
  }
}; 