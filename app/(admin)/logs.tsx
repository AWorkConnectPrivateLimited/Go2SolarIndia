import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, Portal, Dialog, TextInput, SegmentedButtons, Menu, IconButton, Chip, List, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useTheme } from 'react-native-paper';

// Mock data for system logs
const mockLogs = [
  {
    id: '1',
    timestamp: '2023-06-15T10:30:45Z',
    level: 'info',
    category: 'user',
    message: 'User login successful',
    details: 'User ID: 12345, IP: 192.168.1.100',
    source: 'auth-service',
  },
  {
    id: '2',
    timestamp: '2023-06-15T10:32:12Z',
    level: 'warning',
    category: 'system',
    message: 'High CPU usage detected',
    details: 'CPU usage: 85%, Memory: 70%',
    source: 'monitoring-service',
  },
  {
    id: '3',
    timestamp: '2023-06-15T10:35:20Z',
    level: 'error',
    category: 'api',
    message: 'API request failed',
    details: 'Endpoint: /api/projects, Status: 500, Error: Internal Server Error',
    source: 'api-gateway',
  },
  {
    id: '4',
    timestamp: '2023-06-15T10:40:15Z',
    level: 'info',
    category: 'user',
    message: 'Project created',
    details: 'Project ID: PRJ-789, Created by: User ID 12345',
    source: 'project-service',
  },
  {
    id: '5',
    timestamp: '2023-06-15T10:45:30Z',
    level: 'info',
    category: 'payment',
    message: 'Payment processed',
    details: 'Transaction ID: TXN-456, Amount: ₹25,000',
    source: 'payment-service',
  },
  {
    id: '6',
    timestamp: '2023-06-15T10:50:22Z',
    level: 'error',
    category: 'integration',
    message: 'Integration sync failed',
    details: 'Service: Razorpay, Error: Connection timeout',
    source: 'integration-service',
  },
  {
    id: '7',
    timestamp: '2023-06-15T11:00:10Z',
    level: 'info',
    category: 'notification',
    message: 'Push notification sent',
    details: 'Sent to: 150 users, Campaign: Monthly Update',
    source: 'notification-service',
  },
  {
    id: '8',
    timestamp: '2023-06-15T11:05:45Z',
    level: 'warning',
    category: 'security',
    message: 'Multiple failed login attempts',
    details: 'IP: 203.0.113.42, User: admin@example.com',
    source: 'security-service',
  },
  {
    id: '9',
    timestamp: '2023-06-15T11:10:30Z',
    level: 'info',
    category: 'user',
    message: 'User profile updated',
    details: 'User ID: 67890, Updated fields: email, phone',
    source: 'user-service',
  },
  {
    id: '10',
    timestamp: '2023-06-15T11:15:20Z',
    level: 'error',
    category: 'database',
    message: 'Database connection error',
    details: 'Error: Connection refused, Retry count: 3',
    source: 'database-service',
  },
];

// Get log level color
const getLogLevelColor = (level: string) => {
  switch (level) {
    case 'error':
      return '#F44336';
    case 'warning':
      return '#FF9800';
    case 'info':
      return '#2196F3';
    default:
      return '#9E9E9E';
  }
};

