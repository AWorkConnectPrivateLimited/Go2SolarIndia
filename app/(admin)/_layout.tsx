import { Stack, useRouter, usePathname } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { Redirect } from 'expo-router';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Text, IconButton, Divider, useTheme, Surface, Menu, Badge } from 'react-native-paper';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

// Quick action modules for the sidebar
const quickActionModules = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'view-dashboard',
    route: '/(admin)/dashboard',
  },
  {
    id: 'users',
    title: 'Users & Roles',
    icon: 'account-group',
    route: '/(admin)/users',
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: 'solar-power',
    route: '/(admin)/projects',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: 'chart-bar',
    route: '/(admin)/analytics',
  },
  {
    id: 'chatbot',
    title: 'Chatbot',
    icon: 'robot',
    route: '/(admin)/chatbot',
  },
  {
    id: 'workflow',
    title: 'Workflow',
    icon: 'workflow',
    route: '/(admin)/workflow',
  },
  {
    id: 'insights',
    title: 'AI Insights',
    icon: 'lightbulb',
    route: '/(admin)/insights',
  },
  {
    id: 'inverters',
    title: 'Inverters',
    icon: 'power-plug',
    route: '/(admin)/inverters',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: 'connection',
    route: '/(admin)/integrations',
  },
  {
    id: 'logs',
    title: 'System Logs',
    icon: 'file-document',
    route: '/(admin)/logs',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    icon: 'wrench',
    route: '/(admin)/maintenance',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'cog',
    route: '/(admin)/settings',
  },
  {
    id: 'agents',
    title: 'Agents',
    icon: 'account-hard-hat',
    route: '/(admin)/agents',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    icon: 'wallet',
    route: '/(admin)/wallet',
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: 'cash-multiple',
    route: '/(admin)/payments',
  },
  {
    id: 'referrals',
    title: 'Referrals',
    icon: 'account-multiple',
    route: '/(admin)/referrals',
  },
  {
    id: 'geofencing',
    title: 'Geofencing',
    icon: 'map-marker-radius',
    route: '/(admin)/geofencing',
  },
  {
    id: 'support',
    title: 'Support',
    icon: 'help-circle',
    route: '/(admin)/support',
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: 'bullhorn',
    route: '/(admin)/marketing',
  },
  {
    id: 'service-requests',
    title: 'Service Requests',
    icon: 'clipboard-list',
    route: '/(admin)/service-requests',
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'file-chart',
    route: '/(admin)/reports',
  },
  {
    id: 'energy',
    title: 'Energy',
    icon: 'lightning-bolt',
    route: '/(admin)/energy',
  },
  {
    id: 'sundaygrids',
    title: 'SundayGrids',
    icon: 'grid',
    route: '/(admin)/sundaygrids',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'bell',
    route: '/(admin)/notifications',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: 'wrench-cog',
    route: '/(admin)/troubleshooting',
  },
];

