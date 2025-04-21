import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, useTheme, SegmentedButtons, ProgressBar, Avatar, Divider, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { format, subMonths, subDays } from 'date-fns';

// Mock data for energy consumption
const mockProjects = [
  {
    id: '1',
    name: 'Residential Solar Installation - Mumbai',
    type: 'Physical Solar',
    capacity: 5.5, // kW
    totalGeneration: 1250, // kWh
    totalConsumption: 980, // kWh
    netExport: 270, // kWh
    efficiency: 92, // %
    lastUpdated: '2024-03-24T10:30:00Z',
    dailyData: [
      { date: '2024-03-18', generation: 28.5, consumption: 22.3, export: 6.2 },
      { date: '2024-03-19', generation: 31.2, consumption: 24.1, export: 7.1 },
      { date: '2024-03-20', generation: 29.8, consumption: 23.5, export: 6.3 },
      { date: '2024-03-21', generation: 32.1, consumption: 25.2, export: 6.9 },
      { date: '2024-03-22', generation: 30.5, consumption: 24.8, export: 5.7 },
      { date: '2024-03-23', generation: 27.9, consumption: 22.1, export: 5.8 },
      { date: '2024-03-24', generation: 26.4, consumption: 21.8, export: 4.6 },
    ],
    monthlyData: [
      { month: 'Sep 2023', generation: 820, consumption: 650, export: 170 },
      { month: 'Oct 2023', generation: 780, consumption: 620, export: 160 },
      { month: 'Nov 2023', generation: 720, consumption: 580, export: 140 },
      { month: 'Dec 2023', generation: 680, consumption: 550, export: 130 },
      { month: 'Jan 2024', generation: 710, consumption: 570, export: 140 },
      { month: 'Feb 2024', generation: 750, consumption: 590, export: 160 },
      { month: 'Mar 2024', generation: 820, consumption: 650, export: 170 },
    ],
  },
  {
    id: '2',
    name: 'Commercial Solar Setup - Delhi',
    type: 'Physical Solar',
    capacity: 12.0, // kW
    totalGeneration: 2850, // kWh
    totalConsumption: 2100, // kWh
    netExport: 750, // kWh
    efficiency: 88, // %
    lastUpdated: '2024-03-24T09:45:00Z',
    dailyData: [
      { date: '2024-03-18', generation: 62.5, consumption: 46.3, export: 16.2 },
      { date: '2024-03-19', generation: 68.2, consumption: 50.1, export: 18.1 },
      { date: '2024-03-20', generation: 65.8, consumption: 48.5, export: 17.3 },
      { date: '2024-03-21', generation: 70.1, consumption: 52.2, export: 17.9 },
      { date: '2024-03-22', generation: 67.5, consumption: 49.8, export: 17.7 },
      { date: '2024-03-23', generation: 64.9, consumption: 47.1, export: 17.8 },
      { date: '2024-03-24', generation: 63.4, consumption: 46.8, export: 16.6 },
    ],
    monthlyData: [
      { month: 'Sep 2023', generation: 1850, consumption: 1380, export: 470 },
      { month: 'Oct 2023', generation: 1780, consumption: 1320, export: 460 },
      { month: 'Nov 2023', generation: 1720, consumption: 1280, export: 440 },
      { month: 'Dec 2023', generation: 1680, consumption: 1250, export: 430 },
      { month: 'Jan 2024', generation: 1710, consumption: 1270, export: 440 },
      { month: 'Feb 2024', generation: 1750, consumption: 1290, export: 460 },
      { month: 'Mar 2024', generation: 1850, consumption: 1380, export: 470 },
    ],
  },
  {
    id: '3',
    name: 'Digital Solar Investment - Bangalore',
    type: 'Digital Solar',
    capacity: 3.0, // kW
    totalGeneration: 680, // kWh
    totalConsumption: 0, // kWh (digital solar doesn't have direct consumption)
    netExport: 680, // kWh
    efficiency: 95, // %
    lastUpdated: '2024-03-24T11:15:00Z',
    dailyData: [
      { date: '2024-03-18', generation: 15.5, consumption: 0, export: 15.5 },
      { date: '2024-03-19', generation: 16.2, consumption: 0, export: 16.2 },
      { date: '2024-03-20', generation: 15.8, consumption: 0, export: 15.8 },
      { date: '2024-03-21', generation: 16.1, consumption: 0, export: 16.1 },
      { date: '2024-03-22', generation: 15.5, consumption: 0, export: 15.5 },
      { date: '2024-03-23', generation: 14.9, consumption: 0, export: 14.9 },
      { date: '2024-03-24', generation: 14.4, consumption: 0, export: 14.4 },
    ],
    monthlyData: [
      { month: 'Sep 2023', generation: 420, consumption: 0, export: 420 },
      { month: 'Oct 2023', generation: 380, consumption: 0, export: 380 },
      { month: 'Nov 2023', generation: 320, consumption: 0, export: 320 },
      { month: 'Dec 2023', generation: 280, consumption: 0, export: 280 },
      { month: 'Jan 2024', generation: 310, consumption: 0, export: 310 },
      { month: 'Feb 2024', generation: 350, consumption: 0, export: 350 },
      { month: 'Mar 2024', generation: 420, consumption: 0, export: 420 },
    ],
  },
  {
    id: '4',
    name: 'Community Solar Project - Hyderabad',
    type: 'Community Solar',
    capacity: 25.0, // kW
    totalGeneration: 5200, // kWh
    totalConsumption: 3800, // kWh
    netExport: 1400, // kWh
    efficiency: 90, // %
    lastUpdated: '2024-03-24T08:30:00Z',
    dailyData: [
      { date: '2024-03-18', generation: 125.5, consumption: 92.3, export: 33.2 },
      { date: '2024-03-19', generation: 132.2, consumption: 96.1, export: 36.1 },
      { date: '2024-03-20', generation: 128.8, consumption: 94.5, export: 34.3 },
      { date: '2024-03-21', generation: 135.1, consumption: 98.2, export: 36.9 },
      { date: '2024-03-22', generation: 130.5, consumption: 95.8, export: 34.7 },
      { date: '2024-03-23', generation: 127.9, consumption: 93.1, export: 34.8 },
      { date: '2024-03-24', generation: 126.4, consumption: 92.8, export: 33.6 },
    ],
    monthlyData: [
      { month: 'Sep 2023', generation: 3820, consumption: 2780, export: 1040 },
      { month: 'Oct 2023', generation: 3780, consumption: 2720, export: 1060 },
      { month: 'Nov 2023', generation: 3720, consumption: 2680, export: 1040 },
      { month: 'Dec 2023', generation: 3680, consumption: 2650, export: 1030 },
      { month: 'Jan 2024', generation: 3710, consumption: 2670, export: 1040 },
      { month: 'Feb 2024', generation: 3750, consumption: 2690, export: 1060 },
      { month: 'Mar 2024', generation: 3820, consumption: 2780, export: 1040 },
    ],
  },
];

