import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, List, Avatar, Divider, Portal, Dialog } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';

// Mock data for demonstration
const mockUsers = {
  '1': {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    role: 'customer',
    status: 'active',
    date: '2023-06-15',
    address: '123 Main St, Mumbai, Maharashtra',
    projects: [
      { id: '1', name: 'Home Solar System', status: 'active', date: '2023-06-15' },
      { id: '2', name: 'Digital Solar Investment', status: 'pending', date: '2023-06-10' },
    ],
    transactions: [
      { id: '1', type: 'payment', amount: 50000, date: '2023-06-15', status: 'completed' },
      { id: '2', type: 'refund', amount: 5000, date: '2023-06-10', status: 'completed' },
    ],
    activities: [
      { id: '1', action: 'Login', date: '2023-06-15 10:30 AM', location: 'Mumbai' },
      { id: '2', action: 'Updated Profile', date: '2023-06-14 03:45 PM', location: 'Mumbai' },
      { id: '3', action: 'Created Project', date: '2023-06-13 11:20 AM', location: 'Mumbai' },
    ],
  },
  // Add more mock users as needed
};

export default function UserDetailsScreen() {
  const { id } = useLocalSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  
  // Get user details from mock data
  const userDetails = mockUsers[id as keyof typeof mockUsers];
  
  if (!userDetails) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  const handleEdit = () => {
    // Navigate to edit screen or show edit dialog
    console.log('Edit user:', userDetails);
  };

  const handleDelete = () => {
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    // In a real app, this would call an API to delete the user
    console.log('Deleting user:', userDetails);
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

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text size={80} label={userDetails.name.split(' ').map(n => n[0]).join('')} />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall">{userDetails.name}</Text>
              <Text variant="bodyLarge">{userDetails.role}</Text>
              <Text variant="bodyMedium" style={
                userDetails.status === 'active' ? styles.activeText :
                userDetails.status === 'inactive' ? styles.inactiveText :
                styles.pendingText
              }>
                {userDetails.status}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <List.Section>
            <List.Item
              title="Email"
              description={userDetails.email}
              left={props => <List.Icon {...props} icon="email" />}
            />
            <List.Item
              title="Phone"
              description={userDetails.phone}
              left={props => <List.Icon {...props} icon="phone" />}
            />
            <List.Item
              title="Address"
              description={userDetails.address}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
            <List.Item
              title="Joined"
              description={userDetails.date}
              left={props => <List.Icon {...props} icon="calendar" />}
            />
          </List.Section>
          
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleEdit}
              style={styles.actionButton}
            >
              Edit User
            </Button>
            <Button
              mode="contained"
              onPress={handleDelete}
              style={[styles.actionButton, styles.deleteButton]}
            >
              Delete User
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {/* Projects Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Projects</Text>
          {userDetails.projects.map((project) => (
            <List.Item
              key={project.id}
              title={project.name}
              description={`Status: ${project.status} • Date: ${project.date}`}
              left={props => <List.Icon {...props} icon="solar-power" />}
              onPress={() => router.push(`/(admin)/projects/${project.id}`)}
            />
          ))}
        </Card.Content>
      </Card>
      
      {/* Transactions Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Transactions</Text>
          {userDetails.transactions.map((transaction) => (
            <List.Item
              key={transaction.id}
              title={formatCurrency(transaction.amount)}
              description={`${transaction.type} • ${transaction.date}`}
              left={props => (
                <List.Icon
                  {...props}
                  icon={transaction.type === 'payment' ? 'cash' : 'cash-refund'}
                />
              )}
            />
          ))}
        </Card.Content>
      </Card>
      
      {/* Activity Log Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Activity Log</Text>
          {userDetails.activities.map((activity) => (
            <List.Item
              key={activity.id}
              title={activity.action}
              description={`${activity.date} • ${activity.location}`}
              left={props => <List.Icon {...props} icon="history" />}
            />
          ))}
        </Card.Content>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete User</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this user? This action cannot be undone.
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  divider: {
    marginVertical: 16,
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
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#F44336',
  },
  pendingText: {
    color: '#FF9800',
  },
}); 