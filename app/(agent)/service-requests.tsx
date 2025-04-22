import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, useTheme, SegmentedButtons, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ServiceRequests() {
  const theme = useTheme();
  const [filterStatus, setFilterStatus] = useState('all');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    segmentedButtons: {
      marginBottom: 16,
    },
    card: {
      marginBottom: 16,
    },
    requestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    requestTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    requestId: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    requestInfo: {
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      width: 100,
    },
    infoValue: {
      fontSize: 14,
      flex: 1,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
    },
    button: {
      marginLeft: 8,
    },
    statusChip: {
      marginLeft: 8,
    },
    statusOpen: {
      backgroundColor: theme.colors.error,
    },
    statusInProgress: {
      backgroundColor: theme.colors.primary,
    },
    statusResolved: {
      backgroundColor: theme.colors.tertiary,
    },
  });

  // Mock data for service requests
  const serviceRequests = [
    {
      id: 'SR-001',
      title: 'Inverter Not Working',
      customer: 'John Doe',
      date: '2023-04-20',
      priority: 'High',
      status: 'open',
      description: 'The inverter is not turning on after power outage.',
      location: '123 Main St, City',
    },
    {
      id: 'SR-002',
      title: 'Solar Panel Cleaning',
      customer: 'Jane Smith',
      date: '2023-04-19',
      priority: 'Medium',
      status: 'in_progress',
      description: 'Regular cleaning of solar panels required.',
      location: '456 Oak Ave, Town',
    },
    {
      id: 'SR-003',
      title: 'Battery Replacement',
      customer: 'Robert Johnson',
      date: '2023-04-18',
      priority: 'Low',
      status: 'resolved',
      description: 'Battery needs replacement after 5 years of use.',
      location: '789 Pine Rd, Village',
    },
  ];

  const filteredRequests = filterStatus === 'all' 
    ? serviceRequests 
    : serviceRequests.filter(request => request.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return styles.statusOpen;
      case 'in_progress':
        return styles.statusInProgress;
      case 'resolved':
        return styles.statusResolved;
      default:
        return {};
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Requests</Text>
        <Text style={styles.subtitle}>Manage customer service requests</Text>
      </View>

      <SegmentedButtons
        value={filterStatus}
        onValueChange={setFilterStatus}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
        ]}
        style={styles.segmentedButtons}
      />

      {filteredRequests.map((request) => (
        <Card key={request.id} style={styles.card}>
          <Card.Content>
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>{request.title}</Text>
              <Chip 
                style={[styles.statusChip, getStatusColor(request.status)]}
                textStyle={{ color: 'white' }}
              >
                {getStatusLabel(request.status)}
              </Chip>
            </View>
            <Text style={styles.requestId}>ID: {request.id}</Text>
            
            <View style={styles.requestInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer:</Text>
                <Text style={styles.infoValue}>{request.customer}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{request.date}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{request.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Description:</Text>
                <Text style={styles.infoValue}>{request.description}</Text>
              </View>
            </View>

            <View style={styles.chipContainer}>
              <Chip 
                icon="flag" 
                style={styles.chip}
                mode="outlined"
              >
                Priority: {request.priority}
              </Chip>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                icon="eye" 
                style={styles.button}
                onPress={() => {}}
              >
                View Details
              </Button>
              <Button 
                mode="contained" 
                icon="check" 
                style={styles.button}
                onPress={() => {}}
              >
                Update Status
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
} 