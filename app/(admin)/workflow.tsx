import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme, TextInput, SegmentedButtons, Switch, Divider, List } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for workflows
const mockWorkflows = [
  {
    id: '1',
    name: 'Customer Onboarding',
    description: 'Automated process for new customer registration and setup',
    status: 'Active',
    triggers: ['New Registration', 'KYC Verification'],
    actions: ['Welcome Email', 'Assign Agent', 'Schedule Consultation'],
    lastRun: '2024-03-24 10:15',
    nextRun: '2024-03-25 09:00',
  },
  {
    id: '2',
    name: 'Service Request Processing',
    description: 'Handles service requests and assigns to appropriate agents',
    status: 'Active',
    triggers: ['New Service Request', 'Urgent Issue Reported'],
    actions: ['Create Ticket', 'Assign Technician', 'Send Confirmation'],
    lastRun: '2024-03-24 14:30',
    nextRun: '2024-03-24 16:00',
  },
  {
    id: '3',
    name: 'Installation Follow-up',
    description: 'Follow-up process after solar installation',
    status: 'Active',
    triggers: ['Installation Completed', 'System Activated'],
    actions: ['Send Feedback Request', 'Schedule Training', 'Generate Report'],
    lastRun: '2024-03-23 17:45',
    nextRun: '2024-03-25 10:00',
  },
  {
    id: '4',
    name: 'Payment Reminder',
    description: 'Sends payment reminders for pending invoices',
    status: 'Inactive',
    triggers: ['Invoice Due', 'Payment Overdue'],
    actions: ['Send Reminder', 'Apply Late Fee', 'Escalate to Collections'],
    lastRun: '2024-03-22 09:00',
    nextRun: '2024-03-26 09:00',
  },
];

// Mock data for workflow templates
const mockTemplates = [
  { id: '1', name: 'Customer Onboarding', category: 'Customer Management' },
  { id: '2', name: 'Service Request', category: 'Support' },
  { id: '3', name: 'Installation Process', category: 'Operations' },
  { id: '4', name: 'Payment Collection', category: 'Finance' },
  { id: '5', name: 'Maintenance Schedule', category: 'Operations' },
];

