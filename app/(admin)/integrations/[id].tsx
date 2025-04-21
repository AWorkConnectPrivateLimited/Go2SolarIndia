import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Switch, 
  TextInput, 
  List, 
  Divider, 
  useTheme,
  Portal,
  Dialog,
  IconButton,
  Menu,
  Chip,
  ProgressBar,
  ActivityIndicator,
  Badge,
  SegmentedButtons,
  DataTable,
  ToggleButton,
  Snackbar,
  Paragraph
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';

// Mock integration data (same as in integrations.tsx)
const mockIntegrations = {
  razorpay: {
    name: 'Razorpay',
    description: 'Payment gateway integration for processing transactions',
    status: 'active',
    lastSync: '2024-03-15T10:30:00Z',
    health: 98,
    enabled: true,
    testMode: true,
    config: {
      apiKey: 'rzp_test_123456789',
      secretKey: 'secret_123456789',
      webhookUrl: 'https://api.go2solar.in/webhooks/razorpay',
    },
    stats: {
      totalTransactions: 1250,
      successRate: 99.2,
      averageResponseTime: 0.8,
    },
    logs: [
      { id: 1, timestamp: '2024-03-15T10:30:00Z', level: 'info', message: 'Payment processed successfully', details: { orderId: 'ORD123', amount: 15000 } },
      { id: 2, timestamp: '2024-03-15T10:25:00Z', level: 'warning', message: 'Webhook delivery failed', details: { webhookId: 'WH123', attempts: 2 } },
      { id: 3, timestamp: '2024-03-15T10:20:00Z', level: 'error', message: 'API key validation failed', details: { error: 'Invalid API key format' } },
      { id: 4, timestamp: '2024-03-15T10:15:00Z', level: 'info', message: 'Integration health check passed', details: { responseTime: 0.5 } },
    ],
    events: [
      { id: 1, timestamp: '2024-03-15T10:30:00Z', type: 'payment', status: 'success', details: { orderId: 'ORD123', amount: 15000 } },
      { id: 2, timestamp: '2024-03-15T10:25:00Z', type: 'refund', status: 'success', details: { orderId: 'ORD122', amount: 5000 } },
      { id: 3, timestamp: '2024-03-15T10:20:00Z', type: 'webhook', status: 'failed', details: { webhookId: 'WH123', attempts: 2 } },
      { id: 4, timestamp: '2024-03-15T10:15:00Z', type: 'health_check', status: 'success', details: { responseTime: 0.5 } },
    ],
    metrics: {
      daily: [
        { date: '2024-03-15', transactions: 125, success: 123, failed: 2, revenue: 150000 },
        { date: '2024-03-14', transactions: 98, success: 96, failed: 2, revenue: 120000 },
        { date: '2024-03-13', transactions: 110, success: 108, failed: 2, revenue: 135000 },
        { date: '2024-03-12', transactions: 105, success: 103, failed: 2, revenue: 130000 },
        { date: '2024-03-11', transactions: 115, success: 113, failed: 2, revenue: 140000 },
        { date: '2024-03-10', transactions: 90, success: 88, failed: 2, revenue: 110000 },
        { date: '2024-03-09', transactions: 95, success: 93, failed: 2, revenue: 115000 },
      ],
      hourly: [
        { hour: '10:00', transactions: 15, success: 15, failed: 0, revenue: 18000 },
        { hour: '09:00', transactions: 12, success: 12, failed: 0, revenue: 15000 },
        { hour: '08:00', transactions: 10, success: 10, failed: 0, revenue: 12000 },
        { hour: '07:00', transactions: 8, success: 8, failed: 0, revenue: 10000 },
        { hour: '06:00', transactions: 5, success: 5, failed: 0, revenue: 6000 },
        { hour: '05:00', transactions: 3, success: 3, failed: 0, revenue: 4000 },
        { hour: '04:00', transactions: 2, success: 2, failed: 0, revenue: 2500 },
      ],
    },
  },
  // ... other integrations
};

