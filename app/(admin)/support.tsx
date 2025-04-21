import { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, Searchbar, Menu, Portal, Dialog, Paragraph, useTheme, Divider, IconButton, FAB, Avatar, Badge } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for demonstration
const mockTickets = [
  { 
    id: '1', 
    customer: 'John Doe', 
    subject: 'Inverter not working', 
    category: 'technical', 
    priority: 'high',
    status: 'open',
    assignedTo: 'Mike Johnson',
    lastUpdated: '2023-06-15 14:30',
    messages: 5
  },
  { 
    id: '2', 
    customer: 'Jane Smith', 
    subject: 'Billing issue', 
    category: 'billing', 
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'Sarah Williams',
    lastUpdated: '2023-06-14 16:45',
    messages: 3
  },
  { 
    id: '3', 
    customer: 'Bob Johnson', 
    subject: 'Installation delay', 
    category: 'installation', 
    priority: 'high',
    status: 'pending',
    assignedTo: 'Unassigned',
    lastUpdated: '2023-06-13 09:15',
    messages: 2
  },
  { 
    id: '4', 
    customer: 'Alice Brown', 
    subject: 'App login problem', 
    category: 'account', 
    priority: 'low',
    status: 'resolved',
    assignedTo: 'David Miller',
    lastUpdated: '2023-06-12 11:20',
    messages: 4
  },
];

export default function SupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTickets, setFilteredTickets] = useState(mockTickets);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    all: true,
    open: false,
    inProgress: false,
    pending: false,
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
    let filtered = [...mockTickets];
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        ticket => 
          ticket.customer.toLowerCase().includes(query.toLowerCase()) ||
          ticket.subject.toLowerCase().includes(query.toLowerCase()) ||
          ticket.category.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply status filters
    if (!filters.all) {
      if (filters.open) {
        filtered = filtered.filter(ticket => ticket.status === 'open');
      }
      if (filters.inProgress) {
        filtered = filtered.filter(ticket => ticket.status === 'in_progress');
      }
      if (filters.pending) {
        filtered = filtered.filter(ticket => ticket.status === 'pending');
      }
      if (filters.resolved) {
        filtered = filtered.filter(ticket => ticket.status === 'resolved');
      }
      if (filters.highPriority) {
        filtered = filtered.filter(ticket => ticket.priority === 'high');
      }
    }
    
    setFilteredTickets(filtered);
  };

  const openMenu = (ticket: any) => {
    setSelectedTicket(ticket);
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
      case 'in_progress':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return theme.colors.primary;
      case 'billing':
        return theme.colors.secondary;
      case 'installation':
        return theme.colors.tertiary;
      case 'account':
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
    categoryChip: {
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
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    statCard: {
      width: isSmallScreen ? '100%' : isMediumScreen ? '48%' : '23%',
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    statTitle: {
      fontSize: getFontSize(14),
      marginBottom: getResponsiveSize(4, 6, 8),
    },
    statValue: {
      fontSize: getFontSize(20),
      fontWeight: 'bold',
    },
    statSubtext: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    avatar: {
      backgroundColor: theme.colors.primary,
    },
    badge: {
      position: 'absolute',
      top: -5,
      right: -5,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Support Center</Text>
          <Button 
            mode="contained" 
            onPress={() => router.push('/(admin)/support/analytics')}
            icon="chart-bar"
          >
            Analytics
          </Button>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>Open Tickets</Text>
              <Text style={styles.statValue}>
                {mockTickets.filter(ticket => ticket.status === 'open').length}
              </Text>
              <Text style={styles.statSubtext}>
                {Math.round((mockTickets.filter(ticket => ticket.status === 'open').length / mockTickets.length) * 100)}% of total
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>In Progress</Text>
              <Text style={styles.statValue}>
                {mockTickets.filter(ticket => ticket.status === 'in_progress').length}
              </Text>
              <Text style={styles.statSubtext}>
                Avg. resolution time: 2.5 days
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>High Priority</Text>
              <Text style={styles.statValue}>
                {mockTickets.filter(ticket => ticket.priority === 'high').length}
              </Text>
              <Text style={styles.statSubtext}>
                Requires immediate attention
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statTitle}>Resolved Today</Text>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statSubtext}>
                Customer satisfaction: 4.8/5
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search tickets..."
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
            selected={activeFilters.pending}
            onPress={() => toggleFilter('pending')}
          >
            Pending
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
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Customer</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Subject</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Category</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Priority</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
                </DataTable.Header>
                
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <DataTable.Row key={ticket.id} style={styles.tableRow}>
                      <DataTable.Cell style={styles.tableCell}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Avatar.Text 
                            size={32} 
                            label={ticket.customer.split(' ').map(n => n[0]).join('')} 
                            style={styles.avatar}
                          />
                          <View style={{ marginLeft: 8 }}>
                            <Text style={styles.tableText}>{ticket.customer}</Text>
                            <Text style={[styles.tableText, { color: theme.colors.onSurfaceVariant }]}>
                              {ticket.lastUpdated}
                            </Text>
                          </View>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <View>
                          <Text style={styles.tableText}>{ticket.subject}</Text>
                          <Badge 
                            size={16} 
                            style={styles.badge}
                          >
                            {ticket.messages}
                          </Badge>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <Chip 
                          style={[styles.categoryChip, { backgroundColor: getBackgroundColor(getCategoryColor(ticket.category)) }]}
                          textStyle={{ color: getCategoryColor(ticket.category) }}
                        >
                          {ticket.category}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <Chip 
                          style={[styles.statusChip, { backgroundColor: getBackgroundColor(getStatusColor(ticket.status)) }]}
                          textStyle={{ color: getStatusColor(ticket.status) }}
                        >
                          {ticket.status.replace('_', ' ')}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <Chip 
                          style={[styles.priorityChip, { backgroundColor: getBackgroundColor(getPriorityColor(ticket.priority)) }]}
                          textStyle={{ color: getPriorityColor(ticket.priority) }}
                        >
                          {ticket.priority}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.tableCell}>
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() => openMenu(ticket)}
                        />
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text variant="titleMedium">No tickets found</Text>
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'Try adjusting your search or filters' : 'Create a new ticket to get started'}
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
        onPress={() => router.push('/(admin)/support/new')}
      />
      
      {/* Menu for actions */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Ticket" />
          <Menu.Item onPress={() => handleAction('assign')} title="Assign to Agent" />
          <Menu.Item onPress={() => handleAction('update')} title="Update Status" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete Ticket" />
        </Menu>
        
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to {selectedAction} the ticket for {selectedTicket?.customer || 'this customer'}?
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