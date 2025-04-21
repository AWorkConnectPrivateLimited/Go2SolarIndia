import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, Portal, Dialog, TextInput, SegmentedButtons, Menu, IconButton, Chip, ProgressBar, List, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useTheme } from 'react-native-paper';

// Mock data for analytics
const mockAnalytics = {
  overview: {
    totalCustomers: 1250,
    totalProjects: 850,
    totalRevenue: 12500000,
    averageProjectValue: 147058,
    customerGrowth: 15.5,
    projectGrowth: 12.3,
    revenueGrowth: 18.7,
  },
  customerMetrics: [
    { month: 'Jan', newCustomers: 85, activeCustomers: 980, churnRate: 2.1 },
    { month: 'Feb', newCustomers: 92, activeCustomers: 1020, churnRate: 1.8 },
    { month: 'Mar', newCustomers: 105, activeCustomers: 1080, churnRate: 1.9 },
    { month: 'Apr', newCustomers: 115, activeCustomers: 1150, churnRate: 1.7 },
    { month: 'May', newCustomers: 125, activeCustomers: 1220, churnRate: 1.6 },
    { month: 'Jun', newCustomers: 135, activeCustomers: 1250, churnRate: 1.5 },
  ],
  projectMetrics: [
    { month: 'Jan', newProjects: 65, completedProjects: 60, averageDuration: 45 },
    { month: 'Feb', newProjects: 72, completedProjects: 68, averageDuration: 42 },
    { month: 'Mar', newProjects: 85, completedProjects: 80, averageDuration: 40 },
    { month: 'Apr', newProjects: 95, completedProjects: 90, averageDuration: 38 },
    { month: 'May', newProjects: 105, completedProjects: 100, averageDuration: 37 },
    { month: 'Jun', newProjects: 115, completedProjects: 110, averageDuration: 35 },
  ],
  revenueMetrics: [
    { month: 'Jan', revenue: 1850000, expenses: 1200000, profit: 650000 },
    { month: 'Feb', revenue: 1950000, expenses: 1250000, profit: 700000 },
    { month: 'Mar', revenue: 2100000, expenses: 1300000, profit: 800000 },
    { month: 'Apr', revenue: 2250000, expenses: 1350000, profit: 900000 },
    { month: 'May', revenue: 2400000, expenses: 1400000, profit: 1000000 },
    { month: 'Jun', revenue: 2550000, expenses: 1450000, profit: 1100000 },
  ],
  regionalData: [
    { region: 'North', customers: 350, projects: 280, revenue: 3500000 },
    { region: 'South', customers: 420, projects: 340, revenue: 4200000 },
    { region: 'East', customers: 280, projects: 120, revenue: 2800000 },
    { region: 'West', customers: 200, projects: 110, revenue: 2000000 },
  ],
  productPerformance: [
    { product: 'Solar Panels', units: 1250, revenue: 3750000, growth: 12.5 },
    { product: 'Inverters', units: 850, revenue: 2550000, growth: 10.8 },
    { product: 'Batteries', units: 450, revenue: 2250000, growth: 15.2 },
    { product: 'Installation Services', units: 850, revenue: 3950000, growth: 18.3 },
  ],
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Get growth color
const getGrowthColor = (value: number) => {
  return value >= 0 ? '#4CAF50' : '#F44336';
};

// Get growth icon
const getGrowthIcon = (value: number) => {
  return value >= 0 ? 'arrow-up' : 'arrow-down';
};

export default function AnalyticsScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('customers');
  const [dateRange, setDateRange] = useState('6m');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Open metric details dialog
  const openDetailsDialog = (metric: any) => {
    setSelectedMetric(metric);
    setDialogVisible(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogVisible(false);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  // Render overview card
  const renderOverviewCard = () => {
    const { overview } = mockAnalytics;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Business Overview</Text>
          
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text variant="headlineMedium">{overview.totalCustomers}</Text>
              <Text variant="bodyMedium">Total Customers</Text>
              <View style={styles.growthIndicator}>
                <IconButton
                  icon={getGrowthIcon(overview.customerGrowth)}
                  size={16}
                  iconColor={getGrowthColor(overview.customerGrowth)}
                />
                <Text style={{ color: getGrowthColor(overview.customerGrowth) }}>
                  {formatPercentage(overview.customerGrowth)}
                </Text>
              </View>
            </View>
            
            <View style={styles.overviewItem}>
              <Text variant="headlineMedium">{overview.totalProjects}</Text>
              <Text variant="bodyMedium">Total Projects</Text>
              <View style={styles.growthIndicator}>
                <IconButton
                  icon={getGrowthIcon(overview.projectGrowth)}
                  size={16}
                  iconColor={getGrowthColor(overview.projectGrowth)}
                />
                <Text style={{ color: getGrowthColor(overview.projectGrowth) }}>
                  {formatPercentage(overview.projectGrowth)}
                </Text>
              </View>
            </View>
            
            <View style={styles.overviewItem}>
              <Text variant="headlineMedium">{formatCurrency(overview.totalRevenue)}</Text>
              <Text variant="bodyMedium">Total Revenue</Text>
              <View style={styles.growthIndicator}>
                <IconButton
                  icon={getGrowthIcon(overview.revenueGrowth)}
                  size={16}
                  iconColor={getGrowthColor(overview.revenueGrowth)}
                />
                <Text style={{ color: getGrowthColor(overview.revenueGrowth) }}>
                  {formatPercentage(overview.revenueGrowth)}
                </Text>
              </View>
            </View>
            
            <View style={styles.overviewItem}>
              <Text variant="headlineMedium">{formatCurrency(overview.averageProjectValue)}</Text>
              <Text variant="bodyMedium">Avg. Project Value</Text>
              <View style={styles.growthIndicator}>
                <IconButton
                  icon="equal"
                  size={16}
                  iconColor="#9E9E9E"
                />
                <Text style={{ color: '#9E9E9E' }}>
                  N/A
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render customer metrics
  const renderCustomerMetrics = () => {
    const { customerMetrics } = mockAnalytics;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Customer Metrics</Text>
          
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Month</DataTable.Title>
              <DataTable.Title numeric>New</DataTable.Title>
              <DataTable.Title numeric>Active</DataTable.Title>
              <DataTable.Title numeric>Churn</DataTable.Title>
            </DataTable.Header>

            {customerMetrics.map((metric, index) => (
              <DataTable.Row key={index} onPress={() => openDetailsDialog({ ...metric, type: 'customer' })}>
                <DataTable.Cell>{metric.month}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.newCustomers}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.activeCustomers}</DataTable.Cell>
                <DataTable.Cell numeric>{formatPercentage(metric.churnRate)}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  // Render project metrics
  const renderProjectMetrics = () => {
    const { projectMetrics } = mockAnalytics;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Project Metrics</Text>
          
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Month</DataTable.Title>
              <DataTable.Title numeric>New</DataTable.Title>
              <DataTable.Title numeric>Completed</DataTable.Title>
              <DataTable.Title numeric>Avg. Duration</DataTable.Title>
            </DataTable.Header>

            {projectMetrics.map((metric, index) => (
              <DataTable.Row key={index} onPress={() => openDetailsDialog({ ...metric, type: 'project' })}>
                <DataTable.Cell>{metric.month}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.newProjects}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.completedProjects}</DataTable.Cell>
                <DataTable.Cell numeric>{metric.averageDuration} days</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  // Render revenue metrics
  const renderRevenueMetrics = () => {
    const { revenueMetrics } = mockAnalytics;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Revenue Metrics</Text>
          
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Month</DataTable.Title>
              <DataTable.Title numeric>Revenue</DataTable.Title>
              <DataTable.Title numeric>Expenses</DataTable.Title>
              <DataTable.Title numeric>Profit</DataTable.Title>
            </DataTable.Header>

            {revenueMetrics.map((metric, index) => (
              <DataTable.Row key={index} onPress={() => openDetailsDialog({ ...metric, type: 'revenue' })}>
                <DataTable.Cell>{metric.month}</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(metric.revenue)}</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(metric.expenses)}</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(metric.profit)}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  // Render regional data
  const renderRegionalData = () => {
    const { regionalData } = mockAnalytics;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Regional Performance</Text>
          
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Region</DataTable.Title>
              <DataTable.Title numeric>Customers</DataTable.Title>
              <DataTable.Title numeric>Projects</DataTable.Title>
              <DataTable.Title numeric>Revenue</DataTable.Title>
            </DataTable.Header>

            {regionalData.map((region, index) => (
              <DataTable.Row key={index} onPress={() => openDetailsDialog({ ...region, type: 'region' })}>
                <DataTable.Cell>{region.region}</DataTable.Cell>
                <DataTable.Cell numeric>{region.customers}</DataTable.Cell>
                <DataTable.Cell numeric>{region.projects}</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(region.revenue)}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  // Render product performance
  const renderProductPerformance = () => {
    const { productPerformance } = mockAnalytics;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Product Performance</Text>
          
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Product</DataTable.Title>
              <DataTable.Title numeric>Units</DataTable.Title>
              <DataTable.Title numeric>Revenue</DataTable.Title>
              <DataTable.Title numeric>Growth</DataTable.Title>
            </DataTable.Header>

            {productPerformance.map((product, index) => (
              <DataTable.Row key={index} onPress={() => openDetailsDialog({ ...product, type: 'product' })}>
                <DataTable.Cell>{product.product}</DataTable.Cell>
                <DataTable.Cell numeric>{product.units}</DataTable.Cell>
                <DataTable.Cell numeric>{formatCurrency(product.revenue)}</DataTable.Cell>
                <DataTable.Cell numeric>
                  <View style={styles.growthIndicator}>
                    <IconButton
                      icon={getGrowthIcon(product.growth)}
                      size={16}
                      iconColor={getGrowthColor(product.growth)}
                    />
                    <Text style={{ color: getGrowthColor(product.growth) }}>
                      {formatPercentage(product.growth)}
                    </Text>
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  // Render metric details dialog
  const renderMetricDetailsDialog = () => {
    if (!selectedMetric) return null;
    
    const getMetricTitle = () => {
      switch (selectedMetric.type) {
        case 'customer':
          return 'Customer Metrics Details';
        case 'project':
          return 'Project Metrics Details';
        case 'revenue':
          return 'Revenue Metrics Details';
        case 'region':
          return 'Regional Performance Details';
        case 'product':
          return 'Product Performance Details';
        default:
          return 'Metric Details';
      }
    };
    
    const renderMetricDetails = () => {
      switch (selectedMetric.type) {
        case 'customer':
          return (
            <View>
              <List.Item
                title="Month"
                description={selectedMetric.month}
                left={props => <List.Icon {...props} icon="calendar" />}
              />
              <List.Item
                title="New Customers"
                description={selectedMetric.newCustomers}
                left={props => <List.Icon {...props} icon="account-plus" />}
              />
              <List.Item
                title="Active Customers"
                description={selectedMetric.activeCustomers}
                left={props => <List.Icon {...props} icon="account-group" />}
              />
              <List.Item
                title="Churn Rate"
                description={formatPercentage(selectedMetric.churnRate)}
                left={props => <List.Icon {...props} icon="account-remove" />}
              />
            </View>
          );
        case 'project':
          return (
            <View>
              <List.Item
                title="Month"
                description={selectedMetric.month}
                left={props => <List.Icon {...props} icon="calendar" />}
              />
              <List.Item
                title="New Projects"
                description={selectedMetric.newProjects}
                left={props => <List.Icon {...props} icon="plus-circle" />}
              />
              <List.Item
                title="Completed Projects"
                description={selectedMetric.completedProjects}
                left={props => <List.Icon {...props} icon="check-circle" />}
              />
              <List.Item
                title="Average Duration"
                description={`${selectedMetric.averageDuration} days`}
                left={props => <List.Icon {...props} icon="clock" />}
              />
            </View>
          );
        case 'revenue':
          return (
            <View>
              <List.Item
                title="Month"
                description={selectedMetric.month}
                left={props => <List.Icon {...props} icon="calendar" />}
              />
              <List.Item
                title="Revenue"
                description={formatCurrency(selectedMetric.revenue)}
                left={props => <List.Icon {...props} icon="cash" />}
              />
              <List.Item
                title="Expenses"
                description={formatCurrency(selectedMetric.expenses)}
                left={props => <List.Icon {...props} icon="cash-remove" />}
              />
              <List.Item
                title="Profit"
                description={formatCurrency(selectedMetric.profit)}
                left={props => <List.Icon {...props} icon="cash-plus" />}
              />
            </View>
          );
        case 'region':
          return (
            <View>
              <List.Item
                title="Region"
                description={selectedMetric.region}
                left={props => <List.Icon {...props} icon="map-marker" />}
              />
              <List.Item
                title="Customers"
                description={selectedMetric.customers}
                left={props => <List.Icon {...props} icon="account-group" />}
              />
              <List.Item
                title="Projects"
                description={selectedMetric.projects}
                left={props => <List.Icon {...props} icon="folder" />}
              />
              <List.Item
                title="Revenue"
                description={formatCurrency(selectedMetric.revenue)}
                left={props => <List.Icon {...props} icon="cash" />}
              />
            </View>
          );
        case 'product':
          return (
            <View>
              <List.Item
                title="Product"
                description={selectedMetric.product}
                left={props => <List.Icon {...props} icon="package-variant" />}
              />
              <List.Item
                title="Units Sold"
                description={selectedMetric.units}
                left={props => <List.Icon {...props} icon="cart" />}
              />
              <List.Item
                title="Revenue"
                description={formatCurrency(selectedMetric.revenue)}
                left={props => <List.Icon {...props} icon="cash" />}
              />
              <List.Item
                title="Growth"
                description={
                  <View style={styles.growthIndicator}>
                    <IconButton
                      icon={getGrowthIcon(selectedMetric.growth)}
                      size={16}
                      iconColor={getGrowthColor(selectedMetric.growth)}
                    />
                    <Text style={{ color: getGrowthColor(selectedMetric.growth) }}>
                      {formatPercentage(selectedMetric.growth)}
                    </Text>
                  </View>
                }
                left={props => <List.Icon {...props} icon="trending-up" />}
              />
            </View>
          );
        default:
          return null;
      }
    };
    
    return (
      <Dialog visible={dialogVisible} onDismiss={closeDialog}>
        <Dialog.Title>{getMetricTitle()}</Dialog.Title>
        <Dialog.Content>
          {renderMetricDetails()}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={closeDialog}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium">Analytics Dashboard</Text>
          <Button
            mode="contained"
            onPress={onRefresh}
            icon="refresh"
          >
            Refresh
          </Button>
        </View>

        {/* Date Range Filter */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>Date Range</Text>
            
            <SegmentedButtons
              value={dateRange}
              onValueChange={handleDateRangeChange}
              buttons={[
                { value: '1m', label: '1 Month' },
                { value: '3m', label: '3 Months' },
                { value: '6m', label: '6 Months' },
                { value: '1y', label: '1 Year' },
              ]}
            />
          </Card.Content>
        </Card>

        {/* Overview Card */}
        {renderOverviewCard()}

        {/* Tabs */}
        <Card style={styles.tabCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.tabTitle}>Analytics Categories</Text>
            <SegmentedButtons
              value={activeTab}
              onValueChange={handleTabChange}
              buttons={[
                { value: 'customers', label: 'Customers' },
                { value: 'projects', label: 'Projects' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'regional', label: 'Regional' },
                { value: 'products', label: 'Products' },
              ]}
            />
          </Card.Content>
        </Card>

        {/* Tab Content */}
        {activeTab === 'customers' && renderCustomerMetrics()}
        {activeTab === 'projects' && renderProjectMetrics()}
        {activeTab === 'revenue' && renderRevenueMetrics()}
        {activeTab === 'regional' && renderRegionalData()}
        {activeTab === 'products' && renderProductPerformance()}
      </ScrollView>

      {/* Metric Details Dialog */}
      {renderMetricDetailsDialog()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterCard: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabCard: {
    marginBottom: 16,
  },
  tabTitle: {
    marginBottom: 8,
  },
}); 