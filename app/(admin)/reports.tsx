import { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import { Text, Card, Button, SegmentedButtons, DataTable, List, Divider, ProgressBar, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';

// Mock data for demonstration
const mockData = {
  overview: {
    totalProjects: 156,
    activeProjects: 89,
    totalCustomers: 142,
    totalAgents: 25,
    totalRevenue: 45678900,
    averageProjectValue: 292813,
  },
  projectTrends: [
    { month: 'Jan', count: 20 },
    { month: 'Feb', count: 25 },
    { month: 'Mar', count: 30 },
    { month: 'Apr', count: 35 },
    { month: 'May', count: 40 },
    { month: 'Jun', count: 45 },
  ],
  revenueByType: [
    { type: 'Physical', percentage: 65, color: '#4CAF50' },
    { type: 'Digital', percentage: 35, color: '#2196F3' },
  ],
  monthlyRevenue: [
    { month: 'Jan', amount: 2500000 },
    { month: 'Feb', amount: 3000000 },
    { month: 'Mar', amount: 3500000 },
    { month: 'Apr', amount: 4000000 },
    { month: 'May', amount: 4500000 },
    { month: 'Jun', amount: 5000000 },
  ],
  recentTransactions: [
    { id: '1', customer: 'John Doe', amount: 500000, type: 'Physical', date: '2024-03-15' },
    { id: '2', customer: 'Jane Smith', amount: 300000, type: 'Digital', date: '2024-03-14' },
    { id: '3', customer: 'Bob Wilson', amount: 450000, type: 'Physical', date: '2024-03-13' },
    { id: '4', customer: 'Alice Brown', amount: 250000, type: 'Digital', date: '2024-03-12' },
  ],
  agentPerformance: [
    { id: '1', name: 'Agent 1', projects: 15, completion: 95, rating: 4.8 },
    { id: '2', name: 'Agent 2', projects: 12, completion: 92, rating: 4.6 },
    { id: '3', name: 'Agent 3', projects: 10, completion: 88, rating: 4.5 },
    { id: '4', name: 'Agent 4', projects: 8, completion: 85, rating: 4.3 },
  ],
};

export default function ReportsScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('projects');
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const theme = useTheme();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(8, 12, 16),
      backgroundColor: theme.colors.background,
    },
    card: {
      marginBottom: getResponsiveSize(8, 12, 16),
      elevation: getResponsiveSize(2, 3, 4),
    },
    sectionTitle: {
      marginBottom: getResponsiveSize(8, 12, 16),
      fontSize: getFontSize(16),
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getResponsiveSize(8, 12, 16),
    },
    metricItem: {
      flex: 1,
      minWidth: isSmallScreen ? '100%' : isMediumScreen ? '45%' : '30%',
      backgroundColor: theme.colors.surfaceVariant,
      padding: getResponsiveSize(12, 16, 20),
      borderRadius: getResponsiveSize(6, 8, 10),
      alignItems: 'center',
    },
    metricValue: {
      fontSize: getFontSize(24),
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    metricLabel: {
      fontSize: getFontSize(14),
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    trendContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: getResponsiveSize(150, 180, 200),
      paddingTop: getResponsiveSize(12, 16, 20),
    },
    trendItem: {
      flex: 1,
      alignItems: 'center',
    },
    trendBar: {
      width: getResponsiveSize(16, 20, 24),
      height: getResponsiveSize(80, 100, 120),
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: getResponsiveSize(6, 8, 10),
      overflow: 'hidden',
      marginVertical: getResponsiveSize(6, 8, 10),
    },
    trendBarFill: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      borderRadius: getResponsiveSize(6, 8, 10),
    },
    trendLabel: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    trendValue: {
      fontSize: getFontSize(12),
      color: theme.colors.primary,
      marginTop: 4,
    },
    distributionContainer: {
      gap: getResponsiveSize(12, 16, 20),
    },
    distributionItem: {
      gap: getResponsiveSize(6, 8, 10),
    },
    distributionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    distributionLabel: {
      fontSize: getFontSize(14),
      color: theme.colors.onSurface,
    },
    distributionPercentage: {
      fontSize: getFontSize(14),
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    distributionBar: {
      height: getResponsiveSize(6, 8, 10),
      borderRadius: getResponsiveSize(3, 4, 5),
    },
    tableContainer: {
      overflow: 'hidden',
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
      fontSize: getFontSize(14),
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Time Range Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Time Range</Text>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'quarter', label: 'Quarter' },
              { value: 'year', label: 'Year' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Overview Metrics */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockData.overview.totalProjects}</Text>
              <Text style={styles.metricLabel}>Total Projects</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockData.overview.activeProjects}</Text>
              <Text style={styles.metricLabel}>Active Projects</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockData.overview.totalCustomers}</Text>
              <Text style={styles.metricLabel}>Total Customers</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{mockData.overview.totalAgents}</Text>
              <Text style={styles.metricLabel}>Total Agents</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatCurrency(mockData.overview.totalRevenue)}</Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatCurrency(mockData.overview.averageProjectValue)}</Text>
              <Text style={styles.metricLabel}>Avg. Project Value</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Project Trends */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Project Trends</Text>
          <View style={styles.trendContainer}>
            {mockData.projectTrends.map((item, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendLabel}>{item.month}</Text>
                <View style={styles.trendBar}>
                  <View 
                    style={[
                      styles.trendBarFill,
                      { 
                        height: `${(item.count / getMaxValue(mockData.projectTrends, 'count')) * 100}%`,
                        backgroundColor: theme.colors.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.trendValue}>{item.count}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Revenue Distribution */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Revenue by Type</Text>
          <View style={styles.distributionContainer}>
            {mockData.revenueByType.map((item, index) => (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionHeader}>
                  <Text style={styles.distributionLabel}>{item.type}</Text>
                  <Text style={styles.distributionPercentage}>{item.percentage}%</Text>
                </View>
                <ProgressBar
                  progress={item.percentage / 100}
                  color={item.color}
                  style={styles.distributionBar}
                />
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Monthly Revenue */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Monthly Revenue</Text>
          <View style={styles.trendContainer}>
            {mockData.monthlyRevenue.map((item, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendLabel}>{item.month}</Text>
                <View style={styles.trendBar}>
                  <View 
                    style={[
                      styles.trendBarFill,
                      { 
                        height: `${(item.amount / getMaxValue(mockData.monthlyRevenue, 'amount')) * 100}%`,
                        backgroundColor: theme.colors.secondary
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.trendValue}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Recent Transactions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.tableCell}>
                  <Text style={styles.tableText}>Customer</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.tableCell}>
                  <Text style={styles.tableText}>Amount</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.tableCell}>
                  <Text style={styles.tableText}>Type</Text>
                </DataTable.Title>
              </DataTable.Header>

              {mockData.recentTransactions.map((transaction) => (
                <DataTable.Row key={transaction.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{transaction.customer}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{formatCurrency(transaction.amount)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{transaction.type}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </Card.Content>
      </Card>

      {/* Agent Performance */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Agent Performance</Text>
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.tableCell}>
                  <Text style={styles.tableText}>Agent</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.tableCell}>
                  <Text style={styles.tableText}>Projects</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.tableCell}>
                  <Text style={styles.tableText}>Completion</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.tableCell}>
                  <Text style={styles.tableText}>Rating</Text>
                </DataTable.Title>
              </DataTable.Header>

              {mockData.agentPerformance.map((agent) => (
                <DataTable.Row key={agent.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{agent.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{agent.projects}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{agent.completion}%</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{agent.rating}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
} 