export default function WorkflowScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWorkflows, setFilteredWorkflows] = useState(mockWorkflows);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [createWorkflowDialogVisible, setCreateWorkflowDialogVisible] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    status: 'Active',
    triggers: [],
    actions: [],
  });
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
    const filtered = mockWorkflows.filter(workflow =>
      workflow.name.toLowerCase().includes(query.toLowerCase()) ||
      workflow.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredWorkflows(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return theme.colors.primary;
      case 'inactive':
        return theme.colors.outline;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getBackgroundColor = (color: string) => {
    if (color.startsWith('#')) {
      return `${color}33`;
    }
    return theme.colors.surfaceVariant;
  };

  const openMenu = (workflow: any) => {
    setSelectedWorkflow(workflow);
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

  const openCreateWorkflowDialog = () => {
    setCreateWorkflowDialogVisible(true);
  };

  const closeCreateWorkflowDialog = () => {
    setCreateWorkflowDialogVisible(false);
    // Reset form
    setNewWorkflow({
      name: '',
      description: '',
      status: 'Active',
      triggers: [],
      actions: [],
    });
  };

  const handleCreateWorkflow = () => {
    // In a real app, this would create a new workflow in the backend
    console.log('Creating workflow:', newWorkflow);
    closeCreateWorkflowDialog();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(12, 16, 20),
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    header: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    searchContainer: {
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
      marginBottom: 8,
    },
    actionButton: {
      marginLeft: 8,
    },
    formField: {
      marginBottom: 16,
    },
    dialogActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    triggerContainer: {
      marginBottom: 16,
    },
    triggerTitle: {
      marginBottom: 8,
    },
    triggerChip: {
      marginRight: 8,
      marginBottom: 8,
    },
    actionContainer: {
      marginBottom: 16,
    },
    actionTitle: {
      marginBottom: 8,
    },
    actionChip: {
      marginRight: 8,
      marginBottom: 8,
    },
    templateCard: {
      marginBottom: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Workflow Automation</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Configure and manage automated business processes
          </Text>
        </View>
        <Button 
          mode="contained" 
          onPress={openCreateWorkflowDialog}
          icon="plus"
        >
          Create Workflow
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search workflows..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />
      </View>

      <Card style={styles.card}>
        <Card.Title title="Active Workflows" />
        <Card.Content>
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Name</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Last Run</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Next Run</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredWorkflows.map((workflow) => (
                <DataTable.Row key={workflow.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{workflow.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(workflow.status) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(workflow.status)) }]}
                    >
                      {workflow.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{workflow.lastRun}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{workflow.nextRun}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(workflow)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Workflow Templates" />
        <Card.Content>
          {mockTemplates.map((template) => (
            <List.Item
              key={template.id}
              title={template.name}
              description={template.category}
              left={props => <List.Icon {...props} icon="file-document-outline" />}
              right={props => (
                <Button 
                  mode="outlined" 
                  onPress={() => console.log(`Use template: ${template.name}`)}
                  compact
                >
                  Use
                </Button>
              )}
              style={styles.templateCard}
            />
          ))}
        </Card.Content>
      </Card>

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Workflow" />
          <Menu.Item onPress={() => handleAction('run')} title="Run Now" />
          <Menu.Item onPress={() => handleAction('toggle')} title="Toggle Status" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedWorkflow?.name || 'this workflow'}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={closeDialog}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={createWorkflowDialogVisible} onDismiss={closeCreateWorkflowDialog} style={{ width: '90%', maxWidth: 500 }}>
          <Dialog.Title>Create New Workflow</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Workflow Name"
              value={newWorkflow.name}
              onChangeText={(text) => setNewWorkflow({...newWorkflow, name: text})}
              style={styles.formField}
              mode="outlined"
            />
            
            <TextInput
              label="Description"
              value={newWorkflow.description}
              onChangeText={(text) => setNewWorkflow({...newWorkflow, description: text})}
              style={styles.formField}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <Text style={{ marginBottom: 8 }}>Status</Text>
            <SegmentedButtons
              value={newWorkflow.status}
              onValueChange={(value) => setNewWorkflow({...newWorkflow, status: value})}
              buttons={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              style={styles.formField}
            />
            
            <View style={styles.triggerContainer}>
              <Text style={styles.triggerTitle}>Triggers</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Chip
                  selected={newWorkflow.triggers.includes('New Registration')}
                  onPress={() => {
                    const triggers = newWorkflow.triggers.includes('New Registration')
                      ? newWorkflow.triggers.filter(t => t !== 'New Registration')
                      : [...newWorkflow.triggers, 'New Registration'];
                    setNewWorkflow({...newWorkflow, triggers});
                  }}
                  style={styles.triggerChip}
                >
                  New Registration
                </Chip>
                <Chip
                  selected={newWorkflow.triggers.includes('KYC Verification')}
                  onPress={() => {
                    const triggers = newWorkflow.triggers.includes('KYC Verification')
                      ? newWorkflow.triggers.filter(t => t !== 'KYC Verification')
                      : [...newWorkflow.triggers, 'KYC Verification'];
                    setNewWorkflow({...newWorkflow, triggers});
                  }}
                  style={styles.triggerChip}
                >
                  KYC Verification
                </Chip>
                <Chip
                  selected={newWorkflow.triggers.includes('New Service Request')}
                  onPress={() => {
                    const triggers = newWorkflow.triggers.includes('New Service Request')
                      ? newWorkflow.triggers.filter(t => t !== 'New Service Request')
                      : [...newWorkflow.triggers, 'New Service Request'];
                    setNewWorkflow({...newWorkflow, triggers});
                  }}
                  style={styles.triggerChip}
                >
                  New Service Request
                </Chip>
                <Chip
                  selected={newWorkflow.triggers.includes('Installation Completed')}
                  onPress={() => {
                    const triggers = newWorkflow.triggers.includes('Installation Completed')
                      ? newWorkflow.triggers.filter(t => t !== 'Installation Completed')
                      : [...newWorkflow.triggers, 'Installation Completed'];
                    setNewWorkflow({...newWorkflow, triggers});
                  }}
                  style={styles.triggerChip}
                >
                  Installation Completed
                </Chip>
              </View>
            </View>
            
            <View style={styles.actionContainer}>
              <Text style={styles.actionTitle}>Actions</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Chip
                  selected={newWorkflow.actions.includes('Welcome Email')}
                  onPress={() => {
                    const actions = newWorkflow.actions.includes('Welcome Email')
                      ? newWorkflow.actions.filter(a => a !== 'Welcome Email')
                      : [...newWorkflow.actions, 'Welcome Email'];
                    setNewWorkflow({...newWorkflow, actions});
                  }}
                  style={styles.actionChip}
                >
                  Welcome Email
                </Chip>
                <Chip
                  selected={newWorkflow.actions.includes('Assign Agent')}
                  onPress={() => {
                    const actions = newWorkflow.actions.includes('Assign Agent')
                      ? newWorkflow.actions.filter(a => a !== 'Assign Agent')
                      : [...newWorkflow.actions, 'Assign Agent'];
                    setNewWorkflow({...newWorkflow, actions});
                  }}
                  style={styles.actionChip}
                >
                  Assign Agent
                </Chip>
                <Chip
                  selected={newWorkflow.actions.includes('Create Ticket')}
                  onPress={() => {
                    const actions = newWorkflow.actions.includes('Create Ticket')
                      ? newWorkflow.actions.filter(a => a !== 'Create Ticket')
                      : [...newWorkflow.actions, 'Create Ticket'];
                    setNewWorkflow({...newWorkflow, actions});
                  }}
                  style={styles.actionChip}
                >
                  Create Ticket
                </Chip>
                <Chip
                  selected={newWorkflow.actions.includes('Send Confirmation')}
                  onPress={() => {
                    const actions = newWorkflow.actions.includes('Send Confirmation')
                      ? newWorkflow.actions.filter(a => a !== 'Send Confirmation')
                      : [...newWorkflow.actions, 'Send Confirmation'];
                    setNewWorkflow({...newWorkflow, actions});
                  }}
                  style={styles.actionChip}
                >
                  Send Confirmation
                </Chip>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={closeCreateWorkflowDialog}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleCreateWorkflow}
              disabled={!newWorkflow.name || newWorkflow.triggers.length === 0 || newWorkflow.actions.length === 0}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
} 