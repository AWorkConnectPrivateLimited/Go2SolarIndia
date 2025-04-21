import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for maintenance schedules
const mockMaintenanceSchedules = [
  {
    id: '1',
    project: 'Home Solar System - John Doe',
    type: 'Routine',
    status: 'Scheduled',
    priority: 'Medium',
    scheduledDate: '2024-03-25',
    assignedTo: 'Tech Team A',
    description: 'Quarterly maintenance check',
  },
  {
    id: '2',
    project: 'Commercial Solar - ABC Corp',
    type: 'Emergency',
    status: 'In Progress',
    priority: 'High',
    scheduledDate: '2024-03-24',
    assignedTo: 'Tech Team B',
    description: 'Inverter malfunction',
  },
  {
    id: '3',
    project: 'Community Solar - XYZ Society',
    type: 'Preventive',
    status: 'Completed',
    priority: 'Low',
    scheduledDate: '2024-03-23',
    assignedTo: 'Tech Team C',
    description: 'Annual system check',
  },
  {
    id: '4',
    project: 'Industrial Solar - DEF Industries',
    type: 'Routine',
    status: 'Pending',
    priority: 'Medium',
    scheduledDate: '2024-03-26',
    assignedTo: 'Tech Team A',
    description: 'Monthly performance check',
  },
];

export default function MaintenanceScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSchedules, setFilteredSchedules] = useState(mockMaintenanceSchedules);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
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
    const filtered = mockMaintenanceSchedules.filter(schedule =>
      schedule.project.toLowerCase().includes(query.toLowerCase()) ||
      schedule.description.toLowerCase().includes(query.toLowerCase()) ||
      schedule.assignedTo.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSchedules(filtered);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'routine':
        return theme.colors.primary;
      case 'emergency':
        return theme.colors.error;
      case 'preventive':
        return theme.colors.secondary;
      default:
        return theme.colors.tertiary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return theme.colors.primary;
      case 'in progress':
        return theme.colors.tertiary;
      case 'completed':
        return theme.colors.secondary;
      case 'pending':
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

  // Add these new functions for background colors
  const getTypeBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'routine':
        return 'rgba(103, 80, 164, 0.2)';
      case 'emergency':
        return 'rgba(211, 47, 47, 0.2)';
      case 'preventive':
        return 'rgba(0, 150, 136, 0.2)';
      default:
        return 'rgba(149, 117, 205, 0.2)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'rgba(103, 80, 164, 0.2)';
      case 'in progress':
        return 'rgba(149, 117, 205, 0.2)';
      case 'completed':
        return 'rgba(0, 150, 136, 0.2)';
      case 'pending':
        return 'rgba(211, 47, 47, 0.2)';
      default:
        return 'rgba(189, 189, 189, 0.2)';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'rgba(211, 47, 47, 0.2)';
      case 'medium':
        return 'rgba(149, 117, 205, 0.2)';
      case 'low':
        return 'rgba(0, 150, 136, 0.2)';
      default:
        return 'rgba(189, 189, 189, 0.2)';
    }
  };

  const openMenu = (schedule: any) => {
    setSelectedSchedule(schedule);
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(12, 16, 20),
      backgroundColor: theme.colors.background,
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
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Maintenance Management</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Schedule and track maintenance activities
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search maintenance schedules..."
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
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Project</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Type</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Priority</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Date</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredSchedules.map((schedule) => (
                <DataTable.Row key={schedule.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{schedule.project}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getTypeColor(schedule.type) }}
                      style={[styles.chip, { backgroundColor: getTypeBgColor(schedule.type) }]}
                    >
                      {schedule.type}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(schedule.status) }}
                      style={[styles.chip, { backgroundColor: getStatusBgColor(schedule.status) }]}
                    >
                      {schedule.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getPriorityColor(schedule.priority) }}
                      style={[styles.chip, { backgroundColor: getPriorityBgColor(schedule.priority) }]}
                    >
                      {schedule.priority}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{schedule.scheduledDate}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(schedule)}
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
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Schedule" />
          <Menu.Item onPress={() => handleAction('assign')} title="Assign Technician" />
          <Menu.Item onPress={() => handleAction('update')} title="Update Status" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedSchedule?.project || 'this schedule'}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={closeDialog}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
} 