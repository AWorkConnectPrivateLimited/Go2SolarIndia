import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, Card, Chip, IconButton, Menu, Portal, Dialog, useTheme, SegmentedButtons, HelperText, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { format } from 'date-fns';

// Mock data for customers and agents
const mockCustomers = [
  { id: '101', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 9876543210' },
  { id: '102', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 9876543211' },
  { id: '103', name: 'Amit Kumar', email: 'amit.kumar@example.com', phone: '+91 9876543212' },
  { id: '104', name: 'Neha Gupta', email: 'neha.gupta@example.com', phone: '+91 9876543213' },
];

const mockAgents = [
  { id: '201', name: 'John Smith', role: 'Installation Technician' },
  { id: '202', name: 'Sarah Johnson', role: 'Customer Support' },
  { id: '203', name: 'Michael Brown', role: 'Maintenance Engineer' },
  { id: '204', name: 'Emily Davis', role: 'Technical Support' },
];

const mockProjects = [
  { id: '301', name: 'Residential Solar Installation - Mumbai', type: 'Physical Solar' },
  { id: '302', name: 'Commercial Solar Setup - Delhi', type: 'Physical Solar' },
  { id: '303', name: 'Digital Solar Investment - Bangalore', type: 'Digital Solar' },
  { id: '304', name: 'Community Solar Project - Hyderabad', type: 'Community Solar' },
];

export default function NewTicketScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [agentMenuVisible, setAgentMenuVisible] = useState(false);
  const [projectMenuVisible, setProjectMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
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

  const categories = [
    'Technical Issue',
    'Billing',
    'Installation',
    'Maintenance',
    'General Inquiry',
    'Complaint',
  ];

  const priorities = [
    'Low',
    'Medium',
    'High',
    'Critical',
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical issue':
        return theme.colors.primary;
      case 'billing':
        return theme.colors.secondary;
      case 'installation':
        return theme.colors.tertiary;
      case 'maintenance':
        return '#FF9800';
      case 'general inquiry':
        return '#4CAF50';
      case 'complaint':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return theme.colors.primary;
      case 'medium':
        return '#FF9800';
      case 'high':
        return theme.colors.error;
      case 'critical':
        return '#D32F2F';
      default:
        return theme.colors.outline;
    }
  };

  const getBackgroundColor = (color: string) => {
    // Convert hex to rgba with 20% opacity
    if (color.startsWith('#')) {
      return color + '33'; // 33 is hex for 20% opacity
    }
    return color;
  };

  const openCustomerMenu = () => {
    setCustomerMenuVisible(true);
  };

  const closeCustomerMenu = () => {
    setCustomerMenuVisible(false);
  };

  const openAgentMenu = () => {
    setAgentMenuVisible(true);
  };

  const closeAgentMenu = () => {
    setAgentMenuVisible(false);
  };

  const openProjectMenu = () => {
    setProjectMenuVisible(true);
  };

  const closeProjectMenu = () => {
    setProjectMenuVisible(false);
  };

  const openCategoryMenu = () => {
    setCategoryMenuVisible(true);
  };

  const closeCategoryMenu = () => {
    setCategoryMenuVisible(false);
  };

  const openPriorityMenu = () => {
    setPriorityMenuVisible(true);
  };

  const closePriorityMenu = () => {
    setPriorityMenuVisible(false);
  };

  const handleCustomerSelect = (customer: any) => {
    setCustomerId(customer.id);
    setCustomerSearchQuery(customer.name);
    closeCustomerMenu();
  };

  const handleAgentSelect = (agent: any) => {
    setAgentId(agent.id);
    setAgentSearchQuery(agent.name);
    closeAgentMenu();
  };

  const handleProjectSelect = (project: any) => {
    setProjectId(project.id);
    setProjectSearchQuery(project.name);
    closeProjectMenu();
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    closeCategoryMenu();
  };

  const handlePrioritySelect = (selectedPriority: string) => {
    setPriority(selectedPriority);
    closePriorityMenu();
  };

  const handleAddAttachment = () => {
    // In a real app, this would open a file picker
    // For now, we'll just add a mock attachment
    const newAttachment = {
      id: Date.now().toString(),
      name: `attachment_${attachments.length + 1}.pdf`,
      type: 'application/pdf',
      size: '245 KB',
    };
    setAttachments([...attachments, newAttachment]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  const handleSubmit = () => {
    // Validate form
    if (!title || !description || !category || !priority || !customerId) {
      setDialogVisible(true);
      return;
    }

    // In a real app, this would send the data to an API
    console.log('Submitting ticket:', {
      title,
      description,
      category,
      priority,
      customerId,
      agentId,
      projectId,
      attachments,
    });

    // Navigate back to tickets list
    router.back();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
    headerTitle: {
      flex: 1,
    },
    card: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    formGroup: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    label: {
      marginBottom: 8,
      color: theme.colors.onSurfaceVariant,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
    },
    searchButton: {
      marginLeft: 8,
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
    attachmentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    attachmentIcon: {
      marginRight: 8,
    },
    attachmentInfo: {
      flex: 1,
    },
    attachmentActions: {
      flexDirection: 'row',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: getResponsiveSize(16, 20, 24),
    },
    cancelButton: {
      marginRight: 8,
    },
    avatar: {
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text variant="headlineMedium">Create New Ticket</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Fill in the details to create a new support ticket
          </Text>
        </View>
        <IconButton
          icon="close"
          size={24}
          onPress={() => router.back()}
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              mode="outlined"
              placeholder="Enter ticket title"
              value={title}
              onChangeText={setTitle}
            />
            <HelperText type="info">A brief summary of the issue</HelperText>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              mode="outlined"
              placeholder="Describe the issue in detail"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
            <HelperText type="info">Provide as much detail as possible</HelperText>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.searchContainer}>
              <TextInput
                mode="outlined"
                placeholder="Select category"
                value={category}
                onChangeText={setCategory}
                style={styles.searchInput}
                right={<TextInput.Icon icon="chevron-down" onPress={openCategoryMenu} />}
                editable={false}
              />
              <IconButton
                icon="menu-down"
                size={24}
                onPress={openCategoryMenu}
                style={styles.searchButton}
              />
            </View>
            {category && (
              <View style={styles.chipContainer}>
                <Chip
                  textStyle={{ color: getCategoryColor(category) }}
                  style={[styles.chip, { backgroundColor: getBackgroundColor(getCategoryColor(category)) }]}
                  onClose={() => setCategory('')}
                >
                  {category}
                </Chip>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.searchContainer}>
              <TextInput
                mode="outlined"
                placeholder="Select priority"
                value={priority}
                onChangeText={setPriority}
                style={styles.searchInput}
                right={<TextInput.Icon icon="chevron-down" onPress={openPriorityMenu} />}
                editable={false}
              />
              <IconButton
                icon="menu-down"
                size={24}
                onPress={openPriorityMenu}
                style={styles.searchButton}
              />
            </View>
            {priority && (
              <View style={styles.chipContainer}>
                <Chip
                  textStyle={{ color: getPriorityColor(priority) }}
                  style={[styles.chip, { backgroundColor: getBackgroundColor(getPriorityColor(priority)) }]}
                  onClose={() => setPriority('')}
                >
                  {priority} Priority
                </Chip>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer</Text>
            <View style={styles.searchContainer}>
              <TextInput
                mode="outlined"
                placeholder="Search customer"
                value={customerSearchQuery}
                onChangeText={setCustomerSearchQuery}
                style={styles.searchInput}
                right={<TextInput.Icon icon="account-search" onPress={openCustomerMenu} />}
              />
              <IconButton
                icon="account-search"
                size={24}
                onPress={openCustomerMenu}
                style={styles.searchButton}
              />
            </View>
            {customerId && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Avatar.Text 
                  size={32} 
                  label={getInitials(mockCustomers.find(c => c.id === customerId)?.name || '')} 
                  style={styles.avatar}
                />
                <View style={{ marginLeft: 8 }}>
                  <Text variant="bodyMedium">{mockCustomers.find(c => c.id === customerId)?.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {mockCustomers.find(c => c.id === customerId)?.email}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setCustomerId('');
                    setCustomerSearchQuery('');
                  }}
                  style={{ marginLeft: 'auto' }}
                />
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Assign To (Optional)</Text>
            <View style={styles.searchContainer}>
              <TextInput
                mode="outlined"
                placeholder="Search agent"
                value={agentSearchQuery}
                onChangeText={setAgentSearchQuery}
                style={styles.searchInput}
                right={<TextInput.Icon icon="account-search" onPress={openAgentMenu} />}
              />
              <IconButton
                icon="account-search"
                size={24}
                onPress={openAgentMenu}
                style={styles.searchButton}
              />
            </View>
            {agentId && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Avatar.Text 
                  size={32} 
                  label={getInitials(mockAgents.find(a => a.id === agentId)?.name || '')} 
                  style={styles.avatar}
                />
                <View style={{ marginLeft: 8 }}>
                  <Text variant="bodyMedium">{mockAgents.find(a => a.id === agentId)?.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {mockAgents.find(a => a.id === agentId)?.role}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setAgentId('');
                    setAgentSearchQuery('');
                  }}
                  style={{ marginLeft: 'auto' }}
                />
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Related Project (Optional)</Text>
            <View style={styles.searchContainer}>
              <TextInput
                mode="outlined"
                placeholder="Search project"
                value={projectSearchQuery}
                onChangeText={setProjectSearchQuery}
                style={styles.searchInput}
                right={<TextInput.Icon icon="folder-search" onPress={openProjectMenu} />}
              />
              <IconButton
                icon="folder-search"
                size={24}
                onPress={openProjectMenu}
                style={styles.searchButton}
              />
            </View>
            {projectId && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <IconButton
                  icon="folder"
                  size={24}
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{mockProjects.find(p => p.id === projectId)?.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {mockProjects.find(p => p.id === projectId)?.type}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setProjectId('');
                    setProjectSearchQuery('');
                  }}
                />
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Attachments (Optional)</Text>
            {attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachmentContainer}>
                <IconButton
                  icon="file"
                  size={20}
                  style={styles.attachmentIcon}
                />
                <View style={styles.attachmentInfo}>
                  <Text variant="bodyMedium">{attachment.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {attachment.type} • {attachment.size}
                  </Text>
                </View>
                <View style={styles.attachmentActions}>
                  <IconButton
                    icon="download"
                    size={20}
                  />
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => handleRemoveAttachment(attachment.id)}
                  />
                </View>
              </View>
            ))}
            <Button
              mode="outlined"
              icon="attachment"
              onPress={handleAddAttachment}
              style={{ marginTop: 8 }}
            >
              Add Attachment
            </Button>
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
        </Card.Content>
      </Card>

      <Portal>
        <Menu
          visible={customerMenuVisible}
          onDismiss={closeCustomerMenu}
          anchor={{ x: 0, y: 0 }}
        >
          {mockCustomers.map((customer) => (
            <Menu.Item
              key={customer.id}
              onPress={() => handleCustomerSelect(customer)}
              title={customer.name}
              description={customer.email}
            />
          ))}
        </Menu>

        <Menu
          visible={agentMenuVisible}
          onDismiss={closeAgentMenu}
          anchor={{ x: 0, y: 0 }}
        >
          {mockAgents.map((agent) => (
            <Menu.Item
              key={agent.id}
              onPress={() => handleAgentSelect(agent)}
              title={agent.name}
              description={agent.role}
            />
          ))}
        </Menu>

        <Menu
          visible={projectMenuVisible}
          onDismiss={closeProjectMenu}
          anchor={{ x: 0, y: 0 }}
        >
          {mockProjects.map((project) => (
            <Menu.Item
              key={project.id}
              onPress={() => handleProjectSelect(project)}
              title={project.name}
              description={project.type}
            />
          ))}
        </Menu>

        <Menu
          visible={categoryMenuVisible}
          onDismiss={closeCategoryMenu}
          anchor={{ x: 0, y: 0 }}
        >
          {categories.map((cat) => (
            <Menu.Item
              key={cat}
              onPress={() => handleCategorySelect(cat)}
              title={cat}
            />
          ))}
        </Menu>

        <Menu
          visible={priorityMenuVisible}
          onDismiss={closePriorityMenu}
          anchor={{ x: 0, y: 0 }}
        >
          {priorities.map((p) => (
            <Menu.Item
              key={p}
              onPress={() => handlePrioritySelect(p)}
              title={p}
            />
          ))}
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Missing Information</Dialog.Title>
          <Dialog.Content>
            <Text>
              Please fill in all required fields (Title, Description, Category, Priority, and Customer) before creating the ticket.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
} 