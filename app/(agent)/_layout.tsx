import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Surface, Portal, Modal, useTheme, Text, Button, IconButton, Divider, Avatar, Badge, Menu } from 'react-native-paper';
import { Stack, usePathname, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { router } from 'expo-router';
import { supabase } from '../../src/services/supabase/client';
import { StatusBar } from 'expo-status-bar';

// Bottom navigation items - most important ones for quick access
const BOTTOM_TABS = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'view-dashboard',
  },
  { name: 'customers', label: 'Customers', icon: 'account-group' as const },
  { name: 'tasks', label: 'Tasks', icon: 'clipboard-list' as const },
  { name: 'more', label: 'More', icon: 'dots-horizontal' as const },
];

// Full sidebar items
const SIDEBAR_ITEMS = [
  { id: 'dashboard', icon: 'view-dashboard' as const, label: 'Dashboard', route: '/dashboard' },
  { id: 'customers', icon: 'account-group' as const, label: 'Customers', route: '/customers' },
  { id: 'tasks', icon: 'clipboard-list' as const, label: 'Tasks', route: '/tasks' },
  { id: 'installations', icon: 'solar-panel' as const, label: 'Installations', route: '/installations' },
  { id: 'service-requests', icon: 'wrench' as const, label: 'Service Requests', route: '/service-requests' },
  { id: 'commission', icon: 'cash' as const, label: 'Commission', route: '/commission' },
  { id: 'reports', icon: 'chart-box' as const, label: 'Reports', route: '/reports' },
  { id: 'training', icon: 'school' as const, label: 'Training', route: '/training' },
  { id: 'resources', icon: 'book-open-variant' as const, label: 'Resources', route: '/resources' },
  { id: 'support', icon: 'help-circle' as const, label: 'Support', route: '/support' },
  { id: 'notifications', icon: 'bell' as const, label: 'Notifications', route: '/notifications', badge: 3 },
  { id: 'settings', icon: 'cog' as const, label: 'Settings', route: '/settings' },
];

export default function AgentLayout() {
  const theme = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('index');

  // Set active tab based on current path
  useEffect(() => {
    const path = pathname.split('/').pop() || 'index';
    setActiveTab(path);
  }, [pathname]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setShowLogoutModal(false);
    setProfileMenuVisible(false);
  };

  const handleViewProfile = () => {
    setSidebarVisible(false);
    router.push('/(agent)/profile');
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'more') {
      setSidebarVisible(true);
    } else {
      setActiveTab(tabName);
      router.push(`/(agent)/${tabName}`);
    }
  };

  const handleSidebarItemPress = (route: string) => {
    setSidebarVisible(false);
    router.push(`/(agent)${route}`);
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
        <Text style={styles.headerTitle}>Go2Solar Agent</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="bell"
            size={24}
            onPress={() => router.push('/(agent)/notifications')}
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
              <Text style={styles.profileName}>{user?.user_metadata?.full_name || 'Agent'}</Text>
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