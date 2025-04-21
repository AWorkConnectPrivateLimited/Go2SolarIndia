import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, Portal, Dialog, TextInput, SegmentedButtons, Menu, IconButton, Chip, ProgressBar, List, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useTheme } from 'react-native-paper';

// Mock data for integration health
const mockIntegrations = [
  {
    id: '1',
    name: 'Supabase',
    type: 'Database',
    status: 'healthy',
    uptime: '99.9%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '120ms',
    details: 'Database connection and queries are functioning normally.',
  },
  {
    id: '2',
    name: 'Razorpay',
    type: 'Payment',
    status: 'healthy',
    uptime: '99.8%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '180ms',
    details: 'Payment processing and transactions are working as expected.',
  },
  {
    id: '3',
    name: 'Bharat Connect BBPS',
    type: 'BBPS',
    status: 'degraded',
    uptime: '98.5%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '350ms',
    details: 'Some bill payment services are experiencing delays.',
  },
  {
    id: '4',
    name: 'Google Maps',
    type: 'Location',
    status: 'healthy',
    uptime: '99.7%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '150ms',
    details: 'Geocoding and map services are functioning normally.',
  },
  {
    id: '5',
    name: 'Growatt Inverter API',
    type: 'Device',
    status: 'healthy',
    uptime: '99.6%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '200ms',
    details: 'Device monitoring and data collection are working properly.',
  },
  {
    id: '6',
    name: 'SOLARMAN Smart',
    type: 'Device',
    status: 'unhealthy',
    uptime: '95.2%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '500ms',
    details: 'Intermittent connection issues with some inverter models.',
  },
  {
    id: '7',
    name: 'Zoho CRM',
    type: 'CRM',
    status: 'healthy',
    uptime: '99.5%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '250ms',
    details: 'Customer data synchronization is functioning normally.',
  },
  {
    id: '8',
    name: 'Salesforce',
    type: 'CRM',
    status: 'degraded',
    uptime: '97.8%',
    lastChecked: '2023-06-15T10:30:00Z',
    responseTime: '300ms',
    details: 'Some API endpoints are responding slowly.',
  },
];

// Status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return '#4CAF50';
    case 'degraded':
      return '#FF9800';
    case 'unhealthy':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

// Status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Degraded';
    case 'unhealthy':
      return 'Unhealthy';
    default:
      return 'Unknown';
  }
};

