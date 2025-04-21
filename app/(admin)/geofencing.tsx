import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions, Alert } from 'react-native';
import { Text, Button, Card, Chip, useTheme, Portal, Dialog, TextInput, IconButton, Divider, List, Avatar, FAB, Menu, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';

// Mock data for demonstration
const mockZones = [
  {
    id: '1',
    name: 'Mumbai Central',
    center: { latitude: 19.0760, longitude: 72.8777 },
    radius: 5000, // in meters
    color: '#FF5252',
    agentCount: 5,
    customerCount: 120,
    projectCount: 45,
    activeAgents: [
      { id: '1', name: 'Mike Johnson', status: 'available' },
      { id: '2', name: 'Sarah Williams', status: 'busy' },
    ]
  },
  {
    id: '2',
    name: 'Delhi North',
    center: { latitude: 28.7041, longitude: 77.1025 },
    radius: 8000,
    color: '#4CAF50',
    agentCount: 8,
    customerCount: 180,
    projectCount: 72,
    activeAgents: [
      { id: '3', name: 'David Miller', status: 'available' },
      { id: '4', name: 'Emily Brown', status: 'offline' },
    ]
  },
  {
    id: '3',
    name: 'Bangalore Tech Park',
    center: { latitude: 12.9716, longitude: 77.5946 },
    radius: 3000,
    color: '#2196F3',
    agentCount: 3,
    customerCount: 85,
    projectCount: 32,
    activeAgents: [
      { id: '5', name: 'James Wilson', status: 'available' },
    ]
  },
];

const mockAgents = [
  { id: '1', name: 'Mike Johnson', email: 'mike@example.com', status: 'available', zoneId: '1' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@example.com', status: 'busy', zoneId: '1' },
  { id: '3', name: 'David Miller', email: 'david@example.com', status: 'available', zoneId: '2' },
  { id: '4', name: 'Emily Brown', email: 'emily@example.com', status: 'offline', zoneId: '2' },
  { id: '5', name: 'James Wilson', email: 'james@example.com', status: 'available', zoneId: '3' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa@example.com', status: 'available', zoneId: null },
  { id: '7', name: 'Robert Taylor', email: 'robert@example.com', status: 'busy', zoneId: null },
];

export default function GeofencingScreen() {
  const [zones, setZones] = useState(mockZones);
  const [agents, setAgents] = useState(mockAgents);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [assignDialogVisible, setAssignDialogVisible] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState('5000');
  const [newZoneColor, setNewZoneColor] = useState('#FF5252');
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.colors.primary;
      case 'busy':
        return theme.colors.error;
      case 'offline':
        return theme.colors.onSurfaceDisabled;
      default:
        return theme.colors.onSurface;
    }
  };

  const openCreateDialog = () => {
    setNewZoneName('');
    setNewZoneRadius('5000');
    setNewZoneColor('#FF5252');
    setCreateDialogVisible(true);
  };

  const openEditDialog = (zone: any) => {
    setSelectedZone(zone);
    setNewZoneName(zone.name);
    setNewZoneRadius(zone.radius.toString());
    setNewZoneColor(zone.color);
    setEditDialogVisible(true);
  };

  const openAssignDialog = (zone: any) => {
    setSelectedZone(zone);
    setAssignDialogVisible(true);
  };

  const handleCreateZone = () => {
    if (!newZoneName.trim()) {
      Alert.alert('Error', 'Please enter a zone name');
      return;
    }

    const newZone = {
      id: (zones.length + 1).toString(),
      name: newZoneName,
      center: mapRegion,
      radius: parseInt(newZoneRadius),
      color: newZoneColor,
      agentCount: 0,
      customerCount: 0,
      projectCount: 0,
      activeAgents: []
    };

    setZones([...zones, newZone]);
    setCreateDialogVisible(false);
  };

  const handleEditZone = () => {
    if (!newZoneName.trim()) {
      Alert.alert('Error', 'Please enter a zone name');
      return;
    }

    const updatedZones = zones.map(zone => 
      zone.id === selectedZone.id 
        ? { 
            ...zone, 
            name: newZoneName, 
            radius: parseInt(newZoneRadius),
            color: newZoneColor
          } 
        : zone
    );

    setZones(updatedZones);
    setEditDialogVisible(false);
  };

  const handleDeleteZone = (zoneId: string) => {
    Alert.alert(
      'Delete Zone',
      'Are you sure you want to delete this zone? This will unassign all agents from this zone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Unassign agents from this zone
            const updatedAgents = agents.map(agent => 
              agent.zoneId === zoneId ? { ...agent, zoneId: null } : agent
            );
            setAgents(updatedAgents);

            // Remove the zone
            const updatedZones = zones.filter(zone => zone.id !== zoneId);
            setZones(updatedZones);
          }
        }
      ]
    );
  };

  const handleAssignAgent = (agent: any) => {
    // Update agent's zone assignment
    const updatedAgents = agents.map(a => 
      a.id === agent.id ? { ...a, zoneId: selectedZone.id } : a
    );
    setAgents(updatedAgents);

    // Update zone's agent count and active agents list
    const updatedZones = zones.map(zone => {
      if (zone.id === selectedZone.id) {
        const agentExists = zone.activeAgents.some(a => a.id === agent.id);
        return {
          ...zone,
          agentCount: agentExists ? zone.agentCount : zone.agentCount + 1,
          activeAgents: agentExists 
            ? zone.activeAgents 
            : [...zone.activeAgents, { id: agent.id, name: agent.name, status: agent.status }]
        };
      }
      return zone;
    });
    setZones(updatedZones);

    setAssignDialogVisible(false);
  };

  const handleUnassignAgent = (zoneId: string, agentId: string) => {
    // Update agent's zone assignment
    const updatedAgents = agents.map(agent => 
      agent.id === agentId ? { ...agent, zoneId: null } : agent
    );
    setAgents(updatedAgents);

    // Update zone's agent count and active agents list
    const updatedZones = zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          agentCount: zone.agentCount - 1,
          activeAgents: zone.activeAgents.filter(a => a.id !== agentId)
        };
      }
      return zone;
    });
    setZones(updatedZones);
  };

  const openAgentMenu = (agent: any) => {
    setSelectedAgent(agent);
    setMenuVisible(true);
  };

  const closeAgentMenu = () => {
    setMenuVisible(false);
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
    mapContainer: {
      height: getResponsiveSize(200, 250, 300),
      marginBottom: getResponsiveSize(16, 20, 24),
      borderRadius: 8,
      overflow: 'hidden',
    },
    map: {
      flex: 1,
    },
    zoneList: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    zoneCard: {
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    zoneHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    zoneName: {
      fontSize: getFontSize(16),
      fontWeight: 'bold',
    },
    zoneStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    statItem: {
      marginRight: getResponsiveSize(12, 16, 20),
      marginBottom: getResponsiveSize(4, 6, 8),
    },
    statLabel: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    statValue: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
    },
    agentList: {
      marginTop: getResponsiveSize(8, 12, 16),
    },
    agentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: getResponsiveSize(4, 6, 8),
    },
    agentAvatar: {
      marginRight: getResponsiveSize(8, 12, 16),
    },
    agentInfo: {
      flex: 1,
    },
    agentName: {
      fontSize: getFontSize(14),
    },
    agentStatus: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    agentStatusDot: {
      width: getResponsiveSize(8, 10, 12),
      height: getResponsiveSize(8, 10, 12),
      borderRadius: getResponsiveSize(4, 5, 6),
      marginRight: getResponsiveSize(4, 6, 8),
    },
    zoneActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: getResponsiveSize(8, 12, 16),
    },
    actionButton: {
      marginLeft: getResponsiveSize(8, 12, 16),
    },
    fab: {
      position: 'absolute',
      margin: getResponsiveSize(16, 20, 24),
      right: 0,
      bottom: 0,
    },
    dialogInput: {
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    colorPicker: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    colorOption: {
      width: getResponsiveSize(32, 40, 48),
      height: getResponsiveSize(32, 40, 48),
      borderRadius: getResponsiveSize(16, 20, 24),
      marginHorizontal: getResponsiveSize(4, 6, 8),
    },
    colorOptionSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    assignList: {
      maxHeight: getResponsiveSize(200, 250, 300),
    },
    assignItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: getResponsiveSize(8, 12, 16),
    },
    assignItemInfo: {
      flex: 1,
      marginLeft: getResponsiveSize(8, 12, 16),
    },
    assignItemName: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
    },
    assignItemEmail: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    assignItemStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    assignItemStatusText: {
      fontSize: getFontSize(12),
      marginLeft: getResponsiveSize(4, 6, 8),
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveSize(32, 40, 48),
    },
    emptyStateText: {
      fontSize: getFontSize(16),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginTop: getResponsiveSize(8, 12, 16),
    },
  });

  const colorOptions = [
    '#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF9800', '#795548', '#607D8B'
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Geofencing Zones</Text>
          <Button 
            mode="outlined" 
            onPress={() => router.back()}
            icon="arrow-left"
          >
            Back
          </Button>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
          >
            {zones.map(zone => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                fillColor={`${zone.color}33`}
                strokeColor={zone.color}
                strokeWidth={2}
                onPress={() => openEditDialog(zone)}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.zoneList}>
          {zones.length > 0 ? (
            zones.map(zone => (
              <Card key={zone.id} style={styles.zoneCard}>
                <Card.Content>
                  <View style={styles.zoneHeader}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Chip 
                      style={{ backgroundColor: `${zone.color}33` }}
                      textStyle={{ color: zone.color }}
                    >
                      {zone.radius / 1000}km radius
                    </Chip>
                  </View>

                  <View style={styles.zoneStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Agents</Text>
                      <Text style={styles.statValue}>{zone.agentCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Customers</Text>
                      <Text style={styles.statValue}>{zone.customerCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Projects</Text>
                      <Text style={styles.statValue}>{zone.projectCount}</Text>
                    </View>
                  </View>

                  {zone.activeAgents.length > 0 && (
                    <View style={styles.agentList}>
                      <Text style={{ fontSize: getFontSize(14), marginBottom: getResponsiveSize(4, 6, 8) }}>
                        Active Agents
                      </Text>
                      {zone.activeAgents.map(agent => (
                        <View key={agent.id} style={styles.agentItem}>
                          <Avatar.Text 
                            size={32} 
                            label={agent.name.split(' ').map((n: string) => n[0]).join('')} 
                            style={styles.agentAvatar}
                          />
                          <View style={styles.agentInfo}>
                            <Text style={styles.agentName}>{agent.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View 
                                style={[
                                  styles.agentStatusDot, 
                                  { backgroundColor: getStatusColor(agent.status) }
                                ]} 
                              />
                              <Text style={styles.agentStatus}>
                                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                              </Text>
                            </View>
                          </View>
                          <IconButton 
                            icon="close" 
                            size={20} 
                            onPress={() => handleUnassignAgent(zone.id, agent.id)} 
                          />
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.zoneActions}>
                    <Button 
                      mode="outlined" 
                      onPress={() => openAssignDialog(zone)}
                      style={styles.actionButton}
                    >
                      Assign Agent
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => openEditDialog(zone)}
                      style={styles.actionButton}
                    >
                      Edit
                    </Button>
                    <Button 
                      mode="outlined" 
                      textColor={theme.colors.error}
                      onPress={() => handleDeleteZone(zone.id)}
                      style={styles.actionButton}
                    >
                      Delete
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No geofencing zones created yet</Text>
              <Button 
                mode="contained" 
                onPress={openCreateDialog}
                style={{ marginTop: getResponsiveSize(16, 20, 24) }}
              >
                Create First Zone
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreateDialog}
        label="New Zone"
      />

      {/* Create Zone Dialog */}
      <Portal>
        <Dialog visible={createDialogVisible} onDismiss={() => setCreateDialogVisible(false)}>
          <Dialog.Title>Create New Zone</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Zone Name"
              value={newZoneName}
              onChangeText={setNewZoneName}
              style={styles.dialogInput}
            />
            <TextInput
              label="Radius (meters)"
              value={newZoneRadius}
              onChangeText={setNewZoneRadius}
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <Text style={{ fontSize: getFontSize(14), marginBottom: getResponsiveSize(8, 12, 16) }}>
              Zone Color
            </Text>
            <View style={styles.colorPicker}>
              {colorOptions.map(color => (
                <View 
                  key={color}
                  style={[
                    styles.colorOption, 
                    { backgroundColor: color },
                    newZoneColor === color && styles.colorOptionSelected
                  ]}
                  onTouchEnd={() => setNewZoneColor(color)}
                />
              ))}
            </View>
            <Text style={{ fontSize: getFontSize(14), marginTop: getResponsiveSize(8, 12, 16) }}>
              Center: {mapRegion.latitude.toFixed(4)}, {mapRegion.longitude.toFixed(4)}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreateZone}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Zone Dialog */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Zone</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Zone Name"
              value={newZoneName}
              onChangeText={setNewZoneName}
              style={styles.dialogInput}
            />
            <TextInput
              label="Radius (meters)"
              value={newZoneRadius}
              onChangeText={setNewZoneRadius}
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <Text style={{ fontSize: getFontSize(14), marginBottom: getResponsiveSize(8, 12, 16) }}>
              Zone Color
            </Text>
            <View style={styles.colorPicker}>
              {colorOptions.map(color => (
                <View 
                  key={color}
                  style={[
                    styles.colorOption, 
                    { backgroundColor: color },
                    newZoneColor === color && styles.colorOptionSelected
                  ]}
                  onTouchEnd={() => setNewZoneColor(color)}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleEditZone}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Assign Agent Dialog */}
      <Portal>
        <Dialog visible={assignDialogVisible} onDismiss={() => setAssignDialogVisible(false)}>
          <Dialog.Title>Assign Agent to {selectedZone?.name}</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.assignList}>
              {agents.filter(agent => agent.zoneId !== selectedZone?.id).length > 0 ? (
                agents
                  .filter(agent => agent.zoneId !== selectedZone?.id)
                  .map(agent => (
                    <View key={agent.id} style={styles.assignItem}>
                      <Avatar.Text 
                        size={40} 
                        label={agent.name.split(' ').map((n: string) => n[0]).join('')} 
                      />
                      <View style={styles.assignItemInfo}>
                        <Text style={styles.assignItemName}>{agent.name}</Text>
                        <Text style={styles.assignItemEmail}>{agent.email}</Text>
                        <View style={styles.assignItemStatus}>
                          <View 
                            style={[
                              styles.agentStatusDot, 
                              { backgroundColor: getStatusColor(agent.status) }
                            ]} 
                          />
                          <Text style={styles.assignItemStatusText}>
                            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Button 
                        mode="contained" 
                        onPress={() => handleAssignAgent(agent)}
                      >
                        Assign
                      </Button>
                    </View>
                  ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No available agents to assign</Text>
                </View>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAssignDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Agent Menu */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeAgentMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item 
            onPress={() => {
              closeAgentMenu();
              // Navigate to agent details
            }} 
            title="View Details" 
            leadingIcon="account" 
          />
          <Menu.Item 
            onPress={() => {
              closeAgentMenu();
              // Navigate to agent performance
            }} 
            title="Performance" 
            leadingIcon="chart-line" 
          />
          <Menu.Item 
            onPress={() => {
              closeAgentMenu();
              // Navigate to agent schedule
            }} 
            title="Schedule" 
            leadingIcon="calendar" 
          />
        </Menu>
      </Portal>
    </View>
  );
} 