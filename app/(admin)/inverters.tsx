import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, useTheme, SegmentedButtons, ProgressBar, Avatar, Divider, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { format } from 'date-fns';

// Mock data for inverters
const mockInverters = [
  {
    id: '1',
    name: 'Growatt SPF 5000 ES',
    serialNumber: 'GR5000-12345678',
    location: 'Hyderabad Community Solar Farm',
    status: 'Active',
    manufacturer: 'Growatt',
    model: 'SPF 5000 ES',
    capacity: 5.0, // kW
    efficiency: 97.5, // %
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-05-15',
    dailyGeneration: 25.5, // kWh
    monthlyGeneration: 765, // kWh
    yearlyGeneration: 9180, // kWh
    performance: {
      voltage: 230.5, // V
      current: 21.8, // A
      frequency: 50.0, // Hz
      temperature: 42.5, // °C
      powerFactor: 0.98,
    },
    alerts: [
      { id: '1', type: 'warning', message: 'Temperature approaching threshold', timestamp: '2024-03-24T10:30:00Z' },
    ],
  },
  {
    id: '2',
    name: 'SOLARMAN Smart 10K',
    serialNumber: 'SM10K-87654321',
    location: 'Bangalore Solar Community',
    status: 'Active',
    manufacturer: 'SOLARMAN',
    model: 'Smart 10K',
    capacity: 10.0, // kW
    efficiency: 98.2, // %
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    dailyGeneration: 48.3, // kWh
    monthlyGeneration: 1449, // kWh
    yearlyGeneration: 17388, // kWh
    performance: {
      voltage: 231.2, // V
      current: 43.2, // A
      frequency: 50.0, // Hz
      temperature: 38.7, // °C
      powerFactor: 0.99,
    },
    alerts: [],
  },
  {
    id: '3',
    name: 'Growatt SPF 3000 TL',
    serialNumber: 'GR3000-11223344',
    location: 'Mumbai Coastal Solar Project',
    status: 'Maintenance',
    manufacturer: 'Growatt',
    model: 'SPF 3000 TL',
    capacity: 3.0, // kW
    efficiency: 96.8, // %
    lastMaintenance: '2024-03-10',
    nextMaintenance: '2024-06-10',
    dailyGeneration: 0, // kWh (not operational)
    monthlyGeneration: 0, // kWh
    yearlyGeneration: 0, // kWh
    performance: {
      voltage: 0, // V
      current: 0, // A
      frequency: 0, // Hz
      temperature: 25.0, // °C
      powerFactor: 0,
    },
    alerts: [
      { id: '1', type: 'error', message: 'Inverter offline - requires technician', timestamp: '2024-03-22T08:15:00Z' },
    ],
  },
  {
    id: '4',
    name: 'SOLARMAN Smart 15K',
    serialNumber: 'SM15K-55667788',
    location: 'Delhi NCR Solar Community',
    status: 'Active',
    manufacturer: 'SOLARMAN',
    model: 'Smart 15K',
    capacity: 15.0, // kW
    efficiency: 98.5, // %
    lastMaintenance: '2024-02-05',
    nextMaintenance: '2024-05-05',
    dailyGeneration: 72.5, // kWh
    monthlyGeneration: 2175, // kWh
    yearlyGeneration: 26100, // kWh
    performance: {
      voltage: 230.8, // V
      current: 65.0, // A
      frequency: 50.0, // Hz
      temperature: 41.2, // °C
      powerFactor: 0.98,
    },
    alerts: [
      { id: '1', type: 'info', message: 'Scheduled maintenance in 2 weeks', timestamp: '2024-03-23T14:45:00Z' },
    ],
  },
];

