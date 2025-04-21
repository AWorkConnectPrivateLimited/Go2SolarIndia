import { Stack, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme, Menu } from 'react-native-paper';
import { useState } from 'react';

export default function CustomerLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const theme = useTheme();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  
  // Redirect to login if not authenticated or not a customer
  if (!user || user.role !== 'customer') {
    return <Redirect href="/(auth)/login" />;
  }

  const handleLogout = () => {
    // Add logout logic here
    router.push('/(auth)/login');
  };

  const handleViewProfile = () => {
    // Add view profile logic here
    router.push('/(customer)/profile');
  };

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerTitle: {
      fontWeight: 'bold',
      fontSize: 18,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  return (
    <>
      <StatusBar style="dark" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Go2Solar Customer</Text>
        <View style={styles.headerActions}>
          <Menu
            visible={profileMenuVisible}
            onDismiss={() => setProfileMenuVisible(false)}
            anchor={
              <IconButton
                icon="account-circle"
                size={24}
                onPress={() => setProfileMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setProfileMenuVisible(false);
                handleViewProfile();
              }}
              title="View Profile"
              leadingIcon="account"
            />
            <Menu.Item
              onPress={() => {
                setProfileMenuVisible(false);
                handleLogout();
              }}
              title="Logout"
              leadingIcon="logout"
            />
          </Menu>
        </View>
      </View>
      <Stack>
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="quote"
          options={{
            title: 'Get Quote',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="projects"
          options={{
            title: 'My Projects',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="wallet"
          options={{
            title: 'Digital Wallet',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="support"
          options={{
            title: 'Support',
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
} 