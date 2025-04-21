import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme, TextInput, SegmentedButtons, Switch, Divider } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for chatbot conversations
const mockConversations = [
  {
    id: '1',
    user: 'Customer A',
    lastMessage: 'How do I check my solar panel efficiency?',
    status: 'Resolved',
    date: '2024-03-24 14:30',
    category: 'Technical Support',
  },
  {
    id: '2',
    user: 'Customer B',
    lastMessage: 'When will my installation be completed?',
    status: 'In Progress',
    date: '2024-03-24 15:45',
    category: 'Installation',
  },
  {
    id: '3',
    user: 'Customer C',
    lastMessage: 'What are the benefits of community solar?',
    status: 'Resolved',
    date: '2024-03-24 16:20',
    category: 'Product Information',
  },
  {
    id: '4',
    user: 'Customer D',
    lastMessage: 'I need help with my billing statement',
    status: 'Pending',
    date: '2024-03-24 17:10',
    category: 'Billing',
  },
];

// Mock data for FAQ categories
const mockFaqCategories = [
  { id: '1', name: 'General', count: 12 },
  { id: '2', name: 'Technical Support', count: 8 },
  { id: '3', name: 'Billing', count: 6 },
  { id: '4', name: 'Installation', count: 10 },
  { id: '5', name: 'Product Information', count: 15 },
];

export default function ChatbotScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState(mockConversations);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [createFaqDialogVisible, setCreateFaqDialogVisible] = useState(false);
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: 'General',
  });
  const [chatbotSettings, setChatbotSettings] = useState({
    isEnabled: true,
    autoRespond: true,
    humanHandoff: true,
    language: 'English',
    responseTime: '5',
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
    const filtered = mockConversations.filter(conversation =>
      conversation.user.toLowerCase().includes(query.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(query.toLowerCase()) ||
      conversation.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredConversations(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return theme.colors.primary;
      case 'in progress':
        return theme.colors.tertiary;
      case 'pending':
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

  const openMenu = (conversation: any) => {
    setSelectedConversation(conversation);
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

  const openCreateFaqDialog = () => {
    setCreateFaqDialogVisible(true);
  };

  const closeCreateFaqDialog = () => {
    setCreateFaqDialogVisible(false);
    // Reset form
    setNewFaq({
      question: '',
      answer: '',
      category: 'General',
    });
  };

  const openSettingsDialog = () => {
    setSettingsDialogVisible(true);
  };

  const closeSettingsDialog = () => {
    setSettingsDialogVisible(false);
  };

  const handleCreateFaq = () => {
    // In a real app, this would send the FAQ to a backend
    console.log('Creating FAQ:', newFaq);
    closeCreateFaqDialog();
  };

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to a backend
    console.log('Saving chatbot settings:', chatbotSettings);
    closeSettingsDialog();
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
    categoryChip: {
      marginRight: 8,
      marginBottom: 8,
    },
    settingsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    settingsLabel: {
      fontSize: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium">Chatbot Management</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Configure and monitor AI chatbot interactions
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Button 
            mode="outlined" 
            onPress={openSettingsDialog}
            icon="cog"
            style={styles.actionButton}
          >
            Settings
          </Button>
          <Button 
            mode="contained" 
            onPress={openCreateFaqDialog}
            icon="plus"
          >
            Add FAQ
          </Button>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />
      </View>

      <Card style={styles.card}>
        <Card.Title title="Recent Conversations" />
        <Card.Content>
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>User</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Last Message</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Category</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Date</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredConversations.map((conversation) => (
                <DataTable.Row key={conversation.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{conversation.user}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{conversation.lastMessage}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(conversation.status) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(conversation.status)) }]}
                    >
                      {conversation.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{conversation.category}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{conversation.date}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(conversation)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="FAQ Categories" />
        <Card.Content>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {mockFaqCategories.map((category) => (
              <Chip
                key={category.id}
                style={styles.categoryChip}
                onPress={() => console.log(`View category: ${category.name}`)}
              >
                {category.name} ({category.count})
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Conversation" />
          <Menu.Item onPress={() => handleAction('respond')} title="Respond" />
          <Menu.Item onPress={() => handleAction('assign')} title="Assign to Agent" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedConversation?.user || 'this conversation'}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={closeDialog}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={createFaqDialogVisible} onDismiss={closeCreateFaqDialog} style={{ width: '90%', maxWidth: 500 }}>
          <Dialog.Title>Add New FAQ</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Question"
              value={newFaq.question}
              onChangeText={(text) => setNewFaq({...newFaq, question: text})}
              style={styles.formField}
              mode="outlined"
            />
            
            <TextInput
              label="Answer"
              value={newFaq.answer}
              onChangeText={(text) => setNewFaq({...newFaq, answer: text})}
              style={styles.formField}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
            
            <Text style={{ marginBottom: 8 }}>Category</Text>
            <SegmentedButtons
              value={newFaq.category}
              onValueChange={(value) => setNewFaq({...newFaq, category: value})}
              buttons={[
                { value: 'General', label: 'General' },
                { value: 'Technical Support', label: 'Technical' },
                { value: 'Billing', label: 'Billing' },
                { value: 'Installation', label: 'Installation' },
                { value: 'Product Information', label: 'Product' },
              ]}
              style={styles.formField}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={closeCreateFaqDialog}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleCreateFaq}
              disabled={!newFaq.question || !newFaq.answer}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={settingsDialogVisible} onDismiss={closeSettingsDialog} style={{ width: '90%', maxWidth: 500 }}>
          <Dialog.Title>Chatbot Settings</Dialog.Title>
          <Dialog.Content>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Enable Chatbot</Text>
              <Switch
                value={chatbotSettings.isEnabled}
                onValueChange={(value) => setChatbotSettings({...chatbotSettings, isEnabled: value})}
              />
            </View>
            
            <Divider style={{ marginVertical: 16 }} />
            
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Auto-respond to common queries</Text>
              <Switch
                value={chatbotSettings.autoRespond}
                onValueChange={(value) => setChatbotSettings({...chatbotSettings, autoRespond: value})}
              />
            </View>
            
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Enable human handoff</Text>
              <Switch
                value={chatbotSettings.humanHandoff}
                onValueChange={(value) => setChatbotSettings({...chatbotSettings, humanHandoff: value})}
              />
            </View>
            
            <Divider style={{ marginVertical: 16 }} />
            
            <Text style={{ marginBottom: 8 }}>Language</Text>
            <SegmentedButtons
              value={chatbotSettings.language}
              onValueChange={(value) => setChatbotSettings({...chatbotSettings, language: value})}
              buttons={[
                { value: 'English', label: 'English' },
                { value: 'Hindi', label: 'Hindi' },
                { value: 'Gujarati', label: 'Gujarati' },
                { value: 'Marathi', label: 'Marathi' },
              ]}
              style={styles.formField}
            />
            
            <TextInput
              label="Response Time (seconds)"
              value={chatbotSettings.responseTime}
              onChangeText={(text) => setChatbotSettings({...chatbotSettings, responseTime: text})}
              style={styles.formField}
              mode="outlined"
              keyboardType="numeric"
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={closeSettingsDialog}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
} 