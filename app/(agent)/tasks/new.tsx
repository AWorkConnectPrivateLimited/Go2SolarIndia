import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  SegmentedButtons,
  Surface,
  IconButton,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import { router } from 'expo-router';

const TASK_TYPES = [
  { value: 'site_survey', label: 'Site Survey' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'support', label: 'Support' },
];

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function NewTaskPage() {
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('site_survey');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customerSearchModalVisible, setCustomerSearchModalVisible] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Mock customer search results - replace with actual API call
  const customerSearchResults = [
    { id: 'c1', name: 'Rahul Sharma', phone: '+91 98765 43210' },
    { id: 'c2', name: 'Priya Patel', phone: '+91 98765 43211' },
    // Add more mock customers
  ].filter(customer => 
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 16,
    },
    input: {
      marginBottom: 16,
      backgroundColor: 'transparent',
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    dateButtonText: {
      flex: 1,
      marginLeft: 8,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      margin: 20,
      borderRadius: 8,
      padding: 20,
      maxHeight: '80%',
    },
    searchInput: {
      marginBottom: 16,
    },
    customerItem: {
      marginBottom: 8,
      padding: 16,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    customerName: {
      fontSize: 16,
      marginBottom: 4,
    },
    customerPhone: {
      color: theme.colors.onSurfaceVariant,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 24,
    },
  });

  const handleCreateTask = () => {
    // Validate form
    if (!title || !description || !customerName || !customerPhone || !location) {
      // Show error
      return;
    }

    // Create task object
    const task = {
      title,
      description,
      type,
      priority,
      dueDate: dueDate.toISOString(),
      location,
      customer: {
        name: customerName,
        phone: customerPhone,
      },
      status: 'pending',
    };

    // TODO: Save task to database
    console.log('Creating task:', task);

    // Navigate back to tasks list
    router.back();
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium">New Task</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Create a new task or follow-up
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Task Details
          </Text>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Task Type
          </Text>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={TASK_TYPES}
            style={{ marginBottom: 16 }}
          />
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Priority
          </Text>
          <SegmentedButtons
            value={priority}
            onValueChange={setPriority}
            buttons={PRIORITIES}
            style={{ marginBottom: 16 }}
          />
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Due Date
          </Text>
          <Surface style={styles.dateButton} elevation={0}>
            <IconButton 
              icon="calendar" 
              size={20} 
              onPress={handleDatePress}
            />
            <Text style={styles.dateButtonText}>
              {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
            </Text>
          </Surface>
          {showDatePicker && (
            <Modal
              visible={showDatePicker}
              onDismiss={() => setShowDatePicker(false)}
              contentContainerStyle={[styles.modalContent, { padding: 20 }]}
            >
              <View>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>Select Date and Time</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      const newDate = new Date();
                      setDueDate(newDate);
                      setShowDatePicker(false);
                    }}
                  >
                    Set to Now
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setDueDate(tomorrow);
                      setShowDatePicker(false);
                    }}
                  >
                    Set to Tomorrow
                  </Button>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(false)}
                >
                  Close
                </Button>
              </View>
            </Modal>
          )}
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Customer Details
          </Text>
          <Surface
            style={[
              styles.customerItem,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            elevation={0}
          >
            {customerName ? (
              <>
                <Text style={styles.customerName}>{customerName}</Text>
                <Text style={styles.customerPhone}>{customerPhone}</Text>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setCustomerName('');
                    setCustomerPhone('');
                    setCustomerSearchModalVisible(true);
                  }}
                  style={{ marginTop: 8 }}
                >
                  Change Customer
                </Button>
              </>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setCustomerSearchModalVisible(true)}
              >
                Select Customer
              </Button>
            )}
          </Surface>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Location
          </Text>
          <TextInput
            label="Address"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            style={styles.input}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => router.back()}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleCreateTask}>
            Create Task
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={customerSearchModalVisible}
          onDismiss={() => setCustomerSearchModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            Select Customer
          </Text>
          <TextInput
            label="Search customers"
            value={customerSearchQuery}
            onChangeText={setCustomerSearchQuery}
            mode="outlined"
            style={styles.searchInput}
          />
          <ScrollView>
            {customerSearchResults.map((customer) => (
              <Surface
                key={customer.id}
                style={styles.customerItem}
                elevation={0}
              >
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setCustomerName(customer.name);
                    setCustomerPhone(customer.phone);
                    setCustomerSearchModalVisible(false);
                    setCustomerSearchQuery('');
                  }}
                  style={{ marginTop: 8 }}
                >
                  Select
                </Button>
              </Surface>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
} 