// Get log level text
const getLogLevelText = (level: string) => {
  switch (level) {
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Info';
    default:
      return 'Unknown';
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function LogsScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState(mockLogs);
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [dateRange, setDateRange] = useState('24h');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      filterLogs();
    }, 2000);
  };

  // Filter logs based on search query and filters
  const filterLogs = () => {
    let filtered = [...mockLogs];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }
    
    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }
    
    // Apply date range filter (simplified for demo)
    if (dateRange !== 'all') {
      const now = new Date();
      const hours = dateRange === '24h' ? 24 : dateRange === '7d' ? 168 : 720;
      const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffTime;
      });
    }
    
    setFilteredLogs(filtered);
  };

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterLogs();
  };

  // Handle level filter change
  const handleLevelFilterChange = (value: string) => {
    setLevelFilter(value);
    filterLogs();
  };

  // Handle category filter change
  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    filterLogs();
  };

  // Handle source filter change
  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value);
    filterLogs();
  };

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    filterLogs();
  };

  // Open log details dialog
  const openDetailsDialog = (log: any) => {
    setSelectedLog(log);
    setDialogVisible(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogVisible(false);
  };

  // Open menu
  const openMenu = (log: any, event: any) => {
    setSelectedLog(log);
    setMenuAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };

  // Close menu
  const closeMenu = () => {
    setMenuVisible(false);
  };

  // Handle menu action
  const handleMenuAction = (action: string) => {
    closeMenu();
    
    switch (action) {
      case 'details':
        openDetailsDialog(selectedLog);
        break;
      case 'export':
        // In a real app, this would export the log
        console.log(`Exporting log ${selectedLog.id}`);
        break;
      case 'delete':
        // In a real app, this would delete the log
        console.log(`Deleting log ${selectedLog.id}`);
        break;
    }
  };

  // Get unique categories from logs
  const getUniqueCategories = () => {
    const categories = new Set(mockLogs.map(log => log.category));
    return Array.from(categories);
  };

  // Get unique sources from logs
  const getUniqueSources = () => {
    const sources = new Set(mockLogs.map(log => log.source));
    return Array.from(sources);
  };

  // Apply filters when component mounts or filters change
  useEffect(() => {
    filterLogs();
  }, [searchQuery, levelFilter, categoryFilter, sourceFilter, dateRange]);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium">System Logs</Text>
          <Button
            mode="contained"
            onPress={onRefresh}
            icon="refresh"
          >
            Refresh
          </Button>
        </View>

        {/* Filters */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>Filters</Text>
            
            <Searchbar
              placeholder="Search logs..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Date Range:</Text>
              <View style={styles.filterContainer}>
                <SegmentedButtons
                  value={dateRange}
                  onValueChange={handleDateRangeChange}
                  buttons={[
                    { value: '24h', label: '24 Hours' },
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' },
                    { value: 'all', label: 'All' },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Level:</Text>
              <View style={styles.filterContainer}>
                <SegmentedButtons
                  value={levelFilter}
                  onValueChange={handleLevelFilterChange}
                  buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'error', label: 'Error' },
                    { value: 'warning', label: 'Warning' },
                    { value: 'info', label: 'Info' },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Category:</Text>
              <View style={styles.filterContainer}>
                <SegmentedButtons
                  value={categoryFilter}
                  onValueChange={handleCategoryFilterChange}
                  buttons={[
                    { value: 'all', label: 'All' },
                    ...getUniqueCategories().map(category => ({
                      value: category,
                      label: category.charAt(0).toUpperCase() + category.slice(1),
                    })),
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Source:</Text>
              <View style={styles.filterContainer}>
                <SegmentedButtons
                  value={sourceFilter}
                  onValueChange={handleSourceFilterChange}
                  buttons={[
                    { value: 'all', label: 'All' },
                    ...getUniqueSources().map(source => ({
                      value: source,
                      label: source.split('-')[0],
                    })),
                  ]}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Logs Table */}
        <Card style={styles.tableCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.tableTitle}>System Logs</Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Timestamp</DataTable.Title>
                <DataTable.Title>Level</DataTable.Title>
                <DataTable.Title>Message</DataTable.Title>
                <DataTable.Title>Source</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <DataTable.Row key={log.id} onPress={() => openDetailsDialog(log)}>
                    <DataTable.Cell>
                      <Text variant="bodySmall">{formatDate(log.timestamp)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        style={{ backgroundColor: getLogLevelColor(log.level) }}
                        textStyle={{ color: '#FFFFFF' }}
                      >
                        {getLogLevelText(log.level)}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium" numberOfLines={1}>{log.message}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodySmall">{log.source}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={(event) => openMenu(log, event)}
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <DataTable.Row>
                  <DataTable.Cell>
                    <Text variant="bodyMedium" style={styles.emptyText}>No logs found</Text>
                  </DataTable.Cell>
                  <DataTable.Cell />
                  <DataTable.Cell />
                  <DataTable.Cell />
                  <DataTable.Cell />
                </DataTable.Row>
              )}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Log Details Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Log Details</Dialog.Title>
          <Dialog.Content>
            {selectedLog && (
              <View>
                <View style={styles.logHeader}>
                  <Text variant="titleMedium">{selectedLog.message}</Text>
                  <Chip
                    style={{ backgroundColor: getLogLevelColor(selectedLog.level) }}
                    textStyle={{ color: '#FFFFFF' }}
                  >
                    {getLogLevelText(selectedLog.level)}
                  </Chip>
                </View>
                
                <Divider style={styles.divider} />
                
                <List.Item
                  title="Timestamp"
                  description={formatDate(selectedLog.timestamp)}
                  left={props => <List.Icon {...props} icon="clock" />}
                />
                
                <List.Item
                  title="Category"
                  description={selectedLog.category.charAt(0).toUpperCase() + selectedLog.category.slice(1)}
                  left={props => <List.Icon {...props} icon="tag" />}
                />
                
                <List.Item
                  title="Source"
                  description={selectedLog.source}
                  left={props => <List.Icon {...props} icon="server" />}
                />
                
                <List.Item
                  title="Details"
                  description={selectedLog.details}
                  left={props => <List.Icon {...props} icon="information" />}
                />
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Close</Button>
            <Button onPress={() => {
              console.log(`Exporting log ${selectedLog?.id}`);
              closeDialog();
            }}>
              Export
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Log Actions Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={menuAnchor}
        >
          <Menu.Item onPress={() => handleMenuAction('details')} title="View Details" />
          <Menu.Item onPress={() => handleMenuAction('export')} title="Export" />
          <Menu.Item onPress={() => handleMenuAction('delete')} title="Delete" />
        </Menu>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterCard: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterContainer: {
    flex: 1,
    marginLeft: 8,
  },
  tableCard: {
    marginBottom: 16,
  },
  tableTitle: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
}); 