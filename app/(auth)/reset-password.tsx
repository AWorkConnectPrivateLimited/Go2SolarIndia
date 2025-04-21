import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { authService } from '../../src/services/supabase/auth';
import { supabase } from '../../src/services/supabase/client';

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated when screen loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth check error:', error);
          setError('Authentication error. Please try the password reset link again.');
          return;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          setError('No authenticated user found. Please try the password reset link again.');
          return;
        }
        
        console.log('User authenticated:', user.id);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    };
    
    checkAuth();
  }, []);

  const validateForm = () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Updating password...');
      const { error } = await authService.updatePassword(newPassword);

      if (error) {
        console.error('Password update error:', error);
        setError(error);
        return;
      }

      console.log('Password updated successfully');
      // Redirect to login page after successful password reset
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Set New Password
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your new password below
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            disabled={loading || !isAuthenticated}
          />

          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            disabled={loading || !isAuthenticated}
          />

          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading || !isAuthenticated}
            style={styles.button}
          >
            Reset Password
          </Button>
          
          {!isAuthenticated && (
            <Button
              mode="outlined"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.button}
            >
              Back to Login
            </Button>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
}); 