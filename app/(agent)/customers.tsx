import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import {
  Text,
  Searchbar,
  Card,
  Button,
  Chip,
  useTheme,
  Surface,
  IconButton,
  Menu,
  Divider,
  SegmentedButtons,
  Portal,
  Modal,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data - replace with actual API calls
const CUSTOMERS = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    address: '123 Solar Street, Mumbai',
    projectCount: 2,
    status: 'active',
    lastInteraction: '2024-03-18T10:30:00',
    projects: [
      { id: 'p1', type: 'residential', capacity: '5kW', status: 'active' },
      { id: 'p2', type: 'digital', capacity: '3kW', status: 'quote' },
    ],
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98765 43211',
    address: '456 Green Avenue, Delhi',
    projectCount: 1,
    status: 'lead',
    lastInteraction: '2024-03-17T15:45:00',
    projects: [
      { id: 'p3', type: 'commercial', capacity: '10kW', status: 'installation' },
    ],
  },
  // Add more mock customers as needed
];

const FILTERS = {
  status: ['all', 'active', 'lead', 'inactive'],
  projectType: ['all', 'residential', 'commercial', 'digital'],
};

export default function CustomersPage() {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProjectType, setSelectedProjectType] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof CUSTOMERS[0] | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    searchContainer: {
      marginBottom: 16,
    },
    filtersContainer: {
      marginBottom: 16,
    },
    filterSection: {
      marginBottom: 12,
    },
    filterLabel: {
      marginBottom: 8,
    },
    chipGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      margin: -4,
    },
    chip: {
      margin: 4,
    },
    customerCard: {
      marginBottom: 12,
    },
    customerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    customerInfo: {
      flex: 1,
    },
    customerMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    metaText: {
      marginLeft: 4,
      color: theme.colors.onSurfaceVariant,
    },
    metaSeparator: {
      marginHorizontal: 8,
      color: theme.colors.outlineVariant,
    },
    projectsList: {
      marginTop: 12,
    },
    projectItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      margin: 20,
      borderRadius: 8,
      padding: 20,
      maxHeight: '80%',
    },
    modalScroll: {
      marginTop: 16,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    detailLabel: {
      color: theme.colors.onSurfaceVariant,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
      gap: 8,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'lead':
        return '#FF9800';
      case 'inactive':
        return '#9E9E9E';
      default:
        return theme.colors.outline;
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'residential':
        return 'home';
      case 'commercial':
        return 'office-building';
      case 'digital':
        return 'solar-power';
      default:
        return 'solar-panel';
    }
  };

  const filteredCustomers = CUSTOMERS.filter((customer) => {
    const matchesSearch = searchQuery
      ? customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      : true;

    const matchesStatus =
      selectedStatus === 'all' || customer.status === selectedStatus;

    const matchesProjectType =
      selectedProjectType === 'all' ||
      customer.projects.some((p) => p.type === selectedProjectType);

    return matchesSearch && matchesStatus && matchesProjectType;
  });

  const renderCustomerCard = (customer: typeof CUSTOMERS[0]) => (
    <Surface key={customer.id} style={styles.customerCard} elevation={1}>
      <Card.Content>
        <View style={styles.customerHeader}>
          <View style={styles.customerInfo}>
            <Text variant="titleMedium">{customer.name}</Text>
            <View style={styles.customerMeta}>
              <MaterialCommunityIcons name="email" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.metaText}>
                {customer.email}
              </Text>
              <Text style={styles.metaSeparator}>•</Text>
              <MaterialCommunityIcons name="phone" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.metaText}>
                {customer.phone}
              </Text>
            </View>
          </View>
          <Menu
            visible={menuVisible === customer.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(customer.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                setSelectedCustomer(customer);
                setDetailsModalVisible(true);
              }}
              title="View Details"
              leadingIcon="account-details"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                router.push({
                  pathname: '/quote',
                  params: { customerId: customer.id }
                });
              }}
              title="Create Quote"
              leadingIcon="file-document-plus"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                router.push({
                  pathname: '/service-requests/new',
                  params: { customerId: customer.id }
                });
              }}
              title="Service Request"
              leadingIcon="wrench"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                // Handle edit
              }}
              title="Edit Customer"
              leadingIcon="pencil"
            />
          </Menu>
        </View>

        <Chip
          mode="flat"
          textStyle={{ color: getStatusColor(customer.status) }}
          style={[styles.chip, { backgroundColor: `${getStatusColor(customer.status)}20` }]}
        >
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </Chip>

        <View style={styles.projectsList}>
          {customer.projects.map((project) => (
            <View key={project.id} style={styles.projectItem}>
              <MaterialCommunityIcons
                name={getProjectTypeIcon(project.type)}
                size={20}
                color={theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">
                  {project.type.charAt(0).toUpperCase() + project.type.slice(1)} - {project.capacity}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                onPress={() => {
                  router.push({
                    pathname: '/project-details',
                    params: { projectId: project.id }
                  });
                }}
              />
            </View>
          ))}
        </View>
      </Card.Content>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Customers</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Manage your customer relationships
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search customers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Status
            </Text>
            <SegmentedButtons
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              buttons={FILTERS.status.map((status) => ({
                value: status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
              }))}
            />
          </View>

          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Project Type
            </Text>
            <SegmentedButtons
              value={selectedProjectType}
              onValueChange={setSelectedProjectType}
              buttons={FILTERS.projectType.map((type) => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
              }))}
            />
          </View>
        </View>

        {filteredCustomers.map(renderCustomerCard)}
      </ScrollView>

      <Portal>
        <Modal
          visible={detailsModalVisible}
          onDismiss={() => setDetailsModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedCustomer && (
            <>
              <Text variant="headlineSmall">Customer Details</Text>
              <ScrollView style={styles.modalScroll}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text>{selectedCustomer.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text>{selectedCustomer.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text>{selectedCustomer.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text>{selectedCustomer.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Chip
                    mode="flat"
                    textStyle={{ color: getStatusColor(selectedCustomer.status) }}
                    style={[styles.chip, { backgroundColor: `${getStatusColor(selectedCustomer.status)}20` }]}
                  >
                    {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                  </Chip>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Projects</Text>
                  <Text>{selectedCustomer.projectCount} Projects</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Interaction</Text>
                  <Text>{new Date(selectedCustomer.lastInteraction).toLocaleDateString()}</Text>
                </View>
              </ScrollView>

              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setDetailsModalVisible(false)}
                >
                  Close
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setDetailsModalVisible(false);
                    // Handle edit
                  }}
                >
                  Edit Customer
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
} 