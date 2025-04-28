import React, { useState, useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, useWindowDimensions, Pressable, ScrollView } from 'react-native';
import { Text, IconButton, useTheme, Menu, Surface, Portal, Modal, Avatar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface User {
  id: string | null;
  email: string | null;
  name?: string;
  phone?: string;
  role: 'customer' | 'agent' | 'admin' | null;
}

const BOTTOM_TABS = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'view-dashboard',
  },
  {
    name: 'quote',
    label: 'Quote',
    icon: 'calculator',
  },
  {
    name: 'projects',
    label: 'Projects',
    icon: 'solar-power',
  },
  {
    name: 'chat',
    label: 'Live Chat',
    icon: 'chat',
  },
  {
    name: 'more',
    label: 'More',
    icon: 'dots-horizontal',
  },
];

const SIDEBAR_ITEMS = [
  {
    id: 'wallet',
    icon: 'wallet',
    label: 'My Wallet',
    route: '/wallet',
  },
  {
    id: 'proposals',
    icon: 'file-document-multiple',
    label: 'My Proposals',
    route: '/proposals',
  },
  {
    id: 'energy-reports',
    icon: 'chart-line',
    label: 'My Energy Reports',
    route: '/energy-reports',
  },
  {
    id: 'notifications',
    icon: 'bell',
    label: 'Notifications',
    route: '/notifications',
  },
  {
    id: 'documents',
    icon: 'file-document',
    label: 'My Documents',
    route: '/documents',
  },
  {
    id: 'support',
    icon: 'help-circle',
    label: 'Support',
    route: '/support',
  },
  {
    id: 'settings',
    icon: 'cog',
    label: 'Settings',
    route: '/settings',
  },
  {
    id: 'knowledge',
    icon: 'school',
    label: 'Knowledge Centre',
    route: '/knowledge',
  },
  {
    id: 'feedback',
    icon: 'message-text',
    label: 'Feedback',
    route: '/feedback',
  },
  {
    id: 'rate',
    icon: 'star',
    label: 'Rate Us',
    route: '/rate',
  },
  {
    id: 'refer',
    icon: 'account-multiple',
    label: 'Refer a Friend',
    route: '/refer',
  },
];

export default function CustomerLayout() {
  const user = useSelector<RootState, User>((state) => state.auth.user as User);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirect to login if not authenticated or not a customer
  if (!user || user.role !== 'customer') {
    return <Redirect href="/(auth)/login" />;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    // Add logout logic here
    router.push('/(auth)/login');
  };

  const handleViewProfile = () => {
    setSidebarVisible(false);
    router.push('/(customer)/profile');
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'more') {
      setSidebarVisible(true);
    } else {
      setActiveTab(tabName);
      router.push(`/(customer)/${tabName}`);
    }
  };

  const handleSidebarItemPress = (route: string) => {
    setSidebarVisible(false);
    router.push(`/(customer)${route}`);
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
    profilePhone: {
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
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Go2Solar</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="bell"
            size={24}
            onPress={() => router.push('/(customer)/notifications')}
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
                handleLogout();
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
              label={getInitials(user.name || user.email)}
              style={{ backgroundColor: '#8BC34A' }}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name || 'User'}</Text>
              <Text style={styles.profilePhone}>{user.phone || user.email}</Text>
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
                      name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.sidebarItemLabel}>{item.label}</Text>
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
      </Portal>

      <Surface style={styles.bottomNav}>
        {BOTTOM_TABS.map((tab) => (
          <Pressable
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.name)}
          >
            <MaterialCommunityIcons
              name={tab.icon as keyof typeof MaterialCommunityIcons.glyphMap}
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