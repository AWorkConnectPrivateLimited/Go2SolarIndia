import { supabase } from './client';
import { PostgrestError } from '@supabase/supabase-js';

export class DatabaseError extends Error {
  constructor(message: string, public originalError: PostgrestError) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class BaseDatabaseService {
  protected table: string;

  constructor(table: string) {
    this.table = table;
  }

  async getAll<T>() {
    try {
      console.log(`Fetching all records from ${this.table}...`);
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching data from ${this.table}:`, error);
        throw new DatabaseError(`Failed to fetch data from ${this.table}`, error);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} records from ${this.table}`);
      return data as T[];
    } catch (error) {
      console.error(`Exception in getAll for ${this.table}:`, error);
      throw error;
    }
  }

  async getById<T>(id: string) {
    try {
      console.log(`Fetching record with ID ${id} from ${this.table}...`);
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching record with ID ${id} from ${this.table}:`, error);
        throw new DatabaseError(`Failed to fetch data from ${this.table}`, error);
      }
      
      console.log(`Successfully fetched record with ID ${id} from ${this.table}`);
      return data as T;
    } catch (error) {
      console.error(`Exception in getById for ${this.table}:`, error);
      throw error;
    }
  }

  async create<T>(data: Partial<T>) {
    try {
      console.log(`Creating record in ${this.table}...`);
      const { data: result, error } = await supabase
        .from(this.table)
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error(`Error creating record in ${this.table}:`, error);
        throw new DatabaseError(`Failed to create data in ${this.table}`, error);
      }
      
      console.log(`Successfully created record in ${this.table}`);
      return result as T;
    } catch (error) {
      console.error(`Exception in create for ${this.table}:`, error);
      throw error;
    }
  }

  async update<T>(id: string, data: Partial<T>) {
    try {
      console.log(`Updating record with ID ${id} in ${this.table}...`);
      const { data: result, error } = await supabase
        .from(this.table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating record with ID ${id} in ${this.table}:`, error);
        throw new DatabaseError(`Failed to update data in ${this.table}`, error);
      }
      
      console.log(`Successfully updated record with ID ${id} in ${this.table}`);
      return result as T;
    } catch (error) {
      console.error(`Exception in update for ${this.table}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      console.log(`Deleting record with ID ${id} from ${this.table}...`);
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting record with ID ${id} from ${this.table}:`, error);
        throw new DatabaseError(`Failed to delete data from ${this.table}`, error);
      }
      
      console.log(`Successfully deleted record with ID ${id} from ${this.table}`);
      return true;
    } catch (error) {
      console.error(`Exception in delete for ${this.table}:`, error);
      throw error;
    }
  }

  async getByField<T>(field: string, value: any) {
    try {
      console.log(`Fetching records with ${field}=${value} from ${this.table}...`);
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq(field, value);

      if (error) {
        console.error(`Error fetching records with ${field}=${value} from ${this.table}:`, error);
        throw new DatabaseError(`Failed to fetch data from ${this.table}`, error);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} records with ${field}=${value} from ${this.table}`);
      return data as T[];
    } catch (error) {
      console.error(`Exception in getByField for ${this.table}:`, error);
      throw error;
    }
  }
} 