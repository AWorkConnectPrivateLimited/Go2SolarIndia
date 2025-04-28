import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, useTheme, Surface, ProgressBar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const QUICK_ACTIONS = [
  { title: 'New Installation', icon: 'solar-panel', route: '/installations/new' },
  { title: 'Service Request', icon: 'wrench', route: '/service-requests/new' },
  { title: 'Add Customer', icon: 'account-plus', route: '/customers/new' },
  { title: 'Create Task', icon: 'clipboard-plus', route: '/tasks/new' },
];

const METRICS = [
  { title: 'Active Installations', value: '12', icon: 'solar-panel', change: '+2', color: '#4CAF50' },
  { title: 'Pending Tasks', value: '5', icon: 'clipboard-check', change: '-3', color: '#FF9800' },
  { title: 'Service Requests', value: '3', icon: 'wrench', change: '0', color: '#2196F3' },
  { title: 'Monthly Commission', value: '₹45,000', icon: 'cash', change: '+12%', color: '#9C27B0' },
];

const RECENT_ACTIVITIES = [
  {
    type: 'installation',
    title: 'New Installation Started',
    description: 'Residential Solar Project - 5kW',
    time: '2 hours ago',
    icon: 'solar-panel',
  },
  {
    type: 'service',
    title: 'Service Request Completed',
    description: 'Maintenance Check - System Health',
    time: '4 hours ago',
    icon: 'wrench',
  },
  {
    type: 'task',
    title: 'Site Survey Scheduled',
    description: 'Commercial Project - Initial Assessment',
    time: '1 day ago',
    icon: 'clipboard',
  },
];

export default function AgentDashboard() {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    welcomeCard: {
      marginBottom: 24,
      backgroundColor: theme.colors.primary,
    },
    welcomeContent: {
      padding: 24,
    },
    welcomeText: {
      color: theme.colors.onPrimary,
      marginBottom: 16,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -8,
      marginBottom: 24,
    },
    metricCard: {
      flex: 1,
      minWidth: isTablet ? '23%' : '45%',
      margin: 8,
      padding: 16,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricIcon: {
      marginRight: 8,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 4,
    },
    metricChange: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -8,
      marginBottom: 24,
    },
    actionCard: {
      flex: 1,
      minWidth: isTablet ? '23%' : '45%',
      margin: 8,
    },
    actionContent: {
      alignItems: 'center',
      padding: 16,
    },
    actionIcon: {
      marginBottom: 8,
    },
    sectionTitle: {
      marginBottom: 16,
      marginTop: 8,
    },
    activityCard: {
      marginBottom: 12,
    },
    activityContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activityInfo: {
      flex: 1,
      marginLeft: 16,
    },
    activityTime: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
      marginTop: 4,
    },
    performanceCard: {
      marginBottom: 24,
    },
    performanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
  });

  const renderMetricCard = (metric: typeof METRICS[0]) => (
    <Surface style={styles.metricCard} elevation={1}>
      <View style={styles.metricHeader}>
        <MaterialCommunityIcons
          name={metric.icon as any}
          size={24}
          color={metric.color}
          style={styles.metricIcon}
        />
        <Text variant="bodyMedium">{metric.title}</Text>
      </View>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <View style={styles.metricChange}>
        <MaterialCommunityIcons
          name={metric.change.startsWith('+') ? 'trending-up' : metric.change.startsWith('-') ? 'trending-down' : 'trending-neutral'}
          size={16}
          color={metric.change.startsWith('+') ? '#4CAF50' : metric.change.startsWith('-') ? '#F44336' : theme.colors.outline}
        />
        <Text style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>{metric.change}</Text>
      </View>
    </Surface>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.welcomeCard} elevation={2}>
        <View style={styles.welcomeContent}>
          <Text variant="headlineMedium" style={styles.welcomeText}>
            Welcome Back, Agent
          </Text>
          <Text variant="bodyLarge" style={[styles.welcomeText, { marginBottom: 0 }]}>
            Here's your performance overview
          </Text>
        </View>
      </Surface>

      <Text variant="titleLarge" style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {QUICK_ACTIONS.map((action) => (
          <Surface key={action.title} style={styles.actionCard} elevation={1}>
            <Button
              mode="text"
              onPress={() => router.push(action.route)}
              contentStyle={styles.actionContent}
            >
              <MaterialCommunityIcons
                name={action.icon as any}
                size={32}
                color={theme.colors.primary}
                style={styles.actionIcon}
              />
              <Text variant="bodyMedium">{action.title}</Text>
            </Button>
          </Surface>
        ))}
      </View>

      <Text variant="titleLarge" style={styles.sectionTitle}>Key Metrics</Text>
      <View style={styles.metricsGrid}>
        {METRICS.map((metric) => (
          <React.Fragment key={metric.title}>
            {renderMetricCard(metric)}
          </React.Fragment>
        ))}
      </View>

      <Surface style={styles.performanceCard} elevation={1}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>Monthly Performance</Text>
          <View style={styles.performanceRow}>
            <Text variant="bodyMedium">Installation Target</Text>
            <Text variant="bodyMedium">8/10</Text>
          </View>
          <ProgressBar progress={0.8} color={theme.colors.primary} style={{ height: 8, borderRadius: 4 }} />
          
          <View style={[styles.performanceRow, { marginTop: 16 }]}>
            <Text variant="bodyMedium">Service Resolution</Text>
            <Text variant="bodyMedium">92%</Text>
          </View>
          <ProgressBar progress={0.92} color="#4CAF50" style={{ height: 8, borderRadius: 4 }} />
          
          <View style={[styles.performanceRow, { marginTop: 16 }]}>
            <Text variant="bodyMedium">Customer Satisfaction</Text>
            <Text variant="bodyMedium">4.8/5</Text>
          </View>
          <ProgressBar progress={0.96} color="#2196F3" style={{ height: 8, borderRadius: 4 }} />
        </Card.Content>
      </Surface>

      <Text variant="titleLarge" style={styles.sectionTitle}>Recent Activity</Text>
      {RECENT_ACTIVITIES.map((activity, index) => (
        <Surface key={index} style={styles.activityCard} elevation={1}>
          <Card.Content style={styles.activityContent}>
            <MaterialCommunityIcons
              name={activity.icon as any}
              size={24}
              color={
                activity.type === 'installation'
                  ? '#4CAF50'
                  : activity.type === 'service'
                  ? '#2196F3'
                  : '#FF9800'
              }
            />
            <View style={styles.activityInfo}>
              <Text variant="bodyLarge">{activity.title}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {activity.description}
              </Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
            <IconButton
              icon="chevron-right"
              onPress={() => {
                // Navigate to detail view based on activity type
                switch (activity.type) {
                  case 'installation':
                    router.push('/installations');
                    break;
                  case 'service':
                    router.push('/service-requests');
                    break;
                  case 'task':
                    router.push('/tasks');
                    break;
                }
              }}
            />
          </Card.Content>
        </Surface>
      ))}
    </ScrollView>
  );
} 