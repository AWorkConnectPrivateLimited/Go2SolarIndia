import { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, useTheme, Card, HelperText, Menu, Portal, Dialog, Paragraph, IconButton, Chip, Avatar } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for demonstration
const mockCustomers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+91 9876543212' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+91 9876543213' },
];

const mockProjects = [
  { id: '1', name: 'Solar Installation - Home', customerId: '1', status: 'active' },
  { id: '2', name: 'Solar Installation - Office', customerId: '1', status: 'active' },
  { id: '3', name: 'Community Solar Project', customerId: '2', status: 'active' },
  { id: '4', name: 'Digital Solar Subscription', customerId: '3', status: 'active' },
];

const mockAgents = [
  { id: '1', name: 'Mike Johnson', email: 'mike@example.com', status: 'available' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@example.com', status: 'busy' },
  { id: '3', name: 'David Miller', email: 'david@example.com', status: 'available' },
  { id: '4', name: 'Emily Brown', email: 'emily@example.com', status: 'offline' },
];

export default function NewTicketScreen() {
  const [customerSearch, setCustomerSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('technical');
  const [priority, setPriority] = useState('medium');
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [projectMenuVisible, setProjectMenuVisible] = useState(false);
  const [agentMenuVisible, setAgentMenuVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.tertiary;
      case 'low':
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return theme.colors.primary;
      case 'billing':
        return theme.colors.secondary;
      case 'installation':
        return theme.colors.tertiary;
      case 'account':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  const filteredProjects = selectedCustomer 
    ? mockProjects.filter(project => 
        project.customerId === selectedCustomer.id &&
        (project.name.toLowerCase().includes(projectSearch.toLowerCase()))
      )
    : [];

  const filteredAgents = mockAgents.filter(agent => 
    agent.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
    agent.email.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const openCustomerMenu = () => setCustomerMenuVisible(true);
  const closeCustomerMenu = () => setCustomerMenuVisible(false);
  const openProjectMenu = () => setProjectMenuVisible(true);
  const closeProjectMenu = () => setProjectMenuVisible(false);
  const openAgentMenu = () => setAgentMenuVisible(true);
  const closeAgentMenu = () => setAgentMenuVisible(false);

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedProject(null);
    closeCustomerMenu();
  };

  const selectProject = (project: any) => {
    setSelectedProject(project);
    closeProjectMenu();
  };

  const selectAgent = (agent: any) => {
    setSelectedAgent(agent);
    closeAgentMenu();
  };

  const handleSubmit = () => {
    // Validate form
    if (!selectedCustomer) {
      // Show error
      return;
    }
    if (!subject.trim()) {
      // Show error
      return;
    }
    if (!description.trim()) {
      // Show error
      return;
    }

    // Show confirmation dialog
    setConfirmDialogVisible(true);
  };

  const confirmSubmit = () => {
    // Here you would submit the ticket to your backend
    // For now, we'll just navigate back
    setConfirmDialogVisible(false);
    router.back();
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
    formContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    formGroup: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    label: {
      fontSize: getFontSize(14),
      marginBottom: getResponsiveSize(4, 6, 8),
      color: theme.colors.onSurface,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: getResponsiveSize(8, 12, 16),
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    selectorText: {
      flex: 1,
      fontSize: getFontSize(14),
    },
    selectorPlaceholder: {
      color: theme.colors.onSurfaceDisabled,
    },
    selectorIcon: {
      marginLeft: getResponsiveSize(8, 12, 16),
    },
    selectedItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedItemAvatar: {
      marginRight: getResponsiveSize(8, 12, 16),
    },
    selectedItemInfo: {
      flex: 1,
    },
    selectedItemName: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
    },
    selectedItemDetail: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    categoryContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    categoryLabel: {
      fontSize: getFontSize(14),
      marginBottom: getResponsiveSize(8, 12, 16),
      color: theme.colors.onSurface,
    },
    categoryButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -getResponsiveSize(4, 6, 8),
    },
    categoryChip: {
      margin: getResponsiveSize(4, 6, 8),
    },
    priorityContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    priorityLabel: {
      fontSize: getFontSize(14),
      marginBottom: getResponsiveSize(8, 12, 16),
      color: theme.colors.onSurface,
    },
    priorityButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -getResponsiveSize(4, 6, 8),
    },
    priorityChip: {
      margin: getResponsiveSize(4, 6, 8),
    },
    descriptionInput: {
      height: getResponsiveSize(120, 150, 180),
      textAlignVertical: 'top',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: getResponsiveSize(16, 20, 24),
    },
    cancelButton: {
      marginRight: getResponsiveSize(8, 12, 16),
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getResponsiveSize(8, 12, 16),
    },
    menuItemAvatar: {
      marginRight: getResponsiveSize(8, 12, 16),
    },
    menuItemInfo: {
      flex: 1,
    },
    menuItemName: {
      fontSize: getFontSize(14),
    },
    menuItemDetail: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    menuItemStatus: {
      width: getResponsiveSize(8, 10, 12),
      height: getResponsiveSize(8, 10, 12),
      borderRadius: getResponsiveSize(4, 5, 6),
      marginLeft: getResponsiveSize(8, 12, 16),
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveSize(16, 20, 24),
    },
    emptyStateText: {
      fontSize: getFontSize(14),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>New Support Ticket</Text>
          <Button 
            mode="outlined" 
            onPress={() => router.back()}
            icon="arrow-left"
          >
            Back
          </Button>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer</Text>
            <View style={styles.selector} onTouchEnd={openCustomerMenu}>
              {selectedCustomer ? (
                <View style={styles.selectedItem}>
                  <Avatar.Text 
                    size={32} 
                    label={selectedCustomer.name.split(' ').map((n: string) => n[0]).join('')} 
                    style={styles.selectedItemAvatar}
                  />
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemName}>{selectedCustomer.name}</Text>
                    <Text style={styles.selectedItemDetail}>{selectedCustomer.email}</Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.selectorText, styles.selectorPlaceholder]}>
                  Select a customer
                </Text>
              )}
              <IconButton icon="chevron-down" size={20} style={styles.selectorIcon} />
            </View>
            <Portal>
              <Menu
                visible={customerMenuVisible}
                onDismiss={closeCustomerMenu}
                anchor={{ x: 0, y: 0 }}
              >
                <TextInput
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                  style={styles.input}
                />
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <Menu.Item
                      key={customer.id}
                      onPress={() => selectCustomer(customer)}
                      title={customer.name}
                      description={customer.email}
                      leadingIcon={() => (
                        <Avatar.Text 
                          size={24} 
                          label={customer.name.split(' ').map(n => n[0]).join('')} 
                        />
                      )}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No customers found</Text>
                  </View>
                )}
              </Menu>
            </Portal>
          </View>

          {selectedCustomer && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Project (Optional)</Text>
              <View style={styles.selector} onTouchEnd={openProjectMenu}>
                {selectedProject ? (
                  <View style={styles.selectedItem}>
                    <View style={styles.selectedItemInfo}>
                      <Text style={styles.selectedItemName}>{selectedProject.name}</Text>
                      <Text style={styles.selectedItemDetail}>Status: {selectedProject.status}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.selectorText, styles.selectorPlaceholder]}>
                    Select a project
                  </Text>
                )}
                <IconButton icon="chevron-down" size={20} style={styles.selectorIcon} />
              </View>
              <Portal>
                <Menu
                  visible={projectMenuVisible}
                  onDismiss={closeProjectMenu}
                  anchor={{ x: 0, y: 0 }}
                >
                  <TextInput
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChangeText={setProjectSearch}
                    style={styles.input}
                  />
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                      <Menu.Item
                        key={project.id}
                        onPress={() => selectProject(project)}
                        title={project.name}
                        description={`Status: ${project.status}`}
                      />
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No projects found</Text>
                    </View>
                  )}
                </Menu>
              </Portal>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              placeholder="Enter ticket subject"
              value={subject}
              onChangeText={setSubject}
              style={styles.input}
            />
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.categoryButtons}>
              <Chip
                selected={category === 'technical'}
                onPress={() => setCategory('technical')}
                style={styles.categoryChip}
                textStyle={{ color: category === 'technical' ? theme.colors.onPrimary : getCategoryColor('technical') }}
                selectedColor={getCategoryColor('technical')}
              >
                Technical
              </Chip>
              <Chip
                selected={category === 'billing'}
                onPress={() => setCategory('billing')}
                style={styles.categoryChip}
                textStyle={{ color: category === 'billing' ? theme.colors.onPrimary : getCategoryColor('billing') }}
                selectedColor={getCategoryColor('billing')}
              >
                Billing
              </Chip>
              <Chip
                selected={category === 'installation'}
                onPress={() => setCategory('installation')}
                style={styles.categoryChip}
                textStyle={{ color: category === 'installation' ? theme.colors.onPrimary : getCategoryColor('installation') }}
                selectedColor={getCategoryColor('installation')}
              >
                Installation
              </Chip>
              <Chip
                selected={category === 'account'}
                onPress={() => setCategory('account')}
                style={styles.categoryChip}
                textStyle={{ color: category === 'account' ? theme.colors.onPrimary : getCategoryColor('account') }}
                selectedColor={getCategoryColor('account')}
              >
                Account
              </Chip>
            </View>
          </View>

          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Priority</Text>
            <View style={styles.priorityButtons}>
              <Chip
                selected={priority === 'low'}
                onPress={() => setPriority('low')}
                style={styles.priorityChip}
                textStyle={{ color: priority === 'low' ? theme.colors.onPrimary : getPriorityColor('low') }}
                selectedColor={getPriorityColor('low')}
              >
                Low
              </Chip>
              <Chip
                selected={priority === 'medium'}
                onPress={() => setPriority('medium')}
                style={styles.priorityChip}
                textStyle={{ color: priority === 'medium' ? theme.colors.onPrimary : getPriorityColor('medium') }}
                selectedColor={getPriorityColor('medium')}
              >
                Medium
              </Chip>
              <Chip
                selected={priority === 'high'}
                onPress={() => setPriority('high')}
                style={styles.priorityChip}
                textStyle={{ color: priority === 'high' ? theme.colors.onPrimary : getPriorityColor('high') }}
                selectedColor={getPriorityColor('high')}
              >
                High
              </Chip>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Describe the issue in detail"
              value={description}
              onChangeText={setDescription}
              multiline
              style={[styles.input, styles.descriptionInput]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Assign To (Optional)</Text>
            <View style={styles.selector} onTouchEnd={openAgentMenu}>
              {selectedAgent ? (
                <View style={styles.selectedItem}>
                  <Avatar.Text 
                    size={32} 
                    label={selectedAgent.name.split(' ').map((n: string) => n[0]).join('')} 
                    style={styles.selectedItemAvatar}
                  />
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemName}>{selectedAgent.name}</Text>
                    <Text style={styles.selectedItemDetail}>{selectedAgent.email}</Text>
                  </View>
                  <View 
                    style={[
                      styles.menuItemStatus, 
                      { backgroundColor: getStatusColor(selectedAgent.status) }
                    ]} 
                  />
                </View>
              ) : (
                <Text style={[styles.selectorText, styles.selectorPlaceholder]}>
                  Select an agent
                </Text>
              )}
              <IconButton icon="chevron-down" size={20} style={styles.selectorIcon} />
            </View>
            <Portal>
              <Menu
                visible={agentMenuVisible}
                onDismiss={closeAgentMenu}
                anchor={{ x: 0, y: 0 }}
              >
                <TextInput
                  placeholder="Search agents..."
                  value={agentSearch}
                  onChangeText={setAgentSearch}
                  style={styles.input}
                />
                {filteredAgents.length > 0 ? (
                  filteredAgents.map(agent => (
                    <Menu.Item
                      key={agent.id}
                      onPress={() => selectAgent(agent)}
                      title={agent.name}
                      description={agent.email}
                      leadingIcon={() => (
                        <Avatar.Text 
                          size={24} 
                          label={agent.name.split(' ').map(n => n[0]).join('')} 
                        />
                      )}
                      trailingIcon={() => (
                        <View 
                          style={[
                            styles.menuItemStatus, 
                            { backgroundColor: getStatusColor(agent.status) }
                          ]} 
                        />
                      )}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No agents found</Text>
                  </View>
                )}
              </Menu>
            </Portal>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={() => router.back()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
            >
              Create Ticket
            </Button>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Confirm Ticket Creation</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to create this support ticket?
            </Paragraph>
            <Paragraph>
              <Text style={{ fontWeight: 'bold' }}>Customer:</Text> {selectedCustomer?.name}
            </Paragraph>
            {selectedProject && (
              <Paragraph>
                <Text style={{ fontWeight: 'bold' }}>Project:</Text> {selectedProject.name}
              </Paragraph>
            )}
            <Paragraph>
              <Text style={{ fontWeight: 'bold' }}>Subject:</Text> {subject}
            </Paragraph>
            <Paragraph>
              <Text style={{ fontWeight: 'bold' }}>Category:</Text> {category}
            </Paragraph>
            <Paragraph>
              <Text style={{ fontWeight: 'bold' }}>Priority:</Text> {priority}
            </Paragraph>
            {selectedAgent && (
              <Paragraph>
                <Text style={{ fontWeight: 'bold' }}>Assigned To:</Text> {selectedAgent.name}
              </Paragraph>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmSubmit}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
} 