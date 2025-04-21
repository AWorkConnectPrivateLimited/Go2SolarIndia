import { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, Searchbar, Menu, Portal, Dialog, Paragraph, useTheme, Divider, IconButton } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for demonstration
const mockServiceRequests = [
  { 
    id: '1', 
    customer: 'John Doe', 
    project: 'Home Solar System', 
    type: 'maintenance', 
    status: 'open', 
    priority: 'high',
    description: 'Inverter not functioning properly',
    date: '2023-06-15',
    assignedTo: 'Unassigned'
  },
  { 
    id: '2', 
    customer: 'Jane Smith', 
    project: 'Digital Solar Investment', 
    type: 'repair', 
    status: 'assigned', 
    priority: 'medium',
    description: 'Solar panel efficiency dropped by 20%',
    date: '2023-06-14',
    assignedTo: 'Mike Johnson'
  },
  { 
    id: '3', 
    customer: 'Bob Johnson', 
    project: 'Commercial Solar', 
    type: 'inspection', 
    status: 'in_progress', 
    priority: 'low',
    description: 'Annual maintenance check required',
    date: '2023-06-13',
    assignedTo: 'Sarah Williams'
  },
  { 
    id: '4', 
    customer: 'Alice Brown', 
    project: 'Community Solar', 
    type: 'maintenance', 
    status: 'resolved', 
    priority: 'medium',
    description: 'Battery backup system not charging',
    date: '2023-06-12',
    assignedTo: 'David Miller'
  },
];

export default function ServiceRequestsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRequests, setFilteredRequests] = useState(mockServiceRequests);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    all: true,
    open: false,
    inProgress: false,
    resolved: false,
    highPriority: false
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
    let filtered = [...mockServiceRequests];
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        request => 
          request.customer.toLowerCase().includes(query.toLowerCase()) ||
          request.project.toLowerCase().includes(query.toLowerCase()) ||
          request.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply status filters
    if (!filters.all) {
      if (filters.open) {
        filtered = filtered.filter(request => request.status === 'open');
      }
      if (filters.inProgress) {
        filtered = filtered.filter(request => request.status === 'in_progress');
      }
      if (filters.resolved) {
        filtered = filtered.filter(request => request.status === 'resolved');
      }
      if (filters.highPriority) {
        filtered = filtered.filter(request => request.priority === 'high');
      }
    }
    
    setFilteredRequests(filtered);
  };

  const openMenu = (request: any) => {
    setSelectedRequest(request);
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
      case 'open':
        return theme.colors.error;
      case 'assigned':
        return theme.colors.tertiary;
      case 'in_progress':
        return theme.colors.primary;
      case 'resolved':
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.tertiary;
      case 'low':
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getColorWithOpacity = (color: string, opacity: number) => {
    // Handle both hex and rgba colors
    if (color.startsWith('#')) {
      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else if (color.startsWith('rgb')) {
      // Extract RGB values from rgba/rgb string
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
      }
    }
    // Return original color if parsing fails
    return color;
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
    priorityChip: {
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
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Service Requests</Text>
        <Button 
          mode="contained" 
          onPress={() => router.push('/(admin)/service-requests/new')}
          icon="plus"
        >
          New Request
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search requests..."
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
          selected={activeFilters.open}
          onPress={() => toggleFilter('open')}
        >
          Open
        </Chip>
        <Chip 
          style={styles.filterChip}
          selected={activeFilters.inProgress}
          onPress={() => toggleFilter('inProgress')}
        >
          In Progress
        </Chip>
        <Chip 
          style={styles.filterChip}
          selected={activeFilters.resolved}
          onPress={() => toggleFilter('resolved')}
        >
          Resolved
        </Chip>
        <Chip 
          style={styles.filterChip}
          selected={activeFilters.highPriority}
          onPress={() => toggleFilter('highPriority')}
        >
          High Priority
        </Chip>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>ID</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Customer</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Type</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Priority</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Date</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>
              
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <DataTable.Row key={request.id} style={styles.tableRow}>
                    <DataTable.Cell style={styles.tableCell}><Text style={styles.tableText}>{request.id}</Text></DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}><Text style={styles.tableText}>{request.customer}</Text></DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}><Text style={styles.tableText}>{request.type}</Text></DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Chip 
                        style={[styles.statusChip, { backgroundColor: getColorWithOpacity(getStatusColor(request.status), 0.2) }]}
                        textStyle={{ color: getStatusColor(request.status) }}
                      >
                        {request.status.replace('_', ' ')}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Chip 
                        style={[styles.priorityChip, { backgroundColor: getColorWithOpacity(getPriorityColor(request.priority), 0.2) }]}
                        textStyle={{ color: getPriorityColor(request.priority) }}
                      >
                        {request.priority}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}><Text style={styles.tableText}>{request.date}</Text></DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={() => openMenu(request)}
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text variant="titleMedium">No service requests found</Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'Try adjusting your search or filters' : 'Create a new service request to get started'}
                  </Text>
                </View>
              )}
            </DataTable>
          </View>
        </Card.Content>
      </Card>
      
      {/* Menu for actions */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Request" />
          <Menu.Item onPress={() => handleAction('assign')} title="Assign to Agent" />
          <Menu.Item onPress={() => handleAction('update')} title="Update Status" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete Request" />
        </Menu>
        
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to {selectedAction} the service request for {selectedRequest?.customer || 'this customer'}?
            </Paragraph>
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