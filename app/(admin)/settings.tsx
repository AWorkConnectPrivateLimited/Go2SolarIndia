import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Switch, 
  TextInput, 
  List, 
  Divider, 
  useTheme,
  Portal,
  Dialog,
  IconButton,
  SegmentedButtons
} from 'react-native-paper';
import { useRouter } from 'expo-router';

const mockSettings = {
  general: {
    appName: 'Go2Solar',
    theme: 'light',
    language: 'en',
    notifications: true,
    analytics: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    ipWhitelist: '',
  },
  email: {
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    senderEmail: 'noreply@go2solar.com',
    enableSSL: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationTypes: {
      system: true,
      security: true,
      updates: true,
      marketing: false,
    },
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '30',
    lastBackup: '2024-03-15T10:00:00Z',
  },
};

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [activeSection, setActiveSection] = useState('general');
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editSetting, setEditSetting] = useState({ section: '', key: '', value: '' });

  // Calculate responsive sizes
  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 768;
  const isLargeScreen = width >= 768;

  const getResponsiveSize = (small: number, medium: number, large: number) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  const getFontSize = (size: number) => {
    const baseSize = getResponsiveSize(size * 0.8, size, size * 1.2);
    return Math.round(baseSize);
  };

  const handleEdit = (section: string, key: string, value: string) => {
    setEditSetting({ section, key, value });
    setEditDialogVisible(true);
  };

  const handleSave = () => {
    // In a real app, this would update the settings in the backend
    console.log('Saving setting:', editSetting);
    setEditDialogVisible(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(8, 12, 16),
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    title: {
      fontSize: getFontSize(24),
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    card: {
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    sectionTitle: {
      fontSize: getFontSize(18),
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: getResponsiveSize(8, 12, 16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    settingLabel: {
      fontSize: getFontSize(14),
      color: theme.colors.onSurface,
    },
    settingValue: {
      fontSize: getFontSize(14),
      color: theme.colors.primary,
    },
    tabContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
  });

  const renderSettingValue = (value: any) => {
    if (typeof value === 'boolean') {
      return (
        <Switch
          value={value}
          onValueChange={() => console.log('Toggle setting')}
        />
      );
    }
    return (
      <Text style={styles.settingValue}>{String(value)}</Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeSection}
          onValueChange={setActiveSection}
          buttons={[
            { value: 'general', label: 'General' },
            { value: 'security', label: 'Security' },
            { value: 'email', label: 'Email' },
            { value: 'notifications', label: 'Notifications' },
            { value: 'backup', label: 'Backup' },
          ]}
        />
      </View>

      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Settings
            </Text>
            {Object.entries(mockSettings[activeSection as keyof typeof mockSettings]).map(([key, value]) => (
              <View key={key} style={styles.settingItem}>
                <Text style={styles.settingLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {renderSettingValue(value)}
                  {typeof value !== 'boolean' && (
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEdit(activeSection, key, String(value))}
                    />
                  )}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Setting</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={editSetting.key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              value={editSetting.value}
              onChangeText={(text) => setEditSetting({ ...editSetting, value: text })}
              mode="outlined"
              style={{ marginTop: 8 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
} 