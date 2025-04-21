import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, useTheme, SegmentedButtons, ProgressBar, Avatar, Divider, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { format } from 'date-fns';

// Mock data for SundayGrids community solar projects
const mockProjects = [
  {
    id: '1',
    name: 'Hyderabad Community Solar Farm',
    location: 'Hyderabad, Telangana',
    capacity: 25.0, // MW
    totalCapacity: 100.0, // MW
    reservedCapacity: 75.0, // MW
    participants: 120,
    status: 'Active',
    roi: 12.5, // %
    startDate: '2023-01-15',
    expectedCompletion: '2024-06-30',
    dailyGeneration: 125.5, // MWh
    monthlyGeneration: 3820, // MWh
    yearlyGeneration: 45840, // MWh
    environmentalImpact: {
      co2Reduced: 22920, // tons
      treesEquivalent: 1146000,
    },
    financialMetrics: {
      totalInvestment: 125000000, // ₹
      averageInvestment: 1041667, // ₹
      totalReturns: 15625000, // ₹
      averageReturns: 130208, // ₹
    },
  },
  {
    id: '2',
    name: 'Bangalore Solar Community',
    location: 'Bangalore, Karnataka',
    capacity: 15.0, // MW
    totalCapacity: 50.0, // MW
    reservedCapacity: 35.0, // MW
    participants: 85,
    status: 'Active',
    roi: 11.8, // %
    startDate: '2023-03-10',
    expectedCompletion: '2024-08-15',
    dailyGeneration: 75.3, // MWh
    monthlyGeneration: 2290, // MWh
    yearlyGeneration: 27480, // MWh
    environmentalImpact: {
      co2Reduced: 13740, // tons
      treesEquivalent: 687000,
    },
    financialMetrics: {
      totalInvestment: 75000000, // ₹
      averageInvestment: 882353, // ₹
      totalReturns: 8850000, // ₹
      averageReturns: 104118, // ₹
    },
  },
  {
    id: '3',
    name: 'Mumbai Coastal Solar Project',
    location: 'Mumbai, Maharashtra',
    capacity: 10.0, // MW
    totalCapacity: 30.0, // MW
    reservedCapacity: 20.0, // MW
    participants: 45,
    status: 'Planning',
    roi: 10.5, // %
    startDate: '2024-05-01',
    expectedCompletion: '2025-10-30',
    dailyGeneration: 0, // MWh (not operational yet)
    monthlyGeneration: 0, // MWh
    yearlyGeneration: 0, // MWh
    environmentalImpact: {
      co2Reduced: 0, // tons
      treesEquivalent: 0,
    },
    financialMetrics: {
      totalInvestment: 50000000, // ₹
      averageInvestment: 1111111, // ₹
      totalReturns: 0, // ₹
      averageReturns: 0, // ₹
    },
  },
  {
    id: '4',
    name: 'Delhi NCR Solar Community',
    location: 'Gurgaon, Haryana',
    capacity: 20.0, // MW
    totalCapacity: 80.0, // MW
    reservedCapacity: 60.0, // MW
    participants: 150,
    status: 'Active',
    roi: 13.2, // %
    startDate: '2023-06-20',
    expectedCompletion: '2024-11-30',
    dailyGeneration: 100.4, // MWh
    monthlyGeneration: 3050, // MWh
    yearlyGeneration: 36600, // MWh
    environmentalImpact: {
      co2Reduced: 18300, // tons
      treesEquivalent: 915000,
    },
    financialMetrics: {
      totalInvestment: 100000000, // ₹
      averageInvestment: 666667, // ₹
      totalReturns: 13200000, // ₹
      averageReturns: 88000, // ₹
    },
  },
];

