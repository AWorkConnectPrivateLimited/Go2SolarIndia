import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, Avatar, useTheme, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const MENU_ITEMS = [
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

export default function MenuScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    profileSection: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
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
    menuList: {
      paddingHorizontal: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
    },
    menuIcon: {
      width: 24,
      alignItems: 'center',
      marginRight: 32,
    },
    menuLabel: {
      fontSize: 16,
      color: theme.colors.onSurface,
      flex: 1,
    },
    chevron: {
      color: theme.colors.onSurfaceVariant,
    },
  });

  const handleMenuPress = (route: string) => {
    router.push(`/(customer)${route}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Menu</Text>
      </View>

      <Pressable 
        style={styles.profileSection}
        onPress={() => handleMenuPress('/profile')}
      >
        <Avatar.Text 
          size={56} 
          label="SA"
          style={{ backgroundColor: '#8BC34A' }}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Souda Abhinav</Text>
          <Text style={styles.profilePhone}>8106217385</Text>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>

      <View style={styles.menuList}>
        {MENU_ITEMS.map((item, index) => (
          <React.Fragment key={item.id}>
            <Pressable 
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
            >
              <View style={styles.menuIcon}>
                <MaterialCommunityIcons
                  name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                style={styles.chevron}
              />
            </Pressable>
            {index < MENU_ITEMS.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
} 