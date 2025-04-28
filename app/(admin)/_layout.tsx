import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Surface, Portal, Modal, useTheme, Text, Button, IconButton, Divider, Avatar, Badge, Menu } from 'react-native-paper';
import { Stack, usePathname, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Define User type with proper metadata
interface User {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'customer';
  user_metadata?: {
    full_name?: string;
  };
}

// Bottom navigation items - most important ones for quick access
const BOTTOM_TABS = [
  { name: 'dashboard', label: 'Dashboard', icon: 'view-dashboard' as const },
  { name: 'users', label: 'Users', icon: 'account-group' as const },
  { name: 'projects', label: 'Projects', icon: 'solar-power' as const },
  { name: 'more', label: 'More', icon: 'dots-horizontal' as const },
];

// Full sidebar items
const SIDEBAR_ITEMS = [
  { id: 'dashboard', icon: 'view-dashboard' as const, label: 'Dashboard', route: '/dashboard' },
  { id: 'users', icon: 'account-group' as const, label: 'Users & Roles', route: '/users' },
  { id: 'projects', icon: 'solar-power' as const, label: 'Projects', route: '/projects' },
  { id: 'analytics', icon: 'chart-bar' as const, label: 'Analytics', route: '/analytics' },
  { id: 'chatbot', icon: 'robot' as const, label: 'Chatbot', route: '/chatbot' },
  { id: 'workflow', icon: 'arrow-decision' as const, label: 'Workflow', route: '/workflow' },
  { id: 'insights', icon: 'lightbulb' as const, label: 'AI Insights', route: '/insights' },
  { id: 'inverters', icon: 'power-plug' as const, label: 'Inverters', route: '/inverters' },
  { id: 'integrations', icon: 'connection' as const, label: 'Integrations', route: '/integrations' },
  { id: 'logs', icon: 'file-document' as const, label: 'System Logs', route: '/logs' },
  { id: 'maintenance', icon: 'wrench' as const, label: 'Maintenance', route: '/maintenance' },
  { id: 'agents', icon: 'account-hard-hat' as const, label: 'Agents', route: '/agents' },
  { id: 'wallet', icon: 'wallet' as const, label: 'Wallet', route: '/wallet' },
  { id: 'payments', icon: 'cash-multiple' as const, label: 'Payments', route: '/payments' },
  { id: 'referrals', icon: 'account-multiple' as const, label: 'Referrals', route: '/referrals' },
  { id: 'geofencing', icon: 'map-marker-radius' as const, label: 'Geofencing', route: '/geofencing' },
  { id: 'support', icon: 'help-circle' as const, label: 'Support', route: '/support' },
  { id: 'marketing', icon: 'bullhorn' as const, label: 'Marketing', route: '/marketing' },
  { id: 'service-requests', icon: 'clipboard-list' as const, label: 'Service Requests', route: '/service-requests' },
  { id: 'reports', icon: 'file-chart' as const, label: 'Reports', route: '/reports' },
  { id: 'energy', icon: 'lightning-bolt' as const, label: 'Energy', route: '/energy' },
  { id: 'sundaygrids', icon: 'grid' as const, label: 'SundayGrids', route: '/sundaygrids' },
  { id: 'notifications', icon: 'bell' as const, label: 'Notifications', route: '/notifications', badge: 3 },
  { id: 'troubleshooting', icon: 'wrench-clock' as const, label: 'Troubleshooting', route: '/troubleshooting' },
  { id: 'settings', icon: 'cog' as const, label: 'Settings', route: '/settings' },
];

export default function AdminLayout() {
  const theme = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user) as User | null;
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Set active tab based on current path
  useEffect(() => {
    const path = pathname.split('/').pop() || 'dashboard';
    setActiveTab(path);
  }, [pathname]);
  
  // Redirect to login if not authenticated or not an admin
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(auth)/login" />;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    // Add logout logic here
    setShowLogoutModal(false);
    setProfileMenuVisible(false);
    router.push('/(auth)/login');
  };

  const handleViewProfile = () => {
    setSidebarVisible(false);
    router.push('/(admin)/profile');
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'more') {
      setSidebarVisible(true);
    } else {
      setActiveTab(tabName);
      router.push(`/(admin)/${tabName}`);
    }
  };

  const handleSidebarItemPress = (route: string) => {
    setSidebarVisible(false);
    router.push(`/(admin)${route}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    tabButton: {
      alignItems: 'center',
      padding: 8,
    },
    tabLabel: {
      fontSize: 12,
      marginTop: 4,
    },
    activeTab: {
      color: theme.colors.primary,
    },
    inactiveTab: {
      color: theme.colors.onSurfaceVariant,
    },
    sidebar: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: width * 0.8,
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    sidebarHeader: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    profileSection: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    profileEmail: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    sidebarItemIcon: {
      width: 24,
      alignItems: 'center',
      marginRight: 32,
    },
    sidebarItemLabel: {
      fontSize: 16,
      color: theme.colors.onSurface,
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      margin: 20,
      borderRadius: 8,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
      gap: 8,
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 10,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Go2Solar Admin</Text>
          <View style={styles.headerActions}>
              <IconButton
                icon="bell"
                size={24}
            onPress={() => router.push('/(admin)/notifications')}
          />
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
                setShowLogoutModal(true);
                }}
                title="Logout"
                leadingIcon="logout"
              />
            </Menu>
          </View>
        </View>

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />

      <Portal>
        <Modal
          visible={sidebarVisible}
          onDismiss={() => setSidebarVisible(false)}
          contentContainerStyle={styles.sidebar}
        >
          <Pressable 
            style={styles.profileSection}
            onPress={() => handleSidebarItemPress('/profile')}
          >
            <Avatar.Text 
              size={56} 
              label={getInitials(user?.user_metadata?.full_name || user?.email)}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.user_metadata?.full_name || 'Admin User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>

          <ScrollView>
            {SIDEBAR_ITEMS.map((item, index) => (
              <React.Fragment key={item.id}>
                <Pressable 
                  style={styles.sidebarItem}
                  onPress={() => handleSidebarItemPress(item.route)}
                >
                  <View style={styles.sidebarItemIcon}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.sidebarItemLabel}>{item.label}</Text>
                  {item.badge && (
                    <Badge style={styles.badge}>{item.badge}</Badge>
                  )}
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </Pressable>
                {index < SIDEBAR_ITEMS.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </ScrollView>
        </Modal>

        <Modal
          visible={showLogoutModal}
          onDismiss={() => setShowLogoutModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleMedium">Confirm Logout</Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Are you sure you want to logout?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleLogout}
            >
              Logout
            </Button>
          </View>
        </Modal>
      </Portal>

      <Surface style={styles.bottomNav}>
        {BOTTOM_TABS.map((tab) => (
          <Pressable
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.name)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={24}
              color={activeTab === tab.name ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.name ? styles.activeTab : styles.inactiveTab,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </Surface>
    </View>
  );
} 