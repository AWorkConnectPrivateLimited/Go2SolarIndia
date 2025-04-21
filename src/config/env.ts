import {
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_RAZORPAY_KEY_ID,
  EXPO_PUBLIC_RAZORPAY_KEY_SECRET,
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  EXPO_PUBLIC_APP_ENV,
} from '@env';
import { Platform } from 'react-native';

// Validate required environment variables
const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_APP_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Get app URL based on platform and environment
const getAppUrl = () => {
  if (__DEV__) {
    // Development URLs - use the app scheme for deep linking
    return 'go2solar://';
  }
  // Production URL
  return process.env.EXPO_PUBLIC_APP_URL || 'go2solar://';
};

export const env = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  razorpay: {
    keyId: EXPO_PUBLIC_RAZORPAY_KEY_ID,
    keySecret: EXPO_PUBLIC_RAZORPAY_KEY_SECRET,
  },
  googleMaps: {
    apiKey: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  app: {
    url: getAppUrl(),
    environment: __DEV__ ? 'development' : 'production',
  },
} as const; 