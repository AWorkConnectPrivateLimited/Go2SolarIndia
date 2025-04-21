import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Divider, IconButton, Menu, Portal, Dialog, Paragraph, ProgressBar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for demonstration
const mockIntegrations = [
  {
    id: 'erp',
    name: 'ERP System',
    status: 'active',
    health: 98,
    lastSync: '2023-06-15 14:30:00',
    syncFrequency: '15 minutes',
    type: 'internal',
    endpoints: 3,
    transactions: 15000,
    failedTransactions: 45,
  },
  {
    id: 'crm',
    name: 'CRM System',
    status: 'active',
    health: 95,
    lastSync: '2023-06-15 14:25:00',
    syncFrequency: '5 minutes',
    type: 'internal',
    endpoints: 3,
    transactions: 25000,
    failedTransactions: 120,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    status: 'active',
    health: 99,
    lastSync: '2023-06-15 14:35:00',
    syncFrequency: 'real-time',
    type: 'payment',
    endpoints: 2,
    transactions: 50000,
    failedTransactions: 25,
  },
  {
    id: 'bbps',
    name: 'Bharat Connect BBPS',
    status: 'warning',
    health: 85,
    lastSync: '2023-06-15 14:20:00',
    syncFrequency: '30 minutes',
    type: 'utility',
    endpoints: 1,
    transactions: 10000,
    failedTransactions: 150,
  },
];

export default function IntegrationsScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const openMenu = (integration: any) => {
    setSelectedIntegration(integration);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleAction = (action: string) => {
    setSelectedAction(action);
    closeMenu();
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setSelectedIntegration(null);
    setSelectedAction(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'warning':
        return theme.colors.error;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const renderIntegrationCard = (integration: any) => (
    <Card key={integration.id} style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text variant="titleLarge">{integration.name}</Text>
            <Text variant="bodyMedium" style={{ color: getStatusColor(integration.status) }}>
              Status: {integration.status}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={() => openMenu(integration)}
          />
        </View>

        <View style={styles.healthContainer}>
          <Text variant="titleMedium">Health</Text>
          <View style={styles.healthBarContainer}>
            <ProgressBar
              progress={integration.health / 100}
              color={theme.colors.primary}
              style={styles.healthBar}
            />
            <Text variant="bodyMedium">{integration.health}%</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="titleSmall">Last Sync</Text>
            <Text variant="bodyMedium">{integration.lastSync}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleSmall">Sync Frequency</Text>
            <Text variant="bodyMedium">{integration.syncFrequency}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleSmall">Endpoints</Text>
            <Text variant="bodyMedium">{integration.endpoints}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleSmall">Transactions</Text>
            <Text variant="bodyMedium">
              {integration.transactions.toLocaleString()}
              <Text style={{ color: theme.colors.error }}>
                {' '}({integration.failedTransactions} failed)
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => router.push(`/(admin)/integrations/${integration.id}`)}
            style={styles.actionButton}
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAction('test')}
            style={styles.actionButton}
          >
            Test Connection
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAction('sync')}
            style={styles.actionButton}
          >
            Sync Now
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Integrations</Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(admin)/integrations/new')}
          icon="plus"
        >
          Add Integration
        </Button>
      </View>

      <View style={styles.content}>
        {mockIntegrations.map(renderIntegrationCard)}
      </View>

      {/* Action Menu */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Configuration" />
          <Menu.Item onPress={() => handleAction('logs')} title="View Logs" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete Integration" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to {selectedAction} for {selectedIntegration?.name}?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={closeDialog}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthContainer: {
    marginBottom: 16,
  },
  healthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
}); 