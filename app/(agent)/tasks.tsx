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
  List,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data - replace with actual API calls
const TASKS = [
  {
    id: '1',
    title: 'Site Survey - Residential Project',
    description: 'Conduct initial site survey for new residential installation',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-03-25T10:00:00',
    assignedTo: 'Agent Name',
    customer: {
      id: 'c1',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
    },
    location: '123 Solar Street, Mumbai',
    type: 'site_survey',
    notes: [
      {
        id: 'n1',
        text: 'Customer prefers morning appointments',
        timestamp: '2024-03-18T09:30:00',
      },
    ],
  },
  {
    id: '2',
    title: 'Installation Follow-up',
    description: 'Follow up on installation progress and collect feedback',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-03-20T15:00:00',
    assignedTo: 'Agent Name',
    customer: {
      id: 'c2',
      name: 'Priya Patel',
      phone: '+91 98765 43211',
    },
    location: '456 Green Avenue, Delhi',
    type: 'follow_up',
    notes: [],
  },
  // Add more mock tasks as needed
];

const FILTERS = {
  status: ['all', 'pending', 'in_progress', 'completed'],
  priority: ['all', 'high', 'medium', 'low'],
  type: ['all', 'site_survey', 'follow_up', 'maintenance', 'support'],
};

export default function TasksPage() {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTask, setSelectedTask] = useState<typeof TASKS[0] | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 80, // Space for FAB
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
    taskCard: {
      marginBottom: 12,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    taskInfo: {
      flex: 1,
      marginRight: 8,
    },
    taskMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      flexWrap: 'wrap',
    },
    metaText: {
      marginLeft: 4,
      color: theme.colors.onSurfaceVariant,
    },
    metaSeparator: {
      marginHorizontal: 8,
      color: theme.colors.outlineVariant,
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
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
    },
    notesList: {
      marginTop: 16,
    },
    noteItem: {
      marginBottom: 8,
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    noteTimestamp: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'pending':
        return '#FF9800';
      default:
        return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return theme.colors.outline;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'site_survey':
        return 'clipboard-check';
      case 'follow_up':
        return 'phone';
      case 'maintenance':
        return 'wrench';
      case 'support':
        return 'headset';
      default:
        return 'clipboard-list';
    }
  };

  const filteredTasks = TASKS.filter((task) => {
    const matchesSearch = searchQuery
      ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      selectedStatus === 'all' || task.status === selectedStatus;

    const matchesPriority =
      selectedPriority === 'all' || task.priority === selectedPriority;

    const matchesType =
      selectedType === 'all' || task.type === selectedType;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const renderTaskCard = (task: typeof TASKS[0]) => (
    <Surface key={task.id} style={styles.taskCard} elevation={1}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text variant="titleMedium">{task.title}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {task.description}
            </Text>
            <View style={styles.taskMeta}>
              <MaterialCommunityIcons
                name="account"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={styles.metaText}>
                {task.customer.name}
              </Text>
              <Text style={styles.metaSeparator}>•</Text>
              <MaterialCommunityIcons
                name="phone"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={styles.metaText}>
                {task.customer.phone}
              </Text>
            </View>
          </View>
          <Menu
            visible={menuVisible === task.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(task.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                setSelectedTask(task);
                setDetailsModalVisible(true);
              }}
              title="View Details"
              leadingIcon="information"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                // Handle mark as complete
              }}
              title="Mark as Complete"
              leadingIcon="check-circle"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                // Handle edit
              }}
              title="Edit Task"
              leadingIcon="pencil"
            />
          </Menu>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
          <Chip
            mode="flat"
            textStyle={{ color: getStatusColor(task.status) }}
            style={{ backgroundColor: `${getStatusColor(task.status)}20` }}
          >
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Chip>
          <Chip
            mode="flat"
            textStyle={{ color: getPriorityColor(task.priority) }}
            style={{ backgroundColor: `${getPriorityColor(task.priority)}20` }}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Chip>
          <Chip
            mode="flat"
            icon={() => (
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={theme.colors.primary}
              />
            )}
          >
            {new Date(task.dueDate).toLocaleDateString()}
          </Chip>
        </View>
      </Card.Content>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Tasks</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Manage your tasks and follow-ups
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search tasks..."
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
              Priority
            </Text>
            <SegmentedButtons
              value={selectedPriority}
              onValueChange={setSelectedPriority}
              buttons={FILTERS.priority.map((priority) => ({
                value: priority,
                label: priority.charAt(0).toUpperCase() + priority.slice(1),
              }))}
            />
          </View>

          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Type
            </Text>
            <SegmentedButtons
              value={selectedType}
              onValueChange={setSelectedType}
              buttons={FILTERS.type.map((type) => ({
                value: type,
                label: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              }))}
            />
          </View>
        </View>

        {filteredTasks.map(renderTaskCard)}
      </ScrollView>

      <Portal>
        <Modal
          visible={detailsModalVisible}
          onDismiss={() => setDetailsModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedTask && (
            <>
              <Text variant="headlineSmall">Task Details</Text>
              <ScrollView style={styles.modalScroll}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title</Text>
                  <Text>{selectedTask.title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text>{selectedTask.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Chip
                    mode="flat"
                    textStyle={{ color: getStatusColor(selectedTask.status) }}
                    style={{ backgroundColor: `${getStatusColor(selectedTask.status)}20` }}
                  >
                    {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                  </Chip>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority</Text>
                  <Chip
                    mode="flat"
                    textStyle={{ color: getPriorityColor(selectedTask.priority) }}
                    style={{ backgroundColor: `${getPriorityColor(selectedTask.priority)}20` }}
                  >
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                  </Chip>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <Text>{new Date(selectedTask.dueDate).toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text>{selectedTask.customer.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text>{selectedTask.customer.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text>{selectedTask.location}</Text>
                </View>

                <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 8 }}>
                  Notes
                </Text>
                {selectedTask.notes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Text variant="bodyMedium">{note.text}</Text>
                    <Text style={styles.noteTimestamp}>
                      {new Date(note.timestamp).toLocaleString()}
                    </Text>
                  </View>
                ))}
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
                    // Handle mark as complete
                  }}
                >
                  Mark as Complete
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Handle create new task
          router.push('/tasks/new');
        }}
      />
    </View>
  );
} 