export default function IntegrationHealthScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIntegrations, setFilteredIntegrations] = useState(mockIntegrations);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  // Get unique integration types
  const integrationTypes = ['all', ...new Set(mockIntegrations.map(integration => integration.type))];

  // Filter integrations based on search query and filters
  const filterIntegrations = () => {
    let filtered = [...mockIntegrations];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(integration => integration.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(integration => integration.type === typeFilter);
    }
    
    setFilteredIntegrations(filtered);
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      filterIntegrations();
    }, 2000);
  };

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterIntegrations();
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    filterIntegrations();
  };

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    filterIntegrations();
  };

  // Open integration details dialog
  const openDetailsDialog = (integration: any) => {
    setSelectedIntegration(integration);
    setDialogVisible(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogVisible(false);
  };

  // Open menu
  const openMenu = (integration: any, event: any) => {
    setSelectedIntegration(integration);
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
        openDetailsDialog(selectedIntegration);
        break;
      case 'configure':
        // Navigate to integration configuration
        router.push(`/(admin)/integrations/${selectedIntegration.id}`);
        break;
      case 'logs':
        // Navigate to integration logs
        router.push(`/(admin)/integrations/${selectedIntegration.id}/logs`);
        break;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate uptime percentage
  const calculateUptimePercentage = (uptime: string) => {
    return parseFloat(uptime.replace('%', '')) / 100;
  };

  // Apply filters when component mounts or filters change
  useEffect(() => {
    filterIntegrations();
  }, [searchQuery, statusFilter, typeFilter]);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium">Integration Health</Text>
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
              placeholder="Search integrations..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Status:</Text>
              <View style={styles.filterContainer}>
                <SegmentedButtons
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                  buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'healthy', label: 'Healthy' },
                    { value: 'degraded', label: 'Degraded' },
                    { value: 'unhealthy', label: 'Unhealthy' },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Type:</Text>
              <View style={styles.filterContainer}>
                <SegmentedButtons
                  value={typeFilter}
                  onValueChange={handleTypeFilterChange}
                  buttons={integrationTypes.map(type => ({
                    value: type,
                    label: type === 'all' ? 'All' : type,
                  }))}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Health Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>Health Summary</Text>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="headlineLarge" style={{ color: '#4CAF50' }}>
                  {mockIntegrations.filter(i => i.status === 'healthy').length}
                </Text>
                <Text variant="bodyMedium">Healthy</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text variant="headlineLarge" style={{ color: '#FF9800' }}>
                  {mockIntegrations.filter(i => i.status === 'degraded').length}
                </Text>
                <Text variant="bodyMedium">Degraded</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text variant="headlineLarge" style={{ color: '#F44336' }}>
                  {mockIntegrations.filter(i => i.status === 'unhealthy').length}
                </Text>
                <Text variant="bodyMedium">Unhealthy</Text>
              </View>
            </View>
            
            <View style={styles.overallHealth}>
              <Text variant="bodyMedium">Overall Health:</Text>
              <Chip
                style={{
                  backgroundColor: mockIntegrations.some(i => i.status === 'unhealthy')
                    ? '#F44336'
                    : mockIntegrations.some(i => i.status === 'degraded')
                    ? '#FF9800'
                    : '#4CAF50',
                }}
                textStyle={{ color: 'white' }}
              >
                {mockIntegrations.some(i => i.status === 'unhealthy')
                  ? 'Unhealthy'
                  : mockIntegrations.some(i => i.status === 'degraded')
                  ? 'Degraded'
                  : 'Healthy'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Integrations Table */}
        <Card style={styles.tableCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.tableTitle}>Integrations</Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title>Type</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Uptime</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredIntegrations.map((integration) => (
                <DataTable.Row key={integration.id}>
                  <DataTable.Cell>
                    <Text variant="bodyMedium">{integration.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Text variant="bodySmall">{integration.type}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      style={{ backgroundColor: getStatusColor(integration.status) }}
                      textStyle={{ color: 'white' }}
                    >
                      {getStatusText(integration.status)}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <View>
                      <Text variant="bodySmall">{integration.uptime}</Text>
                      <ProgressBar
                        progress={calculateUptimePercentage(integration.uptime)}
                        color={getStatusColor(integration.status)}
                        style={styles.uptimeBar}
                      />
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={(event) => openMenu(integration, event)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Integration Details Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Integration Details</Dialog.Title>
          <Dialog.Content>
            {selectedIntegration && (
              <View>
                <Text variant="titleMedium">{selectedIntegration.name}</Text>
                <Text variant="bodySmall" style={styles.dialogSubtitle}>{selectedIntegration.type}</Text>
                
                <Divider style={styles.divider} />
                
                <List.Item
                  title="Status"
                  description={
                    <Chip
                      style={{ backgroundColor: getStatusColor(selectedIntegration.status) }}
                      textStyle={{ color: 'white' }}
                    >
                      {getStatusText(selectedIntegration.status)}
                    </Chip>
                  }
                  left={props => <List.Icon {...props} icon="check-circle" />}
                />
                
                <List.Item
                  title="Uptime"
                  description={selectedIntegration.uptime}
                  left={props => <List.Icon {...props} icon="clock" />}
                />
                
                <List.Item
                  title="Response Time"
                  description={selectedIntegration.responseTime}
                  left={props => <List.Icon {...props} icon="speedometer" />}
                />
                
                <List.Item
                  title="Last Checked"
                  description={formatDate(selectedIntegration.lastChecked)}
                  left={props => <List.Icon {...props} icon="calendar" />}
                />
                
                <Divider style={styles.divider} />
                
                <Text variant="titleSmall" style={styles.detailsTitle}>Details</Text>
                <Text variant="bodyMedium">{selectedIntegration.details}</Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Close</Button>
            <Button onPress={() => {
              closeDialog();
              router.push(`/(admin)/integrations/${selectedIntegration?.id}`);
            }}>
              Configure
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Integration Actions Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={menuAnchor}
        >
          <Menu.Item onPress={() => handleMenuAction('details')} title="View Details" />
          <Menu.Item onPress={() => handleMenuAction('configure')} title="Configure" />
          <Menu.Item onPress={() => handleMenuAction('logs')} title="View Logs" />
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
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  overallHealth: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableCard: {
    marginBottom: 16,
  },
  tableTitle: {
    marginBottom: 16,
  },
  uptimeBar: {
    height: 4,
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  dialogSubtitle: {
    marginBottom: 8,
    opacity: 0.7,
  },
  detailsTitle: {
    marginBottom: 8,
  },
}); 