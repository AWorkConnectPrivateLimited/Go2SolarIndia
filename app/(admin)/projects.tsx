import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, FAB, Portal, Dialog, TextInput, SegmentedButtons, Menu, IconButton, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    name: 'Home Solar System',
    customer: 'John Doe',
    type: 'physical',
    capacity: 5,
    cost: 500000,
    status: 'active',
    progress: 100,
    location: 'Mumbai, Maharashtra',
    date: '2023-06-15',
  },
  {
    id: '2',
    name: 'Digital Solar Investment',
    customer: 'Jane Smith',
    type: 'digital',
    capacity: 3,
    cost: 300000,
    status: 'pending',
    progress: 30,
    location: 'Delhi, NCR',
    date: '2023-06-14',
  },
  {
    id: '3',
    name: 'Commercial Solar Plant',
    customer: 'Bob Johnson',
    type: 'physical',
    capacity: 10,
    cost: 1000000,
    status: 'installation',
    progress: 60,
    location: 'Bangalore, Karnataka',
    date: '2023-06-13',
  },
  {
    id: '4',
    name: 'Community Solar Project',
    customer: 'Alice Brown',
    type: 'digital',
    capacity: 8,
    cost: 800000,
    status: 'quote',
    progress: 10,
    location: 'Chennai, Tamil Nadu',
    date: '2023-06-12',
  },
];

export default function ProjectsScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    customer: '',
    type: 'physical',
    capacity: '',
    cost: '',
    status: 'quote',
    location: '',
  });

  useEffect(() => {
    filterProjects();
  }, [searchQuery, typeFilter, statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filterProjects = () => {
    let filtered = [...mockProjects];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(project => project.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  };

  const openAddDialog = () => {
    setDialogType('add');
    setFormData({
      name: '',
      customer: '',
      type: 'physical',
      capacity: '',
      cost: '',
      status: 'quote',
      location: '',
    });
    setDialogVisible(true);
  };

  const openEditDialog = (project: any) => {
    setDialogType('edit');
    setSelectedProject(project);
    setFormData({
      name: project.name,
      customer: project.customer,
      type: project.type,
      capacity: project.capacity.toString(),
      cost: project.cost.toString(),
      status: project.status,
      location: project.location,
    });
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const handleSave = () => {
    // In a real app, this would call an API to save the project
    console.log('Saving project:', formData);
    closeDialog();
  };

  const openMenu = (project: any, event: any) => {
    setSelectedProject(project);
    setMenuAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleMenuAction = (action: string) => {
    closeMenu();
    
    switch (action) {
      case 'edit':
        openEditDialog(selectedProject);
        break;
      case 'delete':
        // In a real app, this would call an API to delete the project
        console.log('Deleting project:', selectedProject);
        break;
      case 'view':
        router.push(`/(admin)/projects/${selectedProject.id}`);
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'installation':
        return '#2196F3';
      case 'quote':
        return '#9C27B0';
      default:
        return '#000000';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filters */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>Filters</Text>
            
            <Searchbar
              placeholder="Search projects..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Type:</Text>
              <SegmentedButtons
                value={typeFilter}
                onValueChange={setTypeFilter}
                buttons={[
                  { value: 'all', label: 'All' },
                  { value: 'physical', label: 'Physical' },
                  { value: 'digital', label: 'Digital' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium">Status:</Text>
              <SegmentedButtons
                value={statusFilter}
                onValueChange={setStatusFilter}
                buttons={[
                  { value: 'all', label: 'All' },
                  { value: 'quote', label: 'Quote' },
                  { value: 'installation', label: 'Installation' },
                  { value: 'active', label: 'Active' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
          </Card.Content>
        </Card>
        
        {/* Projects Table */}
        <Card style={styles.tableCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.tableTitle}>Projects</Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Project</DataTable.Title>
                <DataTable.Title>Customer</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Progress</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>
              
              {filteredProjects.map((project) => (
                <DataTable.Row key={project.id}>
                  <DataTable.Cell>
                    <View>
                      <Text variant="bodyMedium">{project.name}</Text>
                      <Text variant="bodySmall">{project.type} • {project.capacity}kW</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <View>
                      <Text variant="bodyMedium">{project.customer}</Text>
                      <Text variant="bodySmall">{project.location}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Text style={{ color: getStatusColor(project.status) }}>
                      {project.status}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <View style={styles.progressCell}>
                      <ProgressBar
                        progress={project.progress / 100}
                        color={getStatusColor(project.status)}
                        style={styles.progressBar}
                      />
                      <Text variant="bodySmall">{project.progress}%</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={(event) => openMenu(project, event)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Add Project FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddDialog}
      />
      
      {/* Add/Edit Project Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>{dialogType === 'add' ? 'Add New Project' : 'Edit Project'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Project Name"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Customer Name"
              value={formData.customer}
              onChangeText={(text) => setFormData({...formData, customer: text})}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Capacity (kW)"
              value={formData.capacity}
              onChangeText={(text) => setFormData({...formData, capacity: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Cost (₹)"
              value={formData.cost}
              onChangeText={(text) => setFormData({...formData, cost: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Location"
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              mode="outlined"
              style={styles.input}
            />
            <Text variant="bodyMedium" style={styles.inputLabel}>Type</Text>
            <SegmentedButtons
              value={formData.type}
              onValueChange={(value) => setFormData({...formData, type: value})}
              buttons={[
                { value: 'physical', label: 'Physical' },
                { value: 'digital', label: 'Digital' },
              ]}
              style={styles.segmentedButtons}
            />
            <Text variant="bodyMedium" style={styles.inputLabel}>Status</Text>
            <SegmentedButtons
              value={formData.status}
              onValueChange={(value) => setFormData({...formData, status: value})}
              buttons={[
                { value: 'quote', label: 'Quote' },
                { value: 'installation', label: 'Installation' },
                { value: 'active', label: 'Active' },
              ]}
              style={styles.segmentedButtons}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
        
        {/* Project Actions Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={menuAnchor}
        >
          <Menu.Item onPress={() => handleMenuAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleMenuAction('edit')} title="Edit" />
          <Menu.Item onPress={() => handleMenuAction('delete')} title="Delete" />
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
  segmentedButtons: {
    flex: 1,
    marginLeft: 8,
  },
  tableCard: {
    marginBottom: 16,
  },
  tableTitle: {
    marginBottom: 16,
  },
  progressCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
}); 