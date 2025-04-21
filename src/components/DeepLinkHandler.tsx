import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase/client';

export function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('Deep link received:', url);
      
      // Handle password reset deep links
      if (url.includes('reset-password') || url.includes('go2solar.netlify.app')) {
        console.log('Reset password deep link detected');
        
        try {
          // Parse the URL to extract parameters
          const urlObj = new URL(url);
          console.log('URL parsed successfully:', urlObj.toString());
          console.log('URL search params:', Object.fromEntries(urlObj.searchParams.entries()));
          
          // Check for token parameter (Supabase format)
          const token = urlObj.searchParams.get('token');
          console.log('Token from URL:', token);
          
          if (token) {
            console.log('Token found in URL, attempting to verify...');
            try {
              // Set the token in Supabase
              const { error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'recovery'
              });
              
              if (error) {
                console.error('Error verifying token:', error);
                router.push('/(auth)/login');
              } else {
                console.log('Token verified successfully, redirecting to reset password screen');
                router.push('/(auth)/reset-password');
              }
            } catch (verifyError) {
              console.error('Exception during token verification:', verifyError);
              router.push('/(auth)/login');
            }
          } else {
            console.log('No token found in URL, checking if user is already authenticated');
            // If no token, check if user is already authenticated
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (!error && user) {
              console.log('User already authenticated, redirecting to reset password screen');
              router.push('/(auth)/reset-password');
            } else {
              console.log('No authenticated user, redirecting to login');
              router.push('/(auth)/login');
            }
          }
        } catch (error) {
          console.error('Error parsing URL:', error);
          router.push('/(auth)/login');
        }
      }
      
      // Handle login redirects from web page
      if (url.includes('login')) {
        console.log('Login deep link detected');
        router.push('/(auth)/login');
      }
    };

    // Handle deep link if app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link if app was opened from URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL detected:', url);
        handleDeepLink({ url });
      } else {
        console.log('No initial URL found');
      }
    });

    return () => {
      // Clean up subscription
      subscription.remove();
    };
  }, [router]);

  return null;
} 