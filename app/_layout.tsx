import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from '../src/store';
import { DeepLinkHandler } from '../src/components/DeepLinkHandler';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <DeepLinkHandler />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(agent)" />
          <Stack.Screen name="(customer)" />
        </Stack>
      </PaperProvider>
    </StoreProvider>
  );
} 