export default function InvertersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInverters, setFilteredInverters] = useState(mockInverters);
  const [selectedInverter, setSelectedInverter] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [timeRange, setTimeRange] = useState('day');
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

  useEffect(() => {
    // Filter inverters based on search query
    const filtered = mockInverters.filter(inverter =>
      inverter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inverter.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inverter.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inverter.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInverters(filtered);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return theme.colors.primary;
      case 'maintenance':
        return theme.colors.secondary;
      case 'offline':
        return theme.colors.error;
      case 'standby':
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
    }
  };

  const getBackgroundColor = (color: string) => {
    // Convert hex to rgba with 20% opacity
    if (color.startsWith('#')) {
      return color + '33'; // 33 is hex for 20% opacity
    }
    return color;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 98) return theme.colors.primary;
    if (efficiency >= 95) return theme.colors.secondary;
    if (efficiency >= 90) return theme.colors.tertiary;
    return theme.colors.error;
  };

  const getAlertColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.secondary;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.outline;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatDateTime = (dateTimeString: string) => {
    return format(new Date(dateTimeString), 'MMM dd, yyyy hh:mm a');
  };

  const formatEnergy = (value: number) => {
    return `${value.toFixed(1)} kWh`;
  };

  const formatCapacity = (value: number) => {
    return `${value.toFixed(1)} kW`;
  };

  const formatVoltage = (value: number) => {
    return `${value.toFixed(1)} V`;
  };

  const formatCurrent = (value: number) => {
    return `${value.toFixed(1)} A`;
  };

  const formatTemperature = (value: number) => {
    return `${value.toFixed(1)} °C`;
  };

  const openMenu = (inverter: any) => {
    setSelectedInverter(inverter);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getManufacturerColor = (manufacturer: string) => {
    switch (manufacturer.toLowerCase()) {
      case 'growatt':
        return theme.colors.primary;
      case 'solarman':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
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
    timeRangeContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    viewModeContainer: {
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
    inverterCard: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    inverterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    inverterTitle: {
      flex: 1,
    },
    inverterInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    inverterAvatar: {
      marginRight: 8,
    },
    inverterDetails: {
      flex: 1,
    },
    inverterMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: getResponsiveSize(8, 12, 16),
    },
    metricItem: {
      alignItems: 'center',
    },
    metricValue: {
      fontSize: getFontSize(16),
      fontWeight: 'bold',
    },
    metricLabel: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    progressContainer: {
      marginTop: getResponsiveSize(8, 12, 16),
    },
    progressLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    progressText: {
      fontSize: getFontSize(12),
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    sectionTitle: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
      marginTop: getResponsiveSize(16, 20, 24),
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    dataGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -8,
    },
    dataItem: {
      width: '50%',
      padding: 8,
    },
    dataLabel: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    dataValue: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
    },
    avatar: {
      backgroundColor: theme.colors.primary,
    },
    alertContainer: {
      marginTop: getResponsiveSize(16, 20, 24),
    },
    alertItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getResponsiveSize(8, 12, 16),
      borderRadius: 8,
      marginBottom: 8,
    },
    alertIcon: {
      marginRight: 8,
    },
    alertContent: {
      flex: 1,
    },
    alertMessage: {
      fontSize: getFontSize(12),
      fontWeight: 'bold',
    },
    alertTimestamp: {
      fontSize: getFontSize(10),
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Inverter Management</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Monitor and manage solar inverters across installations
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search inverters..."
          value={searchQuery}
          onChangeText={handleSearch}
          left={<TextInput.Icon icon="magnify" />}
          mode="outlined"
        />
      </View>

      <View style={styles.timeRangeContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'day', label: 'Day' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
        />
      </View>

      <View style={styles.viewModeContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'list', label: 'List View', icon: 'format-list-bulleted' },
            { value: 'grid', label: 'Grid View', icon: 'view-grid' },
          ]}
        />
      </View>

      {viewMode === 'list' ? (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tableContainer}>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Inverter</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Capacity</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Efficiency</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
                </DataTable.Header>

                {filteredInverters.map((inverter) => (
                  <DataTable.Row key={inverter.id} style={styles.tableRow}>
                    <DataTable.Cell style={styles.tableCell}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Text 
                          size={40} 
                          label={getInitials(inverter.name)} 
                          style={[styles.avatar, { backgroundColor: getManufacturerColor(inverter.manufacturer) }]}
                        />
                        <View style={{ marginLeft: 8 }}>
                          <Text style={[styles.tableText, { fontWeight: 'bold' }]}>{inverter.name}</Text>
                          <Text style={[styles.tableText, { fontSize: getFontSize(10) }]}>
                            {inverter.location}
                          </Text>
                        </View>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Chip
                        textStyle={{ color: getStatusColor(inverter.status) }}
                        style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(inverter.status)) }]}
                      >
                        {inverter.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={styles.tableText}>{formatCapacity(inverter.capacity)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ProgressBar
                          progress={inverter.efficiency / 100}
                          color={getEfficiencyColor(inverter.efficiency)}
                          style={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Text style={[styles.tableText, { marginLeft: 8, color: getEfficiencyColor(inverter.efficiency) }]}>
                          {inverter.efficiency}%
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={() => openMenu(inverter)}
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <View>
          {filteredInverters.map((inverter) => (
            <Card key={inverter.id} style={styles.inverterCard}>
              <Card.Content>
                <View style={styles.inverterHeader}>
                  <View style={styles.inverterTitle}>
                    <Text variant="titleMedium">{inverter.name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {inverter.location}
                    </Text>
                  </View>
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => openMenu(inverter)}
                  />
                </View>

                <View style={styles.inverterInfo}>
                  <Avatar.Text 
                    size={40} 
                    label={getInitials(inverter.name)} 
                    style={[styles.avatar, styles.inverterAvatar, { backgroundColor: getManufacturerColor(inverter.manufacturer) }]}
                  />
                  <View style={styles.inverterDetails}>
                    <Chip
                      textStyle={{ color: getStatusColor(inverter.status) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(inverter.status)) }]}
                    >
                      {inverter.status}
                    </Chip>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <ProgressBar
                        progress={inverter.efficiency / 100}
                        color={getEfficiencyColor(inverter.efficiency)}
                        style={{ flex: 1, height: 8, borderRadius: 4 }}
                      />
                      <Text style={{ marginLeft: 8, color: getEfficiencyColor(inverter.efficiency) }}>
                        {inverter.efficiency}% Efficiency
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.inverterMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatEnergy(inverter.dailyGeneration)}</Text>
                    <Text style={styles.metricLabel}>Daily</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatEnergy(inverter.monthlyGeneration)}</Text>
                    <Text style={styles.metricLabel}>Monthly</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatEnergy(inverter.yearlyGeneration)}</Text>
                    <Text style={styles.metricLabel}>Yearly</Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: 16 }} />

                <Text style={styles.sectionTitle}>Inverter Details</Text>
                <View style={styles.dataGrid}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Serial Number</Text>
                    <Text style={styles.dataValue}>{inverter.serialNumber}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Manufacturer</Text>
                    <Text style={styles.dataValue}>{inverter.manufacturer}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Model</Text>
                    <Text style={styles.dataValue}>{inverter.model}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Capacity</Text>
                    <Text style={styles.dataValue}>{formatCapacity(inverter.capacity)}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Maintenance</Text>
                <View style={styles.dataGrid}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Last Maintenance</Text>
                    <Text style={styles.dataValue}>{formatDate(inverter.lastMaintenance)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Next Maintenance</Text>
                    <Text style={styles.dataValue}>{formatDate(inverter.nextMaintenance)}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Performance Metrics</Text>
                <View style={styles.dataGrid}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Voltage</Text>
                    <Text style={styles.dataValue}>{formatVoltage(inverter.performance.voltage)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Current</Text>
                    <Text style={styles.dataValue}>{formatCurrent(inverter.performance.current)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Frequency</Text>
                    <Text style={styles.dataValue}>{inverter.performance.frequency.toFixed(1)} Hz</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Temperature</Text>
                    <Text style={styles.dataValue}>{formatTemperature(inverter.performance.temperature)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Power Factor</Text>
                    <Text style={styles.dataValue}>{inverter.performance.powerFactor.toFixed(2)}</Text>
                  </View>
                </View>

                {inverter.alerts.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Alerts</Text>
                    <View style={styles.alertContainer}>
                      {inverter.alerts.map((alert: any) => (
                        <View 
                          key={alert.id} 
                          style={[
                            styles.alertItem, 
                            { backgroundColor: getBackgroundColor(getAlertColor(alert.type)) }
                          ]}
                        >
                          <IconButton
                            icon={alert.type === 'error' ? 'alert-circle' : alert.type === 'warning' ? 'alert' : 'information'}
                            size={20}
                            iconColor={getAlertColor(alert.type)}
                            style={styles.alertIcon}
                          />
                          <View style={styles.alertContent}>
                            <Text style={[styles.alertMessage, { color: getAlertColor(alert.type) }]}>
                              {alert.message}
                            </Text>
                            <Text style={styles.alertTimestamp}>
                              {formatDateTime(alert.timestamp)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('maintenance')} title="Schedule Maintenance" />
          <Menu.Item onPress={() => handleAction('alerts')} title="Configure Alerts" />
          <Menu.Item onPress={() => handleAction('firmware')} title="Update Firmware" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedInverter?.name || 'this inverter'}?
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