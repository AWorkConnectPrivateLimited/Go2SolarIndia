import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme, TextInput, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for notifications
const mockNotifications = [
  {
    id: '1',
    title: 'System Maintenance Alert',
    type: 'Alert',
    status: 'Pending',
    priority: 'High',
    target: 'All Users',
    scheduledFor: '2024-03-25 10:00',
    content: 'Scheduled maintenance will affect system availability',
  },
  {
    id: '2',
    project: 'Commercial Solar - ABC Corp',
    type: 'Update',
    status: 'Sent',
    priority: 'Medium',
    target: 'Project Team',
    scheduledFor: '2024-03-24 15:30',
    content: 'Project status update and next steps',
  },
  {
    id: '3',
    project: 'Community Solar - XYZ Society',
    type: 'Promotion',
    status: 'Draft',
    priority: 'Low',
    target: 'Customers',
    scheduledFor: '2024-03-26 09:00',
    content: 'Special offer for community solar participants',
  },
  {
    id: '4',
    project: 'Industrial Solar - DEF Industries',
    type: 'Alert',
    status: 'Failed',
    priority: 'High',
    target: 'Technical Team',
    scheduledFor: '2024-03-24 14:00',
    content: 'Critical system alert: Performance degradation detected',
  },
];

export default function NotificationsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState(mockNotifications);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    type: 'Alert',
    priority: 'Medium',
    target: 'All Users',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow by default
  });
  const { width } = useWindowDimensions();
  const theme = useTheme();

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockNotifications.filter(notification =>
      notification.title?.toLowerCase().includes(query.toLowerCase()) ||
      notification.content.toLowerCase().includes(query.toLowerCase()) ||
      notification.target.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNotifications(filtered);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alert':
        return theme.colors.error;
      case 'update':
        return theme.colors.primary;
      case 'promotion':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.colors.tertiary;
      case 'sent':
        return theme.colors.secondary;
      case 'draft':
        return theme.colors.primary;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.tertiary;
      case 'low':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  // Function to get a lighter version of a color for background
  const getBackgroundColor = (color: string) => {
    // For hex colors, we can append alpha
    if (color.startsWith('#')) {
      return color + '33'; // 33 is hex for 20% opacity
    }
    // For named colors or other formats, use a fallback
    return theme.colors.surfaceVariant;
  };

  const openMenu = (notification: any) => {
    setSelectedNotification(notification);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleAction = (action: string) => {
    closeMenu();
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const openCreateDialog = () => {
    setCreateDialogVisible(true);
  };

  const closeCreateDialog = () => {
    setCreateDialogVisible(false);
    // Reset form
    setNewNotification({
      title: '',
      content: '',
      type: 'Alert',
      priority: 'Medium',
      target: 'All Users',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });
  };

  const handleCreateNotification = () => {
    // In a real app, this would send the notification to a backend
    console.log('Creating notification:', newNotification);
    
    // Add to mock data (in a real app, this would come from the backend)
    const newId = (mockNotifications.length + 1).toString();
    const notificationToAdd = {
      id: newId,
      title: newNotification.title,
      type: newNotification.type,
      status: 'Draft',
      priority: newNotification.priority,
      target: newNotification.target,
      scheduledFor: newNotification.scheduledFor,
      content: newNotification.content,
    };
    
    mockNotifications.unshift(notificationToAdd);
    setFilteredNotifications([notificationToAdd, ...filteredNotifications]);
    
    closeCreateDialog();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(12, 16, 20),
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    header: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    searchContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    card: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    tableContainer: {
      overflow: 'scroll',
    },
    tableHeader: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    tableRow: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    tableCell: {
      padding: getResponsiveSize(8, 12, 16),
    },
    tableText: {
      fontSize: getFontSize(12),
    },
    chip: {
      marginRight: 8,
    },
    createButton: {
      marginLeft: 16,
    },
    formField: {
      marginBottom: 16,
    },
    dialogActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Notifications Center</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Manage system-wide notifications and alerts
          </Text>
        </View>
        <Button 
          mode="contained" 
          onPress={openCreateDialog}
          icon="plus"
          style={styles.createButton}
        >
          Create
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notifications..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Title</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Type</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Priority</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Scheduled For</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredNotifications.map((notification) => (
                <DataTable.Row key={notification.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{notification.title}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getTypeColor(notification.type) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getTypeColor(notification.type)) }]}
                    >
                      {notification.type}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(notification.status) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(notification.status)) }]}
                    >
                      {notification.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getPriorityColor(notification.priority) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getPriorityColor(notification.priority)) }]}
                    >
                      {notification.priority}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{notification.scheduledFor}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(notification)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Notification" />
          <Menu.Item onPress={() => handleAction('schedule')} title="Reschedule" />
          <Menu.Item onPress={() => handleAction('send')} title="Send Now" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedNotification?.title || 'this notification'}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={closeDialog}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={createDialogVisible} onDismiss={closeCreateDialog} style={{ width: '90%', maxWidth: 500 }}>
          <Dialog.Title>Create New Notification</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newNotification.title}
              onChangeText={(text) => setNewNotification({...newNotification, title: text})}
              style={styles.formField}
              mode="outlined"
            />
            
            <TextInput
              label="Content"
              value={newNotification.content}
              onChangeText={(text) => setNewNotification({...newNotification, content: text})}
              style={styles.formField}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <Text style={{ marginBottom: 8 }}>Type</Text>
            <SegmentedButtons
              value={newNotification.type}
              onValueChange={(value) => setNewNotification({...newNotification, type: value})}
              buttons={[
                { value: 'Alert', label: 'Alert' },
                { value: 'Update', label: 'Update' },
                { value: 'Promotion', label: 'Promotion' },
              ]}
              style={styles.formField}
            />
            
            <Text style={{ marginBottom: 8 }}>Priority</Text>
            <SegmentedButtons
              value={newNotification.priority}
              onValueChange={(value) => setNewNotification({...newNotification, priority: value})}
              buttons={[
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              style={styles.formField}
            />
            
            <Text style={{ marginBottom: 8 }}>Target Audience</Text>
            <SegmentedButtons
              value={newNotification.target}
              onValueChange={(value) => setNewNotification({...newNotification, target: value})}
              buttons={[
                { value: 'All Users', label: 'All' },
                { value: 'Customers', label: 'Customers' },
                { value: 'Agents', label: 'Agents' },
                { value: 'Admins', label: 'Admins' },
              ]}
              style={styles.formField}
            />
            
            <TextInput
              label="Schedule For"
              value={newNotification.scheduledFor}
              onChangeText={(text) => setNewNotification({...newNotification, scheduledFor: text})}
              style={styles.formField}
              mode="outlined"
              placeholder="YYYY-MM-DD HH:MM"
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={closeCreateDialog}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleCreateNotification}
              disabled={!newNotification.title || !newNotification.content}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
} 