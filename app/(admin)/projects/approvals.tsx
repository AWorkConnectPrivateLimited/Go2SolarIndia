import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, Portal, Dialog, TextInput, SegmentedButtons, Menu, IconButton, Chip, ProgressBar, List, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useTheme } from 'react-native-paper';

// Mock data for project approvals
const mockApprovals = [
  {
    id: '1',
    customerName: 'Rajesh Kumar',
    projectType: 'Physical Solar',
    capacity: '5 kW',
    estimatedCost: 350000,
    location: 'Mumbai, Maharashtra',
    submittedDate: '2023-06-10',
    status: 'pending',
    priority: 'high',
  },
  {
    id: '2',
    customerName: 'Priya Sharma',
    projectType: 'Digital Solar',
    capacity: '3 kW',
    estimatedCost: 180000,
    location: 'Delhi, NCR',
    submittedDate: '2023-06-11',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: '3',
    customerName: 'Amit Patel',
    projectType: 'Physical Solar',
    capacity: '10 kW',
    estimatedCost: 750000,
    location: 'Ahmedabad, Gujarat',
    submittedDate: '2023-06-12',
    status: 'pending',
    priority: 'high',
  },
  {
    id: '4',
    customerName: 'Sneha Reddy',
    projectType: 'Digital Solar',
    capacity: '4 kW',
    estimatedCost: 240000,
    location: 'Hyderabad, Telangana',
    submittedDate: '2023-06-13',
    status: 'pending',
    priority: 'low',
  },
  {
    id: '5',
    customerName: 'Vikram Singh',
    projectType: 'Physical Solar',
    capacity: '7.5 kW',
    estimatedCost: 525000,
    location: 'Pune, Maharashtra',
    submittedDate: '2023-06-14',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: '6',
    customerName: 'Anjali Desai',
    projectType: 'Digital Solar',
    capacity: '2.5 kW',
    estimatedCost: 150000,
    location: 'Bangalore, Karnataka',
    submittedDate: '2023-06-15',
    status: 'pending',
    priority: 'low',
  },
];

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#F44336';
    case 'medium':
      return '#FF9800';
    case 'low':
      return '#4CAF50';
    default:
      return '#9E9E9E';
  }
};

// Get priority text
const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Unknown';
  }
};

