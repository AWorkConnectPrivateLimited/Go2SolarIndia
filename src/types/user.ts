export type UserRole = 'admin' | 'agent' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
} 