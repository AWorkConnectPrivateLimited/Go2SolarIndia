export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string
          role: 'customer' | 'agent' | 'admin'
          full_name: string
          created_at: string
          updated_at: string
          kyc_status: 'pending' | 'verified' | 'rejected'
          profile_image: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          phone: string
          role: 'customer' | 'agent' | 'admin'
          full_name: string
          created_at?: string
          updated_at?: string
          kyc_status?: 'pending' | 'verified' | 'rejected'
          profile_image?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          phone?: string
          role?: 'customer' | 'agent' | 'admin'
          full_name?: string
          created_at?: string
          updated_at?: string
          kyc_status?: 'pending' | 'verified' | 'rejected'
          profile_image?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          id: string
          user_id: string
          address: string
          city: string
          state: string
          pincode: string
          electricity_provider: string
          average_bill: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          city: string
          state: string
          pincode: string
          electricity_provider: string
          average_bill: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          city?: string
          state?: string
          pincode?: string
          electricity_provider?: string
          average_bill?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      solar_projects: {
        Row: {
          id: string
          customer_id: string
          project_type: 'physical' | 'digital'
          status: 'quote' | 'confirmed' | 'installation' | 'active'
          capacity_kw: number
          estimated_cost: number
          actual_cost: number | null
          installation_date: string | null
          completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          project_type: 'physical' | 'digital'
          status: 'quote' | 'confirmed' | 'installation' | 'active'
          capacity_kw: number
          estimated_cost: number
          actual_cost?: number | null
          installation_date?: string | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          project_type?: 'physical' | 'digital'
          status?: 'quote' | 'confirmed' | 'installation' | 'active'
          capacity_kw?: number
          estimated_cost?: number
          actual_cost?: number | null
          installation_date?: string | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solar_projects_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      service_requests: {
        Row: {
          id: string
          customer_id: string
          project_id: string
          type: 'maintenance' | 'repair' | 'inspection'
          status: 'open' | 'assigned' | 'in_progress' | 'resolved'
          description: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          project_id: string
          type: 'maintenance' | 'repair' | 'inspection'
          status: 'open' | 'assigned' | 'in_progress' | 'resolved'
          description: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          project_id?: string
          type?: 'maintenance' | 'repair' | 'inspection'
          status?: 'open' | 'assigned' | 'in_progress' | 'resolved'
          description?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "solar_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      digital_wallet: {
        Row: {
          id: string
          user_id: string
          balance: number
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_wallet_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wallet_transactions: {
        Row: {
          id: string
          wallet_id: string
          amount: number
          type: 'credit' | 'debit'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          amount: number
          type: 'credit' | 'debit'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          amount?: number
          type?: 'credit' | 'debit'
          description?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            referencedRelation: "digital_wallet"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          status: 'pending' | 'completed' | 'failed'
          reward_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          status: 'pending' | 'completed' | 'failed'
          reward_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          status?: 'pending' | 'completed' | 'failed'
          reward_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_profiles: {
        Row: {
          id: string
          user_id: string
          commission_rate: number
          total_earnings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          commission_rate: number
          total_earnings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          commission_rate?: number
          total_earnings?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'alert' | 'update' | 'promotion'
          title: string
          message: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'alert' | 'update' | 'promotion'
          title: string
          message: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'alert' | 'update' | 'promotion'
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'agent' | 'admin'
      kyc_status: 'pending' | 'verified' | 'rejected'
      project_type: 'physical' | 'digital'
      project_status: 'quote' | 'confirmed' | 'installation' | 'active'
      service_type: 'maintenance' | 'repair' | 'inspection'
      service_status: 'open' | 'assigned' | 'in_progress' | 'resolved'
      transaction_type: 'credit' | 'debit'
      referral_status: 'pending' | 'completed' | 'failed'
      notification_type: 'alert' | 'update' | 'promotion'
    }
  }
} 