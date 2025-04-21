import { Stack, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme, Menu } from 'react-native-paper';
import { useState } from 'react';

export default function AgentLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const theme = useTheme();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  
  // Redirect to login if not authenticated or not an agent
  if (!user || user.role !== 'agent') {
    return <Redirect href="/(auth)/login" />;
  }

  const handleLogout = () => {
    // Add logout logic here
    router.push('/(auth)/login');
  };

  const handleViewProfile = () => {
    // Add view profile logic here
    router.push('/(agent)/profile');
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
        <Text style={styles.headerTitle}>Go2Solar Agent</Text>
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
            title: 'Agent Dashboard',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="customers"
          options={{
            title: 'Customers',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="reports"
          options={{
            title: 'Reports',
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
} 