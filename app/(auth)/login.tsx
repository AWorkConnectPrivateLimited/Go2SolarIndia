import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setUser } from '../../src/store/slices/authSlice';
import { authService } from '../../src/services/supabase/auth';

// Demo credentials
const DEMO_USERS = {
  customer: {
    email: 'soudaravi1975@gmail.com',
    password: '12345678',
    role: 'customer' as const,
  },
  agent: {
    email: 'soudaabhinav@gmail.com',
    password: '12345678',
    role: 'agent' as const,
  },
  admin: {
    email: 'abhinavsouda@gmail.com',
    password: '12345678',
    role: 'admin' as const,
  },
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const response = await authService.signIn(email, password);

      if (!response.success) {
        setError(response.error || 'Failed to sign in');
        return;
      }

      if (response.user) {
        dispatch(setUser(response.user));
        
        // Redirect based on role
        switch (response.user.role) {
          case 'admin':
            router.replace('/(admin)/dashboard');
            break;
          case 'agent':
            router.replace('/(agent)/dashboard');
            break;
          case 'customer':
            router.replace('/(customer)/dashboard');
            break;
          default:
            router.replace('/(auth)/login');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'customer' | 'agent' | 'admin') => {
    const demoUser = DEMO_USERS[role];
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>Welcome to Go2Solar</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>Sign in to your account</Text>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          
          {error ? (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          ) : null}
          
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Sign In
          </Button>
          
          <Divider style={styles.divider} />
          
          <View style={styles.links}>
            <Button
              mode="text"
              onPress={() => router.push('/(auth)/register')}
            >
              Create Account
            </Button>
            <Button
              mode="text"
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              Forgot Password?
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 24,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 