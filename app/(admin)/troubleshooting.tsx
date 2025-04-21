import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for troubleshooting cases
const mockTroubleshootingCases = [
  {
    id: '1',
    project: 'Home Solar System - John Doe',
    issue: 'Inverter Error',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Tech Team A',
    lastUpdated: '2024-03-24',
    diagnosticSteps: ['Check inverter logs', 'Verify connections', 'Test voltage output'],
  },
  {
    id: '2',
    project: 'Commercial Solar - ABC Corp',
    issue: 'Panel Performance',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Tech Team B',
    lastUpdated: '2024-03-23',
    diagnosticSteps: ['Analyze production data', 'Check for shading', 'Inspect panel condition'],
  },
  {
    id: '3',
    project: 'Community Solar - XYZ Society',
    issue: 'Battery System',
    status: 'Resolved',
    priority: 'High',
    assignedTo: 'Tech Team C',
    lastUpdated: '2024-03-22',
    diagnosticSteps: ['Check battery health', 'Verify charging cycle', 'Test backup power'],
  },
  {
    id: '4',
    project: 'Industrial Solar - DEF Industries',
    issue: 'Monitoring System',
    status: 'New',
    priority: 'Low',
    assignedTo: 'Tech Team A',
    lastUpdated: '2024-03-24',
    diagnosticSteps: ['Check network connection', 'Verify data transmission', 'Test monitoring app'],
  },
];

export default function TroubleshootingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCases, setFilteredCases] = useState(mockTroubleshootingCases);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
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
    const filtered = mockTroubleshootingCases.filter(case_ =>
      case_.project.toLowerCase().includes(query.toLowerCase()) ||
      case_.issue.toLowerCase().includes(query.toLowerCase()) ||
      case_.assignedTo.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCases(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return theme.colors.primary;
      case 'in progress':
        return theme.colors.tertiary;
      case 'resolved':
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

  const getBackgroundColor = (color: string) => {
    if (color.startsWith('#')) {
      return `${color}33`;
    }
    return theme.colors.surfaceVariant;
  };

  const openMenu = (case_: any) => {
    setSelectedCase(case_);
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
        <Text variant="headlineMedium">Troubleshooting</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Manage diagnostic procedures and issue resolution
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search troubleshooting cases..."
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
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Issue</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Priority</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Last Updated</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredCases.map((case_) => (
                <DataTable.Row key={case_.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{case_.project}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{case_.issue}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(case_.status) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(case_.status)) }]}
                    >
                      {case_.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getPriorityColor(case_.priority) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getPriorityColor(case_.priority)) }]}
                    >
                      {case_.priority}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{case_.lastUpdated}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(case_)}
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
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Case" />
          <Menu.Item onPress={() => handleAction('assign')} title="Assign Technician" />
          <Menu.Item onPress={() => handleAction('update')} title="Update Status" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedCase?.project || 'this case'}?
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