export default function EnergyScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [viewMode, setViewMode] = useState('list');
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
    // Filter projects based on search query
    const filtered = mockProjects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'physical solar':
        return theme.colors.primary;
      case 'digital solar':
        return theme.colors.secondary;
      case 'community solar':
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
    if (efficiency >= 90) return theme.colors.primary;
    if (efficiency >= 80) return theme.colors.secondary;
    if (efficiency >= 70) return theme.colors.tertiary;
    return theme.colors.error;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const formatEnergy = (value: number) => {
    return `${value.toFixed(1)} kWh`;
  };

  const formatCapacity = (value: number) => {
    return `${value.toFixed(1)} kW`;
  };

  const openMenu = (project: any) => {
    setSelectedProject(project);
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

  const getProjectData = (project: any) => {
    if (timeRange === 'week') {
      return project.dailyData;
    } else if (timeRange === 'month') {
      return project.monthlyData;
    }
    return project.dailyData;
  };

  const getDataLabel = (data: any) => {
    if (timeRange === 'week') {
      return format(new Date(data.date), 'MMM dd');
    } else if (timeRange === 'month') {
      return data.month;
    }
    return '';
  };

  const getMaxGeneration = (data: any[]) => {
    return Math.max(...data.map(item => item.generation));
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
    projectCard: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    projectTitle: {
      flex: 1,
    },
    projectInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    projectAvatar: {
      marginRight: 8,
    },
    projectDetails: {
      flex: 1,
    },
    projectMetrics: {
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
    chartContainer: {
      marginTop: getResponsiveSize(16, 20, 24),
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    chartTitle: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
    },
    chartLegend: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 4,
    },
    chartData: {
      marginTop: getResponsiveSize(8, 12, 16),
    },
    dataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    dataLabel: {
      width: getResponsiveSize(60, 80, 100),
      fontSize: getFontSize(12),
    },
    dataBar: {
      flex: 1,
      height: 20,
      borderRadius: 4,
      marginHorizontal: 8,
    },
    dataValue: {
      width: getResponsiveSize(60, 80, 100),
      fontSize: getFontSize(12),
      textAlign: 'right',
    },
    avatar: {
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Energy Consumption</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Monitor and analyze energy usage across solar installations
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search projects..."
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
            { value: 'week', label: 'Week' },
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
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Project</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Type</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Generation</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Consumption</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Efficiency</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
                </DataTable.Header>

                {filteredProjects.map((project) => (
                  <DataTable.Row key={project.id} style={styles.tableRow}>
                    <DataTable.Cell style={styles.tableCell}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Text 
                          size={40} 
                          label={getInitials(project.name)} 
                          style={styles.avatar}
                        />
                        <View style={{ marginLeft: 8 }}>
                          <Text style={[styles.tableText, { fontWeight: 'bold' }]}>{project.name}</Text>
                          <Text style={[styles.tableText, { fontSize: getFontSize(10) }]}>
                            {formatCapacity(project.capacity)}
                          </Text>
                        </View>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Chip
                        textStyle={{ color: getTypeColor(project.type) }}
                        style={[styles.chip, { backgroundColor: getBackgroundColor(getTypeColor(project.type)) }]}
                      >
                        {project.type}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={styles.tableText}>{formatEnergy(project.totalGeneration)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={styles.tableText}>{formatEnergy(project.totalConsumption)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ProgressBar
                          progress={project.efficiency / 100}
                          color={getEfficiencyColor(project.efficiency)}
                          style={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Text style={[styles.tableText, { marginLeft: 8, color: getEfficiencyColor(project.efficiency) }]}>
                          {project.efficiency}%
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={() => openMenu(project)}
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
          {filteredProjects.map((project) => (
            <Card key={project.id} style={styles.projectCard}>
              <Card.Content>
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitle}>
                    <Text variant="titleMedium">{project.name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatCapacity(project.capacity)} • Last updated: {formatDate(project.lastUpdated)}
                    </Text>
                  </View>
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => openMenu(project)}
                  />
                </View>

                <View style={styles.projectInfo}>
                  <Avatar.Text 
                    size={40} 
                    label={getInitials(project.name)} 
                    style={[styles.avatar, styles.projectAvatar]}
                  />
                  <View style={styles.projectDetails}>
                    <Chip
                      textStyle={{ color: getTypeColor(project.type) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getTypeColor(project.type)) }]}
                    >
                      {project.type}
                    </Chip>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <ProgressBar
                        progress={project.efficiency / 100}
                        color={getEfficiencyColor(project.efficiency)}
                        style={{ flex: 1, height: 8, borderRadius: 4 }}
                      />
                      <Text style={{ marginLeft: 8, color: getEfficiencyColor(project.efficiency) }}>
                        {project.efficiency}% Efficiency
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.projectMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatEnergy(project.totalGeneration)}</Text>
                    <Text style={styles.metricLabel}>Generation</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatEnergy(project.totalConsumption)}</Text>
                    <Text style={styles.metricLabel}>Consumption</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatEnergy(project.netExport)}</Text>
                    <Text style={styles.metricLabel}>Net Export</Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: 16 }} />

                <View style={styles.chartContainer}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Energy {timeRange === 'week' ? 'Daily' : 'Monthly'} Data</Text>
                    <View style={styles.chartLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
                        <Text style={{ fontSize: getFontSize(10) }}>Generation</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: theme.colors.secondary }]} />
                        <Text style={{ fontSize: getFontSize(10) }}>Consumption</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: theme.colors.tertiary }]} />
                        <Text style={{ fontSize: getFontSize(10) }}>Export</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.chartData}>
                    {getProjectData(project).map((data, index) => (
                      <View key={index} style={styles.dataRow}>
                        <Text style={styles.dataLabel}>{getDataLabel(data)}</Text>
                        <View style={styles.dataBar}>
                          <View style={{ 
                            flex: 1, 
                            backgroundColor: theme.colors.primary,
                            width: `${(data.generation / getMaxGeneration(getProjectData(project))) * 100}%`,
                            height: '100%',
                            borderTopLeftRadius: 4,
                            borderBottomLeftRadius: 4,
                          }} />
                          {data.consumption > 0 && (
                            <View style={{ 
                              flex: 1, 
                              backgroundColor: theme.colors.secondary,
                              width: `${(data.consumption / getMaxGeneration(getProjectData(project))) * 100}%`,
                              height: '100%',
                            }} />
                          )}
                          {data.export > 0 && (
                            <View style={{ 
                              flex: 1, 
                              backgroundColor: theme.colors.tertiary,
                              width: `${(data.export / getMaxGeneration(getProjectData(project))) * 100}%`,
                              height: '100%',
                              borderTopRightRadius: 4,
                              borderBottomRightRadius: 4,
                            }} />
                          )}
                        </View>
                        <Text style={styles.dataValue}>{formatEnergy(data.generation)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
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
          <Menu.Item onPress={() => handleAction('export')} title="Export Data" />
          <Menu.Item onPress={() => handleAction('alerts')} title="Set Alerts" />
          <Menu.Item onPress={() => handleAction('maintenance')} title="Schedule Maintenance" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedProject?.name || 'this project'}?
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