export default function SundayGridsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [timeRange, setTimeRange] = useState('month');
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
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return theme.colors.primary;
      case 'planning':
        return theme.colors.secondary;
      case 'completed':
        return theme.colors.tertiary;
      case 'on hold':
        return theme.colors.error;
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

  const getRoiColor = (roi: number) => {
    if (roi >= 12) return theme.colors.primary;
    if (roi >= 10) return theme.colors.secondary;
    if (roi >= 8) return theme.colors.tertiary;
    return theme.colors.error;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const formatCapacity = (value: number) => {
    return `${value.toFixed(1)} MW`;
  };

  const formatEnergy = (value: number) => {
    return `${value.toFixed(1)} MWh`;
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

  const getReservationPercentage = (project: any) => {
    return (project.reservedCapacity / project.totalCapacity) * 100;
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
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">SundayGrids</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Manage community solar projects and participant investments
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
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Project</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Capacity</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>ROI</Text></DataTable.Title>
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
                            {project.location}
                          </Text>
                        </View>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Chip
                        textStyle={{ color: getStatusColor(project.status) }}
                        style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(project.status)) }]}
                      >
                        {project.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={styles.tableText}>{formatCapacity(project.capacity)}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <ProgressBar
                          progress={getReservationPercentage(project) / 100}
                          color={theme.colors.primary}
                          style={{ flex: 1, height: 4, borderRadius: 2 }}
                        />
                        <Text style={[styles.tableText, { marginLeft: 4, fontSize: getFontSize(10) }]}>
                          {Math.round(getReservationPercentage(project))}%
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={[styles.tableText, { color: getRoiColor(project.roi) }]}>
                        {project.roi}%
                      </Text>
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
                      {project.location}
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
                      textStyle={{ color: getStatusColor(project.status) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(project.status)) }]}
                    >
                      {project.status}
                    </Chip>
                    <Text style={{ marginTop: 8, color: getRoiColor(project.roi) }}>
                      ROI: {project.roi}%
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressLabel}>
                    <Text style={styles.progressText}>Capacity Reserved</Text>
                    <Text style={styles.progressText}>
                      {formatCapacity(project.reservedCapacity)} / {formatCapacity(project.totalCapacity)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={getReservationPercentage(project) / 100}
                    color={theme.colors.primary}
                    style={styles.progressBar}
                  />
                </View>

                <View style={styles.projectMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatNumber(project.participants)}</Text>
                    <Text style={styles.metricLabel}>Participants</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatCurrency(project.financialMetrics.averageInvestment)}</Text>
                    <Text style={styles.metricLabel}>Avg. Investment</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{formatCurrency(project.financialMetrics.averageReturns)}</Text>
                    <Text style={styles.metricLabel}>Avg. Returns</Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: 16 }} />

                <Text style={styles.sectionTitle}>Project Timeline</Text>
                <View style={styles.dataGrid}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Start Date</Text>
                    <Text style={styles.dataValue}>{formatDate(project.startDate)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Expected Completion</Text>
                    <Text style={styles.dataValue}>{formatDate(project.expectedCompletion)}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Energy Generation</Text>
                <View style={styles.dataGrid}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Daily</Text>
                    <Text style={styles.dataValue}>{formatEnergy(project.dailyGeneration)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Monthly</Text>
                    <Text style={styles.dataValue}>{formatEnergy(project.monthlyGeneration)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Yearly</Text>
                    <Text style={styles.dataValue}>{formatEnergy(project.yearlyGeneration)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>CO₂ Reduced</Text>
                    <Text style={styles.dataValue}>{formatNumber(project.environmentalImpact.co2Reduced)} tons</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Financial Overview</Text>
                <View style={styles.dataGrid}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Total Investment</Text>
                    <Text style={styles.dataValue}>{formatCurrency(project.financialMetrics.totalInvestment)}</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Total Returns</Text>
                    <Text style={styles.dataValue}>{formatCurrency(project.financialMetrics.totalReturns)}</Text>
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
          <Menu.Item onPress={() => handleAction('participants')} title="Manage Participants" />
          <Menu.Item onPress={() => handleAction('reports')} title="Generate Reports" />
          <Menu.Item onPress={() => handleAction('settings')} title="Project Settings" />
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