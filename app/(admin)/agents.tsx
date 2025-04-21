import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, Avatar, useTheme, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for agents
const mockAgents = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@go2solar.com',
    phone: '+91 9876543210',
    role: 'Installation Technician',
    status: 'Available',
    location: 'Mumbai',
    performance: 95,
    projectsCompleted: 42,
    rating: 4.8,
    lastActive: '2024-03-24 10:30 AM',
    assignedZone: 'Mumbai Central',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@go2solar.com',
    phone: '+91 9876543211',
    role: 'Sales Representative',
    status: 'On Assignment',
    location: 'Delhi',
    performance: 88,
    projectsCompleted: 38,
    rating: 4.6,
    lastActive: '2024-03-24 09:15 AM',
    assignedZone: 'Delhi South',
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@go2solar.com',
    phone: '+91 9876543212',
    role: 'Maintenance Engineer',
    status: 'Offline',
    location: 'Bangalore',
    performance: 92,
    projectsCompleted: 35,
    rating: 4.7,
    lastActive: '2024-03-23 05:45 PM',
    assignedZone: 'Bangalore East',
  },
  {
    id: '4',
    name: 'Anita Desai',
    email: 'anita.desai@go2solar.com',
    phone: '+91 9876543213',
    role: 'Customer Support',
    status: 'Available',
    location: 'Hyderabad',
    performance: 90,
    projectsCompleted: 28,
    rating: 4.5,
    lastActive: '2024-03-24 11:20 AM',
    assignedZone: 'Hyderabad Central',
  },
  {
    id: '5',
    name: 'Suresh Verma',
    email: 'suresh.verma@go2solar.com',
    phone: '+91 9876543214',
    role: 'Installation Technician',
    status: 'On Break',
    location: 'Chennai',
    performance: 87,
    projectsCompleted: 31,
    rating: 4.4,
    lastActive: '2024-03-24 10:00 AM',
    assignedZone: 'Chennai North',
  },
];

export default function AgentsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAgents, setFilteredAgents] = useState(mockAgents);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockAgents.filter(agent =>
      agent.name.toLowerCase().includes(query.toLowerCase()) ||
      agent.email.toLowerCase().includes(query.toLowerCase()) ||
      agent.role.toLowerCase().includes(query.toLowerCase()) ||
      agent.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAgents(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return theme.colors.primary;
      case 'on assignment':
        return theme.colors.secondary;
      case 'offline':
        return theme.colors.error;
      case 'on break':
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return '#2196F333'; // Primary color with 20% opacity
      case 'on assignment':
        return '#00968833'; // Secondary color with 20% opacity
      case 'offline':
        return '#F4433633'; // Error color with 20% opacity
      case 'on break':
        return '#9C27B033'; // Tertiary color with 20% opacity
      default:
        return '#9E9E9E33'; // Outline color with 20% opacity
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return theme.colors.primary;
    if (performance >= 80) return theme.colors.secondary;
    if (performance >= 70) return theme.colors.tertiary;
    return theme.colors.error;
  };

  const openMenu = (agent: any) => {
    setSelectedAgent(agent);
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
    agentCard: {
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    agentCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    agentInfo: {
      flex: 1,
      marginLeft: getResponsiveSize(12, 16, 20),
    },
    agentName: {
      fontSize: getFontSize(16),
      fontWeight: 'bold',
    },
    agentRole: {
      fontSize: getFontSize(14),
      color: theme.colors.onSurfaceVariant,
    },
    agentMetrics: {
      flexDirection: 'row',
      marginTop: getResponsiveSize(8, 12, 16),
      justifyContent: 'space-between',
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
    avatar: {
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Agent Management</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Manage field agents, assignments, and performance metrics
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search agents..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ marginBottom: 16 }}
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
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Agent</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Role</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Performance</Text></DataTable.Title>
                  <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
                </DataTable.Header>

                {filteredAgents.map((agent) => (
                  <DataTable.Row key={agent.id} style={styles.tableRow}>
                    <DataTable.Cell style={styles.tableCell}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Text 
                          size={40} 
                          label={getInitials(agent.name)} 
                          style={styles.avatar}
                        />
                        <View style={{ marginLeft: 8 }}>
                          <Text style={[styles.tableText, { fontWeight: 'bold' }]}>{agent.name}</Text>
                          <Text style={[styles.tableText, { fontSize: getFontSize(10) }]}>{agent.location}</Text>
                        </View>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={styles.tableText}>{agent.role}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Chip
                        textStyle={{ color: getStatusColor(agent.status) }}
                        style={[styles.chip, { backgroundColor: getStatusBackgroundColor(agent.status) }]}
                      >
                        {agent.status}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <Text style={[styles.tableText, { color: getPerformanceColor(agent.performance) }]}>
                        {agent.performance}%
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={() => openMenu(agent)}
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
          {filteredAgents.map((agent) => (
            <Card key={agent.id} style={styles.agentCard}>
              <Card.Content>
                <View style={styles.agentCardContent}>
                  <Avatar.Text 
                    size={60} 
                    label={getInitials(agent.name)} 
                    style={styles.avatar}
                  />
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Text style={styles.agentRole}>{agent.role}</Text>
                    <Chip
                      textStyle={{ color: getStatusColor(agent.status) }}
                      style={[styles.chip, { backgroundColor: getStatusBackgroundColor(agent.status), marginTop: 8 }]}
                    >
                      {agent.status}
                    </Chip>
                  </View>
                </View>
                <View style={styles.agentMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: getPerformanceColor(agent.performance) }]}>
                      {agent.performance}%
                    </Text>
                    <Text style={styles.metricLabel}>Performance</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{agent.projectsCompleted}</Text>
                    <Text style={styles.metricLabel}>Projects</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{agent.rating}</Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{agent.assignedZone}</Text>
                    <Text style={styles.metricLabel}>Zone</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                  <Button 
                    mode="outlined" 
                    onPress={() => openMenu(agent)}
                    style={{ marginRight: 8 }}
                  >
                    Actions
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={() => router.push(`/(admin)/agents/${agent.id}`)}
                  >
                    View Profile
                  </Button>
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
          <Menu.Item onPress={() => handleAction('view')} title="View Profile" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Agent" />
          <Menu.Item onPress={() => handleAction('assign')} title="Assign Task" />
          <Menu.Item onPress={() => handleAction('performance')} title="Performance Review" />
          <Menu.Item onPress={() => handleAction('delete')} title="Deactivate Agent" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedAgent?.name || 'this agent'}?
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