export default function AdminLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [collapsed, setCollapsed] = useState(width < 768);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [notificationMenuVisible, setNotificationMenuVisible] = useState(false);
  
  // Mock notification count - replace with actual data
  const notificationCount = 3;
  
  // Redirect to login if not authenticated or not an admin
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(auth)/login" />;
  }

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navigateTo = (route: string) => {
    router.push(route);
    // Auto-collapse sidebar on mobile after navigation
    if (width < 768) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    router.push('/(auth)/login');
  };

  const handleViewProfile = () => {
    // Add view profile logic here
    router.push('/(admin)/profile');
  };

  const handleViewNotifications = () => {
    // Add view notifications logic here
    router.push('/(admin)/notifications');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: width < 768 ? 'column' : 'row',
    },
    sidebar: {
      width: width < 768 ? '100%' : (collapsed ? 60 : 240),
      height: width < 768 ? (collapsed ? 60 : 'auto') : '100%',
      backgroundColor: theme.colors.surface,
      borderRightWidth: width < 768 ? 0 : 1,
      borderBottomWidth: width < 768 ? 1 : 0,
      borderRightColor: theme.colors.outlineVariant,
      borderBottomColor: theme.colors.outlineVariant,
      transition: 'width 0.3s ease',
    },
    content: {
      flex: 1,
      width: width < 768 ? '100%' : undefined,
    },
    sidebarHeader: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sidebarTitle: {
      fontWeight: 'bold',
      fontSize: 18,
    },
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      paddingHorizontal: 16,
    },
    sidebarItemText: {
      marginLeft: 12,
      flex: 1,
    },
    sidebarItemCollapsed: {
      justifyContent: 'center',
    },
    sidebarItemActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    sidebarItemActiveText: {
      color: theme.colors.primary,
    },
    sidebarFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userName: {
      marginLeft: 8,
      fontWeight: 'bold',
      flex: 1,
    },
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
    notificationBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: theme.colors.error,
    },
    notificationIcon: {
      marginRight: 8,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />
      <Surface style={styles.sidebar} elevation={1}>
        <View style={styles.sidebarHeader}>
          {!collapsed && <Text style={styles.sidebarTitle}>Go2Solar Admin</Text>}
          <IconButton 
            icon={collapsed ? 'menu' : 'menu-open'} 
            size={24} 
            onPress={toggleSidebar} 
          />
        </View>
        
        <Divider />
        
        <ScrollView>
          {quickActionModules.map((module) => (
            <View 
              key={module.id}
              style={[
                styles.sidebarItem,
                collapsed && styles.sidebarItemCollapsed,
                pathname === module.route && styles.sidebarItemActive
              ]}
              onTouchEnd={() => navigateTo(module.route)}
            >
              <IconButton 
                icon={module.icon} 
                size={24} 
                iconColor={pathname === module.route ? theme.colors.primary : theme.colors.onSurface}
              />
              {!collapsed && (
                <Text 
                  style={[
                    styles.sidebarItemText,
                    pathname === module.route && styles.sidebarItemActiveText
                  ]}
                >
                  {module.title}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.sidebarFooter}>
          {!collapsed && (
            <View style={styles.userInfo}>
              <IconButton icon="account" size={24} />
              <Text style={styles.userName}>{user?.full_name || 'Admin User'}</Text>
            </View>
          )}
          {collapsed && <IconButton icon="account" size={24} />}
        </View>
      </Surface>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Go2Solar Admin</Text>
          <View style={styles.headerActions}>
            <View style={styles.notificationIcon}>
              <IconButton
                icon="bell"
                size={24}
                onPress={() => setNotificationMenuVisible(true)}
              />
              {notificationCount > 0 && (
                <Badge
                  size={16}
                  style={styles.notificationBadge}
                >
                  {notificationCount}
                </Badge>
              )}
            </View>
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
              title: 'Admin Dashboard',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="users"
            options={{
              title: 'User Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="projects"
            options={{
              title: 'Project Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="reports"
            options={{
              title: 'Reports & Analytics',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'System Settings',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="integrations"
            options={{
              title: 'Integrations',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="analytics"
            options={{
              title: 'Analytics',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="chatbot"
            options={{
              title: 'Chatbot Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="workflow"
            options={{
              title: 'Workflow Automation',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="insights"
            options={{
              title: 'AI Insights',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="inverters"
            options={{
              title: 'Inverter Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="logs"
            options={{
              title: 'System Logs',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="maintenance"
            options={{
              title: 'Maintenance',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="users/roles"
            options={{
              title: 'Role Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="projects/approvals"
            options={{
              title: 'Project Approvals',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="integrations/health"
            options={{
              title: 'Integration Health',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="agents"
            options={{
              title: 'Agent Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="wallet"
            options={{
              title: 'Wallet Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="payments"
            options={{
              title: 'Payment Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="referrals"
            options={{
              title: 'Referral Program',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="geofencing"
            options={{
              title: 'Geofencing',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="support"
            options={{
              title: 'Support Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="marketing"
            options={{
              title: 'Marketing',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="service-requests"
            options={{
              title: 'Service Requests',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="energy"
            options={{
              title: 'Energy Management',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="sundaygrids"
            options={{
              title: 'SundayGrids',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="troubleshooting"
            options={{
              title: 'Troubleshooting',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="tickets"
            options={{
              title: 'Support Tickets',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="support/chat"
            options={{
              title: 'Support Chat',
              headerShown: true,
            }}
          />
        </Stack>
      </View>
    </View>
  );
} 