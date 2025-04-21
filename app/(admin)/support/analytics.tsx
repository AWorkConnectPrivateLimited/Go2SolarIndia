import { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, Chip, SegmentedButtons, useTheme, Divider, IconButton, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for demonstration
const mockAnalytics = {
  overview: {
    totalTickets: 1250,
    openTickets: 85,
    resolvedToday: 12,
    avgResolutionTime: '2.5 days',
    customerSatisfaction: 4.8,
    firstResponseTime: '1.2 hours'
  },
  byCategory: [
    { category: 'technical', count: 450, percentage: 36 },
    { category: 'billing', count: 320, percentage: 25.6 },
    { category: 'installation', count: 280, percentage: 22.4 },
    { category: 'account', count: 200, percentage: 16 }
  ],
  byPriority: [
    { priority: 'high', count: 180, percentage: 14.4 },
    { priority: 'medium', count: 650, percentage: 52 },
    { priority: 'low', count: 420, percentage: 33.6 }
  ],
  byStatus: [
    { status: 'open', count: 85, percentage: 6.8 },
    { status: 'in_progress', count: 120, percentage: 9.6 },
    { status: 'pending', count: 45, percentage: 3.6 },
    { status: 'resolved', count: 1000, percentage: 80 }
  ],
  monthlyTrends: [
    { month: 'Jan', tickets: 95, resolved: 85 },
    { month: 'Feb', tickets: 110, resolved: 98 },
    { month: 'Mar', tickets: 105, resolved: 92 },
    { month: 'Apr', tickets: 120, resolved: 105 },
    { month: 'May', tickets: 130, resolved: 115 },
    { month: 'Jun', tickets: 125, resolved: 110 }
  ],
  agentPerformance: [
    { name: 'Mike Johnson', tickets: 85, resolved: 75, satisfaction: 4.9 },
    { name: 'Sarah Williams', tickets: 72, resolved: 65, satisfaction: 4.7 },
    { name: 'David Miller', tickets: 68, resolved: 60, satisfaction: 4.8 },
    { name: 'Emily Brown', tickets: 62, resolved: 55, satisfaction: 4.6 },
    { name: 'James Wilson', tickets: 58, resolved: 50, satisfaction: 4.5 }
  ]
};

export default function SupportAnalyticsScreen() {
  const [timeRange, setTimeRange] = useState('week');
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
      case 'open':
        return theme.colors.error;
      case 'in_progress':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary;
      case 'resolved':
        return theme.colors.secondary;
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
    timeRangeSelector: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    card: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    cardTitle: {
      fontSize: getFontSize(16),
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    overviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    overviewCard: {
      width: isSmallScreen ? '100%' : isMediumScreen ? '48%' : '23%',
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    overviewValue: {
      fontSize: getFontSize(20),
      fontWeight: 'bold',
      marginBottom: getResponsiveSize(4, 6, 8),
    },
    overviewLabel: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    chartContainer: {
      height: getResponsiveSize(200, 250, 300),
      marginTop: getResponsiveSize(16, 20, 24),
    },
    barContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: '100%',
      justifyContent: 'space-between',
    },
    bar: {
      width: isSmallScreen ? '12%' : isMediumScreen ? '10%' : '8%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    barLabel: {
      fontSize: getFontSize(10),
      textAlign: 'center',
      marginTop: 4,
    },
    progressContainer: {
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    progressLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    progressText: {
      fontSize: getFontSize(12),
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    tableHeader: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: getResponsiveSize(8, 12, 16),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tableHeaderText: {
      fontSize: getFontSize(12),
      fontWeight: 'bold',
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: getResponsiveSize(8, 12, 16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    tableCell: {
      fontSize: getFontSize(12),
    },
    tableCellBold: {
      fontSize: getFontSize(12),
      fontWeight: 'bold',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    starIcon: {
      color: theme.colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveSize(32, 40, 48),
    },
    emptyStateText: {
      fontSize: getFontSize(16),
      textAlign: 'center',
      marginTop: getResponsiveSize(8, 12, 16),
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Support Analytics</Text>
          <Button 
            mode="outlined" 
            onPress={() => router.back()}
            icon="arrow-left"
          >
            Back
          </Button>
        </View>

        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'day', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' },
          ]}
          style={styles.timeRangeSelector}
        />

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Overview</Text>
            <View style={styles.overviewContainer}>
              <Card style={styles.overviewCard}>
                <Card.Content>
                  <Text style={styles.overviewValue}>{mockAnalytics.overview.totalTickets}</Text>
                  <Text style={styles.overviewLabel}>Total Tickets</Text>
                </Card.Content>
              </Card>
              <Card style={styles.overviewCard}>
                <Card.Content>
                  <Text style={styles.overviewValue}>{mockAnalytics.overview.openTickets}</Text>
                  <Text style={styles.overviewLabel}>Open Tickets</Text>
                </Card.Content>
              </Card>
              <Card style={styles.overviewCard}>
                <Card.Content>
                  <Text style={styles.overviewValue}>{mockAnalytics.overview.resolvedToday}</Text>
                  <Text style={styles.overviewLabel}>Resolved Today</Text>
                </Card.Content>
              </Card>
              <Card style={styles.overviewCard}>
                <Card.Content>
                  <Text style={styles.overviewValue}>{mockAnalytics.overview.avgResolutionTime}</Text>
                  <Text style={styles.overviewLabel}>Avg. Resolution Time</Text>
                </Card.Content>
              </Card>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Tickets by Category</Text>
            {mockAnalytics.byCategory.map((item) => (
              <View key={item.category} style={styles.progressContainer}>
                <View style={styles.progressLabel}>
                  <Text style={styles.progressText}>{item.category}</Text>
                  <Text style={styles.progressText}>{item.count} ({item.percentage}%)</Text>
                </View>
                <ProgressBar 
                  progress={item.percentage / 100} 
                  color={getCategoryColor(item.category)}
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Tickets by Priority</Text>
            {mockAnalytics.byPriority.map((item) => (
              <View key={item.priority} style={styles.progressContainer}>
                <View style={styles.progressLabel}>
                  <Text style={styles.progressText}>{item.priority}</Text>
                  <Text style={styles.progressText}>{item.count} ({item.percentage}%)</Text>
                </View>
                <ProgressBar 
                  progress={item.percentage / 100} 
                  color={getPriorityColor(item.priority)}
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Tickets by Status</Text>
            {mockAnalytics.byStatus.map((item) => (
              <View key={item.status} style={styles.progressContainer}>
                <View style={styles.progressLabel}>
                  <Text style={styles.progressText}>{item.status.replace('_', ' ')}</Text>
                  <Text style={styles.progressText}>{item.count} ({item.percentage}%)</Text>
                </View>
                <ProgressBar 
                  progress={item.percentage / 100} 
                  color={getStatusColor(item.status)}
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Monthly Trends</Text>
            <View style={styles.chartContainer}>
              <View style={styles.barContainer}>
                {mockAnalytics.monthlyTrends.map((item) => (
                  <View key={item.month} style={{ alignItems: 'center' }}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: `${(item.tickets / Math.max(...mockAnalytics.monthlyTrends.map(m => m.tickets))) * 100}%`,
                          backgroundColor: theme.colors.primary
                        }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: `${(item.resolved / Math.max(...mockAnalytics.monthlyTrends.map(m => m.resolved))) * 100}%`,
                          backgroundColor: theme.colors.secondary,
                          marginTop: 4
                        }
                      ]} 
                    />
                    <Text style={styles.barLabel}>{item.month}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                  <View style={{ width: 12, height: 12, backgroundColor: theme.colors.primary, marginRight: 4 }} />
                  <Text style={{ fontSize: getFontSize(12) }}>Total</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, backgroundColor: theme.colors.secondary, marginRight: 4 }} />
                  <Text style={{ fontSize: getFontSize(12) }}>Resolved</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Agent Performance</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Agent</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Tickets</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Resolved</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Rating</Text>
            </View>
            {mockAnalytics.agentPerformance.map((agent) => (
              <View key={agent.name} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{agent.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{agent.tickets}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{agent.resolved}</Text>
                <View style={[styles.ratingContainer, { flex: 1 }]}>
                  <Text style={styles.tableCell}>{agent.satisfaction}</Text>
                  <IconButton icon="star" size={16} style={styles.starIcon} />
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
} 