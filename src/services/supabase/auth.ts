import { supabase } from './client';
import { AuthError } from '@supabase/supabase-js';
import { env } from '../../config/env';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'agent' | 'admin';
  };
  session?: any;
}

// Simple password hashing function that works in React Native
function hashPassword(password: string): string {
  // This is a simple hashing approach - in production, use a proper crypto library
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16) + password.length;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'No user data returned'
        };
      }

      // Get user role from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        return {
          success: false,
          error: userError.message
        };
      }

      if (!userData) {
        return {
          success: false,
          error: 'No user data found'
        };
      }

      // Update user metadata with role
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: userData.role }
      });

      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }

      // Refresh the session to get the updated JWT token
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();

      if (sessionError) {
        return {
          success: false,
          error: sessionError.message
        };
      }

      // Verify the role is set in the JWT token
      const { data: { user: updatedUser }, error: verifyError } = await supabase.auth.getUser();
      
      if (verifyError || !updatedUser) {
        return {
          success: false,
          error: verifyError?.message || 'Failed to verify user role'
        };
      }

      console.log('User role in JWT:', updatedUser.user_metadata?.role);
      console.log('User role in database:', userData.role);

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: userData.role,
        },
        session: sessionData.session,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  async signUp(
    email: string, 
    password: string, 
    role: 'customer' | 'agent',
    fullName: string = '',
    phone: string = ''
  ): Promise<AuthResponse> {
    try {
      const passwordHash = hashPassword(password);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            phone: phone,
            password_hash: passwordHash,
            is_active: true
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        return { success: false, error: 'No user data returned' };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          role,
        },
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError.message,
      };
    }
  },

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: authError.message,
      };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (!user) {
        return { success: false, error: 'No user found' };
      }

      // Get user role from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email!,
          role: userData.role,
        },
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  resetPassword: async (email: string) => {
    try {
      // Use a more specific path for password reset
      const redirectUrl = 'https://go2solar.netlify.app/reset-password';
      
      console.log('Reset password redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Supabase reset password error:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password' 
      };
    }
  },

  updatePassword: async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Updating password...');
      
      // First check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        return { 
          success: false, 
          error: 'Authentication error. Please try the password reset link again.' 
        };
      }
      
      if (!user) {
        console.error('No authenticated user found');
        return { 
          success: false, 
          error: 'No authenticated user found. Please try the password reset link again.' 
        };
      }
      
      console.log('User authenticated, proceeding with password update');
      
      // Hash the password
      const passwordHash = hashPassword(newPassword);
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { password_hash: passwordHash }
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }

      console.log('Password updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
};

// Helper function to get local IP address
async function getLocalIPAddress(): Promise<string> {
  try {
    // For development, use localhost
    if (__DEV__) {
      return 'localhost';
    }
    
    // For production, you might want to use a different approach
    // This is a placeholder - in a real app, you'd need a more robust solution
    return 'localhost';
  } catch (error) {
    console.error('Error getting local IP:', error);
    return 'localhost';
  }
} 