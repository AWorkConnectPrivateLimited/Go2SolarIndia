import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, List, Divider, Portal, Dialog, ProgressBar } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';

// Mock data for demonstration
const mockProjects = {
  '1': {
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
    customerDetails: {
      email: 'john@example.com',
      phone: '+91 9876543210',
      address: '123 Main St, Mumbai, Maharashtra',
    },
    timeline: [
      { id: '1', stage: 'Quote Generated', date: '2023-06-01', status: 'completed' },
      { id: '2', stage: 'Site Survey', date: '2023-06-05', status: 'completed' },
      { id: '3', stage: 'Installation Started', date: '2023-06-10', status: 'completed' },
      { id: '4', stage: 'Installation Completed', date: '2023-06-14', status: 'completed' },
      { id: '5', stage: 'System Activated', date: '2023-06-15', status: 'completed' },
    ],
    documents: [
      { id: '1', name: 'Project Proposal', type: 'pdf', date: '2023-06-01' },
      { id: '2', name: 'Site Survey Report', type: 'pdf', date: '2023-06-05' },
      { id: '3', name: 'Installation Photos', type: 'images', date: '2023-06-14' },
      { id: '4', name: 'Completion Certificate', type: 'pdf', date: '2023-06-15' },
    ],
    performance: {
      totalGeneration: 2500,
      dailyAverage: 83.33,
      efficiency: 95,
      savings: 12500,
      carbonOffset: 1.2,
    },
    payments: [
      { id: '1', type: 'advance', amount: 250000, date: '2023-06-02', status: 'completed' },
      { id: '2', type: 'installation', amount: 200000, date: '2023-06-10', status: 'completed' },
      { id: '3', type: 'final', amount: 50000, date: '2023-06-15', status: 'completed' },
    ],
    notes: [
      { id: '1', text: 'Customer prefers morning installation', date: '2023-06-01', author: 'Sales Team' },
      { id: '2', text: 'Roof requires minor repairs before installation', date: '2023-06-05', author: 'Survey Team' },
      { id: '3', text: 'Installation completed ahead of schedule', date: '2023-06-14', author: 'Installation Team' },
    ],
  },
  // Add more mock projects as needed
};

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  
  // Get project details from mock data
  const projectDetails = mockProjects[id as keyof typeof mockProjects];
  
  if (!projectDetails) {
    return (
      <View style={styles.container}>
        <Text>Project not found</Text>
      </View>
    );
  }

  const handleEdit = () => {
    // Navigate to edit screen or show edit dialog
    console.log('Edit project:', projectDetails);
  };

  const handleDelete = () => {
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    // In a real app, this would call an API to delete the project
    console.log('Deleting project:', projectDetails);
    setDeleteDialogVisible(false);
    router.back();
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
    <ScrollView style={styles.container}>
      {/* Project Overview Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text variant="headlineSmall">{projectDetails.name}</Text>
              <Text variant="bodyLarge">{projectDetails.type} Solar Project</Text>
              <Text variant="bodyMedium" style={{ color: getStatusColor(projectDetails.status) }}>
                {projectDetails.status}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text variant="titleLarge">{projectDetails.capacity} kW</Text>
              <Text variant="bodyLarge">{formatCurrency(projectDetails.cost)}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.progressSection}>
            <Text variant="bodyLarge">Overall Progress</Text>
            <View style={styles.progressRow}>
              <ProgressBar
                progress={projectDetails.progress / 100}
                color={getStatusColor(projectDetails.status)}
                style={styles.progressBar}
              />
              <Text variant="bodyMedium">{projectDetails.progress}%</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleEdit}
              style={styles.actionButton}
            >
              Edit Project
            </Button>
            <Button
              mode="contained"
              onPress={handleDelete}
              style={[styles.actionButton, styles.deleteButton]}
            >
              Delete Project
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {/* Customer Details Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Customer Details</Text>
          <List.Item
            title={projectDetails.customer}
            description={projectDetails.customerDetails.email}
            left={props => <List.Icon {...props} icon="account" />}
          />
          <List.Item
            title="Phone"
            description={projectDetails.customerDetails.phone}
            left={props => <List.Icon {...props} icon="phone" />}
          />
          <List.Item
            title="Address"
            description={projectDetails.customerDetails.address}
            left={props => <List.Icon {...props} icon="map-marker" />}
          />
        </Card.Content>
      </Card>
      
      {/* Project Timeline Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Project Timeline</Text>
          {projectDetails.timeline.map((item, index) => (
            <List.Item
              key={item.id}
              title={item.stage}
              description={item.date}
              left={props => (
                <View style={styles.timelineIcon}>
                  <List.Icon {...props} icon={item.status === 'completed' ? 'check-circle' : 'clock'} />
                  {index < projectDetails.timeline.length - 1 && (
                    <View style={styles.timelineConnector} />
                  )}
                </View>
              )}
            />
          ))}
        </Card.Content>
      </Card>
      
      {/* Performance Metrics Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text variant="titleLarge">{projectDetails.performance.totalGeneration}</Text>
              <Text variant="bodyMedium">Total Generation (kWh)</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="titleLarge">{projectDetails.performance.dailyAverage}</Text>
              <Text variant="bodyMedium">Daily Average (kWh)</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="titleLarge">{projectDetails.performance.efficiency}%</Text>
              <Text variant="bodyMedium">System Efficiency</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="titleLarge">{formatCurrency(projectDetails.performance.savings)}</Text>
              <Text variant="bodyMedium">Total Savings</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Documents Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Documents</Text>
          {projectDetails.documents.map((doc) => (
            <List.Item
              key={doc.id}
              title={doc.name}
              description={doc.date}
              left={props => <List.Icon {...props} icon={doc.type === 'pdf' ? 'file-pdf-box' : 'image'} />}
              right={props => <Button>View</Button>}
            />
          ))}
        </Card.Content>
      </Card>
      
      {/* Payments Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Payments</Text>
          {projectDetails.payments.map((payment) => (
            <List.Item
              key={payment.id}
              title={formatCurrency(payment.amount)}
              description={`${payment.type} • ${payment.date}`}
              left={props => <List.Icon {...props} icon="cash" />}
              right={() => (
                <Text style={{ color: payment.status === 'completed' ? '#4CAF50' : '#FF9800' }}>
                  {payment.status}
                </Text>
              )}
            />
          ))}
        </Card.Content>
      </Card>
      
      {/* Notes Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Notes</Text>
          {projectDetails.notes.map((note) => (
            <List.Item
              key={note.id}
              title={note.text}
              description={`${note.author} • ${note.date}`}
              left={props => <List.Icon {...props} icon="note-text" />}
            />
          ))}
        </Card.Content>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Project</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this project? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  divider: {
    marginVertical: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  timelineIcon: {
    alignItems: 'center',
  },
  timelineConnector: {
    position: 'absolute',
    top: 28,
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
}); 