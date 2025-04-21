import { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, Searchbar, Menu, Portal, Dialog, Paragraph, useTheme, Divider, IconButton, FAB, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for demonstration
const mockCampaigns = [
  { 
    id: '1', 
    name: 'Summer Solar Promotion', 
    type: 'email', 
    status: 'active', 
    target: 'all_customers',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    sent: 1250,
    opened: 850,
    clicked: 320,
    conversions: 45
  },
  { 
    id: '2', 
    name: 'Referral Program Launch', 
    type: 'sms', 
    status: 'scheduled', 
    target: 'inactive_customers',
    startDate: '2023-07-15',
    endDate: '2023-08-15',
    sent: 0,
    opened: 0,
    clicked: 0,
    conversions: 0
  },
  { 
    id: '3', 
    name: 'Holiday Special Offer', 
    type: 'push', 
    status: 'draft', 
    target: 'new_customers',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    sent: 0,
    opened: 0,
    clicked: 0,
    conversions: 0
  },
  { 
    id: '4', 
    name: 'Maintenance Reminder', 
    type: 'email', 
    status: 'completed', 
    target: 'active_customers',
    startDate: '2023-05-01',
    endDate: '2023-05-15',
    sent: 800,
    opened: 600,
    clicked: 250,
    conversions: 30
  },
];

export default function MarketingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState(mockCampaigns);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    all: true,
    active: false,
    scheduled: false,
    draft: false,
    completed: false
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

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, activeFilters);
  };

  const toggleFilter = (filter: string) => {
    const newFilters = { ...activeFilters };
    
    if (filter === 'all') {
      // If "All" is selected, deselect all others
      Object.keys(newFilters).forEach(key => {
        newFilters[key] = key === 'all';
      });
    } else {
      // If another filter is selected, deselect "All"
      newFilters.all = false;
      newFilters[filter] = !newFilters[filter];
      
      // If no filters are selected, automatically select "All"
      const hasActiveFilter = Object.keys(newFilters).some(key => key !== 'all' && newFilters[key]);
      if (!hasActiveFilter) {
        newFilters.all = true;
      }
    }
    
    setActiveFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const applyFilters = (query: string, filters: any) => {
    let filtered = [...mockCampaigns];
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        campaign => 
          campaign.name.toLowerCase().includes(query.toLowerCase()) ||
          campaign.type.toLowerCase().includes(query.toLowerCase()) ||
          campaign.target.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply status filters
    if (!filters.all) {
      if (filters.active) {
        filtered = filtered.filter(campaign => campaign.status === 'active');
      }
      if (filters.scheduled) {
        filtered = filtered.filter(campaign => campaign.status === 'scheduled');
      }
      if (filters.draft) {
        filtered = filtered.filter(campaign => campaign.status === 'draft');
      }
      if (filters.completed) {
        filtered = filtered.filter(campaign => campaign.status === 'completed');
      }
    }
    
    setFilteredCampaigns(filtered);
  };

  const openMenu = (campaign: any) => {
    setSelectedCampaign(campaign);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleAction = (action: string) => {
    setSelectedAction(action);
    closeMenu();
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'scheduled':
        return theme.colors.tertiary;
      case 'draft':
        return theme.colors.secondary;
      case 'completed':
        return theme.colors.onSurface;
      default:
        return theme.colors.onSurface;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return theme.colors.primary;
      case 'sms':
        return theme.colors.tertiary;
      case 'push':
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'all_customers':
        return theme.colors.primary;
      case 'active_customers':
        return theme.colors.secondary;
      case 'inactive_customers':
        return theme.colors.tertiary;
      case 'new_customers':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const getBackgroundColor = (color: string) => {
    // Check if the color is already in rgba format
    if (color.startsWith('rgba')) {
      // Extract the RGB values and set opacity to 0.2
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = match[1];
        const g = match[2];
        const b = match[3];
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
    }
    
    // For hex colors, convert to rgba with 0.2 opacity
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    
    // Default fallback
    return 'rgba(0, 0, 0, 0.2)';
  };

  const getConversionRate = (campaign: any) => {
    if (campaign.sent === 0) return 0;
    return (campaign.conversions / campaign.sent) * 100;
  };

  const getOpenRate = (campaign: any) => {
    if (campaign.sent === 0) return 0;
    return (campaign.opened / campaign.sent) * 100;
  };

  const getClickRate = (campaign: any) => {
    if (campaign.opened === 0) return 0;
    return (campaign.clicked / campaign.opened) * 100;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(12, 16, 20),
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
    },
    searchContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    filtersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: getResponsiveSize(16, 20, 24),
      gap: getResponsiveSize(8, 12, 16),
    },
    filterChip: {
      marginRight: getResponsiveSize(8, 12, 16),
      marginBottom: getResponsiveSize(8, 12, 16),
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
    statusChip: {
      alignSelf: 'flex-start',
    },
    typeChip: {
      alignSelf: 'flex-start',
    },
    targetChip: {
      alignSelf: 'flex-start',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveSize(32, 40, 48),
    },
    emptyStateText: {
      fontSize: getFontSize(16),
      textAlign: 'center',
      marginTop: getResponsiveSize(8, 12, 16),
    },
    fab: {
      position: 'absolute',
      margin: getResponsiveSize(16, 20, 24),
      right: 0,
      bottom: 0,
    },
    metricsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    metricCard: {
      width: isSmallScreen ? '100%' : isMediumScreen ? '48%' : '23%',
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    metricTitle: {
      fontSize: getFontSize(14),
      marginBottom: getResponsiveSize(4, 6, 8),
    },
    metricValue: {
      fontSize: getFontSize(20),
      fontWeight: 'bold',
    },
    progressContainer: {
      marginTop: getResponsiveSize(8, 10, 12),
    },
    progressLabel: {
      fontSize: getFontSize(12),
      marginBottom: getResponsiveSize(4, 6, 8),
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Marketing Tools</Text>
          <Button 
            mode="contained" 
            onPress={() => router.push('/(admin)/marketing/analytics')}
            icon="chart-bar"
          >
            Analytics
          </Button>
        </View>

        <View style={styles.metricsContainer}>
          <Card style={styles.metricCard}>
            <Card.Content>
              <Text style={styles.metricTitle}>Total Campaigns</Text>
              <Text style={styles.metricValue}>{mockCampaigns.length}</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Active: {mockCampaigns.filter(c => c.status === 'active').length}</Text>
                <ProgressBar 
                  progress={mockCampaigns.filter(c => c.status === 'active').length / mockCampaigns.length} 
                  color={theme.colors.primary}
                />
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.metricCard}>
            <Card.Content>
              <Text style={styles.metricTitle}>Total Reach</Text>
              <Text style={styles.metricValue}>
                {mockCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0)}
              </Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Avg. Open Rate: {Math.round(mockCampaigns.reduce((sum, campaign) => sum + getOpenRate(campaign), 0) / mockCampaigns.length)}%</Text>
                <ProgressBar 
                  progress={mockCampaigns.reduce((sum, campaign) => sum + getOpenRate(campaign), 0) / (mockCampaigns.length * 100)} 
                  color={theme.colors.secondary}
                />
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.metricCard}>
            <Card.Content>
              <Text style={styles.metricTitle}>Total Conversions</Text>
              <Text style={styles.metricValue}>
                {mockCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0)}
              </Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Avg. Conversion Rate: {Math.round(mockCampaigns.reduce((sum, campaign) => sum + getConversionRate(campaign), 0) / mockCampaigns.length)}%</Text>
                <ProgressBar 
                  progress={mockCampaigns.reduce((sum, campaign) => sum + getConversionRate(campaign), 0) / (mockCampaigns.length * 100)} 
                  color={theme.colors.tertiary}
                />
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.metricCard}>
            <Card.Content>
              <Text style={styles.metricTitle}>Click Rate</Text>
              <Text style={styles.metricValue}>
                {Math.round(mockCampaigns.reduce((sum, campaign) => sum + getClickRate(campaign), 0) / mockCampaigns.length)}%
              </Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Best Performing: Summer Solar Promotion</Text>
                <ProgressBar 
                  progress={Math.max(...mockCampaigns.map(campaign => getClickRate(campaign))) / 100} 
                  color={theme.colors.error}
                />
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search campaigns..."
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={{ elevation: 0 }}
          />
        </View>

        <View style={styles.filtersContainer}>
          <Chip 
            style={styles.filterChip}
            selected={activeFilters.all}
            onPress={() => toggleFilter('all')}
          >
            All
          </Chip>
          <Chip 
            style={styles.filterChip}
            selected={activeFilters.active}
            onPress={() => toggleFilter('active')}
          >
            Active
          </Chip>
          <Chip 
            style={styles.filterChip}
            selected={activeFilters.scheduled}
            onPress={() => toggleFilter('scheduled')}
          >
            Scheduled
          </Chip>
          <Chip 
            style={styles.filterChip}
            selected={activeFilters.draft}
            onPress={() => toggleFilter('draft')}
          >
            Draft
          </Chip>
          <Chip 
            style={styles.filterChip}
            selected={activeFilters.completed}
            onPress={() => toggleFilter('completed')}
          >
            Completed
          </Chip>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tableContainer}>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Name</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Type</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Target</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Date Range</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
                </DataTable.Header>
                
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <DataTable.Row key={campaign.id} style={styles.tableRow}>
                      <DataTable.Cell style={styles.tableCell}><Text style={styles.tableText}>{campaign.name}</Text></DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <Chip 
                          style={[styles.typeChip, { backgroundColor: getBackgroundColor(getTypeColor(campaign.type)) }]}
                          textStyle={{ color: getTypeColor(campaign.type) }}
                        >
                          {campaign.type}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <Chip 
                          style={[styles.statusChip, { backgroundColor: getBackgroundColor(getStatusColor(campaign.status)) }]}
                          textStyle={{ color: getStatusColor(campaign.status) }}
                        >
                          {campaign.status}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <Chip 
                          style={[styles.targetChip, { backgroundColor: getBackgroundColor(getTargetColor(campaign.target)) }]}
                          textStyle={{ color: getTargetColor(campaign.target) }}
                        >
                          {campaign.target.replace('_', ' ')}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}><Text style={styles.tableText}>{campaign.startDate} - {campaign.endDate}</Text></DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() => openMenu(campaign)}
                        />
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text variant="titleMedium">No campaigns found</Text>
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'Try adjusting your search or filters' : 'Create a new campaign to get started'}
                    </Text>
                  </View>
                )}
              </DataTable>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(admin)/marketing/new')}
      />
      
      {/* Menu for actions */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Campaign" />
          <Menu.Item onPress={() => handleAction('duplicate')} title="Duplicate" />
          <Menu.Item onPress={() => handleAction('pause')} title="Pause/Resume" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete Campaign" />
        </Menu>
        
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to {selectedAction} the campaign "{selectedCampaign?.name || 'this campaign'}"?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={closeDialog}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
} 