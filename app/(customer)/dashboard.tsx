import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, Surface, useTheme, IconButton, ProgressBar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { RootState } from '../../src/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useState } from 'react';

// Mock data - Replace with actual data from your backend
const consumptionData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43, 50],
    },
  ],
};

const metrics = {
  currentConsumption: 45,
  targetConsumption: 60,
  savings: 25,
  carbonOffset: 120,
};

export default function CustomerDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [timeRange, setTimeRange] = useState('week');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    welcome: {
      marginBottom: 20,
    },
    metricsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    metricCard: {
      width: '48%',
      marginBottom: 16,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    metricLabel: {
      color: theme.colors.onSurfaceVariant,
    },
    chartCard: {
      marginBottom: 24,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    timeRangeButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    timeRangeButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    activeTimeRange: {
      backgroundColor: theme.colors.primaryContainer,
    },
    inactiveTimeRange: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    activeTimeRangeText: {
      color: theme.colors.onPrimaryContainer,
    },
    inactiveTimeRangeText: {
      color: theme.colors.onSurfaceVariant,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    actionCard: {
      width: '48%',
      marginBottom: 16,
    },
    actionIcon: {
      marginBottom: 8,
    },
    progressContainer: {
      marginTop: 8,
    },
    progressLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
  });

  const renderMetricCard = (title: string, value: string | number, icon: string) => (
    <Card style={styles.metricCard}>
      <Card.Content>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={styles.actionIcon}
        />
        <Text variant="titleMedium" style={styles.metricLabel}>{title}</Text>
        <Text variant="headlineMedium" style={styles.metricValue}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderQuickAction = (title: string, icon: string, route: string) => (
    <Card style={styles.actionCard}>
      <Card.Content>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={styles.actionIcon}
        />
        <Text variant="titleMedium">{title}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => router.push(route)}>View</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text variant="headlineMedium" style={styles.welcome}>
        Welcome back, {user?.email}
      </Text>

      <View style={styles.metricsContainer}>
        {renderMetricCard('Current Consumption', `${metrics.currentConsumption} kWh`, 'lightning-bolt')}
        {renderMetricCard('Monthly Savings', `₹${metrics.savings}`, 'currency-inr')}
        {renderMetricCard('Carbon Offset', `${metrics.carbonOffset} kg`, 'leaf')}
        {renderMetricCard('Target Progress', `${Math.round((metrics.currentConsumption / metrics.targetConsumption) * 100)}%`, 'target')}
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text variant="titleMedium">Consumption Trend</Text>
            <View style={styles.timeRangeButtons}>
              {['week', 'month', 'year'].map((range) => (
                <Button
                  key={range}
                  mode="text"
                  onPress={() => setTimeRange(range)}
                  style={[
                    styles.timeRangeButton,
                    timeRange === range ? styles.activeTimeRange : styles.inactiveTimeRange,
                  ]}
                  labelStyle={timeRange === range ? styles.activeTimeRangeText : styles.inactiveTimeRangeText}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </View>
          </View>
          <LineChart
            data={consumptionData}
            width={width - 64}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        {renderQuickAction('Get Quote', 'calculator', '/(customer)/quote')}
        {renderQuickAction('My Projects', 'solar-power', '/(customer)/projects')}
        {renderQuickAction('Digital Wallet', 'wallet', '/(customer)/wallet')}
        {renderQuickAction('Support', 'help-circle', '/(customer)/support')}
      </View>

      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>Consumption Target</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressLabel}>
              <Text style={styles.progressText}>Current: {metrics.currentConsumption} kWh</Text>
              <Text style={styles.progressText}>Target: {metrics.targetConsumption} kWh</Text>
            </View>
            <ProgressBar
              progress={metrics.currentConsumption / metrics.targetConsumption}
              color={theme.colors.primary}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
} 