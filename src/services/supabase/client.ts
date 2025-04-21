import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

if (!env.supabase.url) {
  throw new Error('Missing Supabase URL');
}

if (!env.supabase.anonKey) {
  throw new Error('Missing Supabase Anon Key');
}

console.log('Initializing Supabase client with URL:', env.supabase.url);

export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    url: env.app.url,
  },
});

// Test the connection
supabase.from('users').select('count').then(
  ({ data, error }) => {
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase. User count:', data[0]?.count);
    }
  }
); 