export default function ProjectApprovalsScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApprovals, setFilteredApprovals] = useState(mockApprovals);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [approvalDialogVisible, setApprovalDialogVisible] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      filterApprovals();
    }, 2000);
  };

  // Filter approvals based on search query and filters
  const filterApprovals = () => {
    let filtered = [...mockApprovals];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(approval =>
        approval.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(approval => approval.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(approval => approval.projectType === typeFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(approval => approval.priority === priorityFilter);
    }
    
    setFilteredApprovals(filtered);
  };

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterApprovals();
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    filterApprovals();
  };

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    filterApprovals();
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
    filterApprovals();
  };

  // Open approval details dialog
  const openDetailsDialog = (approval: any) => {
    setSelectedApproval(approval);
    setDialogVisible(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogVisible(false);
  };

  // Open menu
  const openMenu = (approval: any, event: any) => {
    setSelectedApproval(approval);
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
        openDetailsDialog(selectedApproval);
        break;
      case 'approve':
        setApprovalAction('approve');
        setApprovalDialogVisible(true);
        break;
      case 'reject':
        setApprovalAction('reject');
        setApprovalDialogVisible(true);
        break;
    }
  };

  // Handle approval action
  const handleApprovalAction = () => {
    if (!selectedApproval || !approvalAction) return;
    
    // In a real app, this would update the backend
    console.log(`Project ${selectedApproval.id} ${approvalAction}d with notes: ${approvalNotes}`);
    
    // Update the local state
    const updatedApprovals = mockApprovals.map(approval => {
      if (approval.id === selectedApproval.id) {
        return {
          ...approval,
          status: approvalAction === 'approve' ? 'approved' : 'rejected',
        };
      }
      return approval;
    });
    
    // Update the filtered approvals
    setFilteredApprovals(updatedApprovals.filter(approval => 
      approval.id === selectedApproval.id ? approval.status === 'pending' : true
    ));
    
    // Close the dialog
    setApprovalDialogVisible(false);
    setApprovalAction(null);
    setApprovalNotes('');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Apply filters when component mounts or filters change
  useEffect(() => {
    filterApprovals();
  }, [searchQuery, statusFilter, typeFilter, priorityFilter]);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium">Project Approvals</Text>
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
              placeholder="Search by customer or location..."
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
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
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
                  buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'Physical Solar', label: 'Physical' },
                    { value: 'Digital Solar', label: 'Digital' },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Priority:</Text>
              <View style={styles.filterContainer}>
                <SegmentedButtons
                  value={priorityFilter}
                  onValueChange={handlePriorityFilterChange}
                  buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ]}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Approvals Table */}
        <Card style={styles.tableCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.tableTitle}>Pending Approvals</Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Customer</DataTable.Title>
                <DataTable.Title>Project</DataTable.Title>
                <DataTable.Title numeric>Cost</DataTable.Title>
                <DataTable.Title>Priority</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredApprovals.length > 0 ? (
                filteredApprovals.map((approval) => (
                  <DataTable.Row key={approval.id} onPress={() => openDetailsDialog(approval)}>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">{approval.customerName}</Text>
                      <Text variant="bodySmall">{approval.location}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text variant="bodyMedium">{approval.projectType}</Text>
                      <Text variant="bodySmall">{approval.capacity}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodyMedium">{formatCurrency(approval.estimatedCost)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        style={{ backgroundColor: getPriorityColor(approval.priority) }}
                        textStyle={{ color: 'white' }}
                      >
                        {getPriorityText(approval.priority)}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={(event) => openMenu(approval, event)}
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <DataTable.Row>
                  <DataTable.Cell>
                    <Text variant="bodyMedium" style={styles.emptyText}>No approvals found</Text>
                  </DataTable.Cell>
                  <DataTable.Cell />
                  <DataTable.Cell />
                  <DataTable.Cell />
                  <DataTable.Cell />
                </DataTable.Row>
              )}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Approval Details Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Project Details</Dialog.Title>
          <Dialog.Content>
            {selectedApproval && (
              <View>
                <Text variant="titleMedium">{selectedApproval.customerName}</Text>
                <Text variant="bodySmall" style={styles.dialogSubtitle}>{selectedApproval.location}</Text>
                
                <Divider style={styles.divider} />
                
                <List.Item
                  title="Project Type"
                  description={selectedApproval.projectType}
                  left={props => <List.Icon {...props} icon="solar-power" />}
                />
                
                <List.Item
                  title="Capacity"
                  description={selectedApproval.capacity}
                  left={props => <List.Icon {...props} icon="lightning-bolt" />}
                />
                
                <List.Item
                  title="Estimated Cost"
                  description={formatCurrency(selectedApproval.estimatedCost)}
                  left={props => <List.Icon {...props} icon="cash" />}
                />
                
                <List.Item
                  title="Priority"
                  description={
                    <Chip
                      style={{ backgroundColor: getPriorityColor(selectedApproval.priority) }}
                      textStyle={{ color: 'white' }}
                    >
                      {getPriorityText(selectedApproval.priority)}
                    </Chip>
                  }
                  left={props => <List.Icon {...props} icon="flag" />}
                />
                
                <List.Item
                  title="Submitted Date"
                  description={formatDate(selectedApproval.submittedDate)}
                  left={props => <List.Icon {...props} icon="calendar" />}
                />
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Close</Button>
            <Button onPress={() => {
              closeDialog();
              setApprovalAction('approve');
              setApprovalDialogVisible(true);
            }}>
              Approve
            </Button>
            <Button onPress={() => {
              closeDialog();
              setApprovalAction('reject');
              setApprovalDialogVisible(true);
            }}>
              Reject
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Approval Action Dialog */}
        <Dialog visible={approvalDialogVisible} onDismiss={() => setApprovalDialogVisible(false)}>
          <Dialog.Title>
            {approvalAction === 'approve' ? 'Approve Project' : 'Reject Project'}
          </Dialog.Title>
          <Dialog.Content>
            {selectedApproval && (
              <View>
                <Text variant="bodyMedium">
                  {approvalAction === 'approve' 
                    ? `Are you sure you want to approve the project for ${selectedApproval.customerName}?` 
                    : `Are you sure you want to reject the project for ${selectedApproval.customerName}?`}
                </Text>
                
                <TextInput
                  label="Notes"
                  value={approvalNotes}
                  onChangeText={setApprovalNotes}
                  multiline
                  numberOfLines={3}
                  style={styles.notesInput}
                />
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setApprovalDialogVisible(false)}>Cancel</Button>
            <Button 
              mode="contained"
              onPress={handleApprovalAction}
              buttonColor={approvalAction === 'approve' ? '#4CAF50' : '#F44336'}
            >
              {approvalAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Approval Actions Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={menuAnchor}
        >
          <Menu.Item onPress={() => handleMenuAction('details')} title="View Details" />
          <Menu.Item onPress={() => handleMenuAction('approve')} title="Approve" />
          <Menu.Item onPress={() => handleMenuAction('reject')} title="Reject" />
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
  tableCard: {
    marginBottom: 16,
  },
  tableTitle: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  dialogSubtitle: {
    marginBottom: 8,
    opacity: 0.7,
  },
  notesInput: {
    marginTop: 16,
  },
}); 