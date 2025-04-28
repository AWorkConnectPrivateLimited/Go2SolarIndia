import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the auth flow by default
  return <Redirect href="/(auth)/login" />;
} 