export default function IntegrationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('daily');
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [integration, setIntegration] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Calculate responsive sizes
  const isSmallScreen = windowWidth < 360;
  const isMediumScreen = windowWidth >= 360 && windowWidth < 768;
  const isLargeScreen = windowWidth >= 768;

  const getResponsiveSize = (small: number, medium: number, large: number) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  const getFontSize = (size: number) => {
    const baseSize = getResponsiveSize(size * 0.8, size, size * 1.2);
    return Math.round(baseSize);
  };

  useEffect(() => {
    // In a real app, this would fetch the integration data from an API
    setIntegration(mockIntegrations[id as keyof typeof mockIntegrations]);
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call to refresh integration data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
    setEditDialogVisible(true);
  };

  const handleSave = () => {
    // In a real app, this would update the integration config in the backend
    console.log('Saving integration config:', editField, editValue);
    setEditDialogVisible(false);
    setSnackbarMessage('Configuration updated successfully');
    setSnackbarVisible(true);
  };

  const handleTestConnection = () => {
    // Simulate testing the connection
    setSnackbarMessage('Connection test successful');
    setSnackbarVisible(true);
  };

  const handleSync = () => {
    // Simulate syncing data
    setSnackbarMessage('Data sync initiated');
    setSnackbarVisible(true);
  };

  const handleToggleEnabled = () => {
    if (integration) {
      setIntegration({ ...integration, enabled: !integration.enabled });
      setSnackbarMessage(`Integration ${!integration.enabled ? 'enabled' : 'disabled'}`);
      setSnackbarVisible(true);
    }
  };

  const handleToggleTestMode = () => {
    if (integration) {
      setIntegration({ ...integration, testMode: !integration.testMode });
      setSnackbarMessage(`Test mode ${!integration.testMode ? 'enabled' : 'disabled'}`);
      setSnackbarVisible(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'maintenance':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.outline;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const openMenu = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleAction = (action: string) => {
    setSelectedAction(action);
    closeMenu();
    setEditDialogVisible(true);
  };

  const closeDialog = () => {
    setEditDialogVisible(false);
    setSelectedAction(null);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(8, 12, 16),
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
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    card: {
      marginBottom: getResponsiveSize(8, 12, 16),
      elevation: getResponsiveSize(2, 3, 4),
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    statusText: {
      fontSize: getFontSize(14),
      marginRight: getResponsiveSize(4, 6, 8),
    },
    statusDot: {
      width: getResponsiveSize(8, 10, 12),
      height: getResponsiveSize(8, 10, 12),
      borderRadius: getResponsiveSize(4, 5, 6),
    },
    healthContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    healthText: {
      fontSize: getFontSize(14),
      marginRight: getResponsiveSize(4, 6, 8),
    },
    healthBar: {
      flex: 1,
      height: getResponsiveSize(4, 6, 8),
      borderRadius: getResponsiveSize(2, 3, 4),
    },
    sectionTitle: {
      fontSize: getFontSize(16),
      fontWeight: 'bold',
      marginBottom: getResponsiveSize(8, 12, 16),
      color: theme.colors.primary,
    },
    configItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: getResponsiveSize(8, 12, 16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    configLabel: {
      fontSize: getFontSize(14),
      color: theme.colors.onSurface,
      flex: 1,
    },
    configValue: {
      fontSize: getFontSize(14),
      color: theme.colors.primary,
      marginLeft: getResponsiveSize(8, 12, 16),
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getResponsiveSize(8, 12, 16),
    },
    statItem: {
      flex: 1,
      minWidth: isSmallScreen ? '100%' : isMediumScreen ? '45%' : '30%',
      backgroundColor: theme.colors.surfaceVariant,
      padding: getResponsiveSize(12, 16, 20),
      borderRadius: getResponsiveSize(6, 8, 10),
      alignItems: 'center',
    },
    statValue: {
      fontSize: getFontSize(20),
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
      textAlign: 'center',
    },
    actionButton: {
      marginTop: getResponsiveSize(8, 12, 16),
    },
    dialogContent: {
      padding: getResponsiveSize(16, 20, 24),
    },
    input: {
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    tabContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    timeRangeContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    logItem: {
      padding: getResponsiveSize(8, 12, 16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: getResponsiveSize(4, 6, 8),
    },
    logTimestamp: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    logLevel: {
      fontSize: getFontSize(12),
      fontWeight: 'bold',
    },
    logMessage: {
      fontSize: getFontSize(14),
      marginBottom: getResponsiveSize(4, 6, 8),
    },
    logDetails: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
      backgroundColor: theme.colors.surfaceVariant,
      padding: getResponsiveSize(8, 12, 16),
      borderRadius: getResponsiveSize(4, 6, 8),
    },
    eventItem: {
      padding: getResponsiveSize(8, 12, 16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: getResponsiveSize(4, 6, 8),
    },
    eventTimestamp: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    eventType: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
    },
    eventStatus: {
      fontSize: getFontSize(12),
      fontWeight: 'bold',
    },
    eventDetails: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
      backgroundColor: theme.colors.surfaceVariant,
      padding: getResponsiveSize(8, 12, 16),
      borderRadius: getResponsiveSize(4, 6, 8),
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: getResponsiveSize(8, 12, 16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    metricLabel: {
      fontSize: getFontSize(14),
      color: theme.colors.onSurface,
    },
    metricValue: {
      fontSize: getFontSize(14),
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    backButton: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
  });

  if (!integration) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderOverviewTab = () => (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Status:</Text>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: getStatusColor(integration.status) }
              ]} 
            />
            <Text style={[styles.statusText, { marginLeft: 4 }]}>
              {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
            </Text>
          </View>
          
          <View style={styles.healthContainer}>
            <Text style={styles.healthText}>Health:</Text>
            <ProgressBar
              progress={integration.health / 100}
              color={integration.health > 90 ? theme.colors.primary : 
                     integration.health > 70 ? theme.colors.warning : 
                     theme.colors.error}
              style={styles.healthBar}
            />
            <Text style={[styles.healthText, { marginLeft: 8 }]}>{integration.health}%</Text>
          </View>
          
          <Text style={styles.lastSync}>
            Last synced: {formatDate(integration.lastSync)}
          </Text>
          
          <View style={{ flexDirection: 'row', marginTop: getResponsiveSize(16, 20, 24) }}>
            <Switch
              value={integration.enabled}
              onValueChange={handleToggleEnabled}
              style={{ marginRight: getResponsiveSize(16, 20, 24) }}
            />
            <Text style={{ fontSize: getFontSize(14), alignSelf: 'center' }}>
              {integration.enabled ? 'Enabled' : 'Disabled'}
            </Text>
            
            {integration.testMode !== undefined && (
              <>
                <Switch
                  value={integration.testMode}
                  onValueChange={handleToggleTestMode}
                  style={{ marginLeft: getResponsiveSize(16, 20, 24), marginRight: getResponsiveSize(16, 20, 24) }}
                />
                <Text style={{ fontSize: getFontSize(14), alignSelf: 'center' }}>
                  {integration.testMode ? 'Test Mode' : 'Live Mode'}
                </Text>
              </>
            )}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Configuration</Text>
          {Object.entries(integration.config).map(([configKey, configValue]) => (
            <View key={configKey} style={styles.configItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.configLabel}>
                  {configKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={[styles.configValue, { fontSize: getFontSize(12) }]}>
                  {typeof configValue === 'string' && configValue.length > 20 
                    ? configValue.substring(0, 20) + '...' 
                    : configValue}
                </Text>
              </View>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEdit(configKey, configValue as string)}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            {Object.entries(integration.stats).map(([statKey, statValue]) => (
              <View key={statKey} style={styles.statItem}>
                <Text style={styles.statValue}>
                  {typeof statValue === 'number' && statKey.includes('Rate') 
                    ? `${statValue}%` 
                    : typeof statValue === 'number' && statKey.includes('Time') 
                      ? `${statValue}s` 
                      : statValue}
                </Text>
                <Text style={styles.statLabel}>
                  {statKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: getResponsiveSize(8, 12, 16) }}>
        <Button 
          mode="outlined" 
          onPress={handleTestConnection}
          style={{ marginRight: 8 }}
        >
          Test Connection
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSync}
        >
          Sync Now
        </Button>
      </View>
    </>
  );

  const renderLogsTab = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Recent Logs</Text>
        {integration.logs.map((log: any) => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logHeader}>
              <Text style={styles.logTimestamp}>{formatDate(log.timestamp)}</Text>
              <Text style={[styles.logLevel, { color: getLogLevelColor(log.level) }]}>
                {log.level.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.logMessage}>{log.message}</Text>
            <Text style={styles.logDetails}>
              {JSON.stringify(log.details, null, 2)}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderEventsTab = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {integration.events.map((event: any) => (
          <View key={event.id} style={styles.eventItem}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTimestamp}>{formatDate(event.timestamp)}</Text>
              <Text style={[styles.eventStatus, { color: event.status === 'success' ? theme.colors.primary : theme.colors.error }]}>
                {event.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.eventType}>{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</Text>
            <Text style={styles.eventDetails}>
              {JSON.stringify(event.details, null, 2)}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderMetricsTab = () => (
    <>
      <View style={styles.timeRangeContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'daily', label: 'Daily' },
            { value: 'hourly', label: 'Hourly' },
          ]}
        />
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            {timeRange === 'daily' ? 'Daily Metrics' : 'Hourly Metrics'}
          </Text>
          
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>{timeRange === 'daily' ? 'Date' : 'Hour'}</DataTable.Title>
              <DataTable.Title numeric>Transactions</DataTable.Title>
              <DataTable.Title numeric>Success</DataTable.Title>
              <DataTable.Title numeric>Failed</DataTable.Title>
              <DataTable.Title numeric>Revenue</DataTable.Title>
            </DataTable.Header>
            
            {(timeRange === 'daily' ? integration.metrics.daily : integration.metrics.hourly).map((metric: any, index: number) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{timeRange === 'daily' ? metric.date : metric.hour}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.transactions}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.success}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.failed}</DataTable.Cell>
                <DataTable.Cell numeric>₹{metric.revenue.toLocaleString()}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </>
  );

  return (
    <View style={styles.container}>
      <Button 
        icon="arrow-left" 
        mode="outlined" 
        onPress={() => router.back()}
        style={styles.backButton}
      >
        Back to Integrations
      </Button>
      
      <View style={styles.header}>
        <Text style={styles.title}>{integration.name}</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'overview', label: 'Overview' },
            { value: 'logs', label: 'Logs' },
            { value: 'events', label: 'Events' },
            { value: 'metrics', label: 'Metrics' },
          ]}
        />
      </View>
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'logs' && renderLogsTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'metrics' && renderMetricsTab()}
      </ScrollView>
      
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Edit Configuration</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label={editField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              value={editValue}
              onChangeText={setEditValue}
              mode="outlined"
              style={styles.input}
              secureTextEntry={editField.includes('key') || editField.includes('secret')}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
} 