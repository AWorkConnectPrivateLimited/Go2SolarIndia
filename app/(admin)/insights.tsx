import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Portal, Dialog, Searchbar, useTheme, TextInput, SegmentedButtons, Divider, List, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for AI insights
const mockInsights = [
  {
    id: '1',
    title: 'Energy Consumption Pattern',
    description: 'Customers in residential areas show 15% higher energy consumption during evening hours (6-9 PM)',
    category: 'Energy Analysis',
    impact: 'High',
    recommendation: 'Consider time-of-day pricing to encourage off-peak usage',
    date: '2024-03-24',
    confidence: 0.92,
  },
  {
    id: '2',
    title: 'Customer Churn Risk',
    description: '5 customers show signs of potential churn based on reduced engagement and payment delays',
    category: 'Customer Behavior',
    impact: 'Medium',
    recommendation: 'Proactively reach out with personalized offers and support',
    date: '2024-03-23',
    confidence: 0.85,
  },
  {
    id: '3',
    title: 'Installation Efficiency',
    description: 'Installation teams in the northern region complete projects 20% faster than the national average',
    category: 'Operations',
    impact: 'High',
    recommendation: 'Analyze and replicate best practices from northern teams across other regions',
    date: '2024-03-22',
    confidence: 0.88,
  },
  {
    id: '4',
    title: 'Maintenance Prediction',
    description: 'Solar panels in coastal areas may require maintenance 2 months earlier than inland installations',
    category: 'Predictive Maintenance',
    impact: 'Medium',
    recommendation: 'Schedule proactive maintenance for coastal installations',
    date: '2024-03-21',
    confidence: 0.78,
  },
];

// Mock data for trend analysis
const mockTrends = [
  {
    id: '1',
    name: 'Customer Acquisition',
    current: 120,
    previous: 95,
    change: '+26.3%',
    trend: 'up',
  },
  {
    id: '2',
    name: 'Energy Generation',
    current: 4500,
    previous: 4200,
    change: '+7.1%',
    trend: 'up',
  },
  {
    id: '3',
    name: 'Service Requests',
    current: 45,
    previous: 52,
    change: '-13.5%',
    trend: 'down',
  },
  {
    id: '4',
    name: 'Customer Satisfaction',
    current: 4.7,
    previous: 4.5,
    change: '+4.4%',
    trend: 'up',
  },
];

export default function InsightsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInsights, setFilteredInsights] = useState(mockInsights);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockInsights.filter(insight =>
      insight.title.toLowerCase().includes(query.toLowerCase()) ||
      insight.description.toLowerCase().includes(query.toLowerCase()) ||
      insight.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredInsights(filtered);
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.tertiary;
      case 'low':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'energy analysis':
        return theme.colors.primary;
      case 'customer behavior':
        return theme.colors.secondary;
      case 'operations':
        return theme.colors.tertiary;
      case 'predictive maintenance':
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

  const openInsightDialog = (insight: any) => {
    setSelectedInsight(insight);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
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
    insightCard: {
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    confidenceBar: {
      height: 8,
      borderRadius: 4,
      marginTop: 8,
    },
    trendCard: {
      marginBottom: getResponsiveSize(12, 16, 20),
    },
    trendValue: {
      fontSize: getFontSize(18),
      fontWeight: 'bold',
    },
    trendChange: {
      fontSize: getFontSize(14),
    },
    trendUp: {
      color: theme.colors.primary,
    },
    trendDown: {
      color: theme.colors.error,
    },
    dialogActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    insightTitle: {
      fontSize: getFontSize(16),
      fontWeight: 'bold',
      marginBottom: 4,
    },
    insightDescription: {
      fontSize: getFontSize(14),
      marginBottom: 8,
    },
    insightMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    insightDate: {
      fontSize: getFontSize(12),
      color: theme.colors.onSurfaceVariant,
    },
    insightRecommendation: {
      fontSize: getFontSize(14),
      fontStyle: 'italic',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium">AI Insights</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            AI-generated insights and recommendations
          </Text>
        </View>
        <Button 
          mode="outlined" 
          onPress={() => console.log('Refresh insights')}
          icon="refresh"
        >
          Refresh
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search insights..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />
        
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'day', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ]}
          style={{ marginBottom: 16 }}
        />
      </View>

      <Card style={styles.card}>
        <Card.Title title="Key Trends" />
        <Card.Content>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {mockTrends.map((trend) => (
              <Card key={trend.id} style={[styles.trendCard, { width: isSmallScreen ? '100%' : '48%' }]}>
                <Card.Content>
                  <Text style={{ fontSize: getFontSize(14), color: theme.colors.onSurfaceVariant }}>{trend.name}</Text>
                  <Text style={styles.trendValue}>{trend.current}</Text>
                  <Text style={[styles.trendChange, trend.trend === 'up' ? styles.trendUp : styles.trendDown]}>
                    {trend.change} vs previous period
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="AI-Generated Insights" />
        <Card.Content>
          {filteredInsights.map((insight) => (
            <Card key={insight.id} style={styles.insightCard} onPress={() => openInsightDialog(insight)}>
              <Card.Content>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                
                <View style={styles.insightMeta}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <Chip
                      textStyle={{ color: getCategoryColor(insight.category) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getCategoryColor(insight.category)) }]}
                    >
                      {insight.category}
                    </Chip>
                    <Chip
                      textStyle={{ color: getImpactColor(insight.impact) }}
                      style={[styles.chip, { backgroundColor: getBackgroundColor(getImpactColor(insight.impact)) }]}
                    >
                      {insight.impact} Impact
                    </Chip>
                  </View>
                  <Text style={styles.insightDate}>{insight.date}</Text>
                </View>
                
                <View>
                  <Text style={{ fontSize: getFontSize(12) }}>AI Confidence: {Math.round(insight.confidence * 100)}%</Text>
                  <ProgressBar
                    progress={insight.confidence}
                    color={theme.colors.primary}
                    style={styles.confidenceBar}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog} style={{ width: '90%', maxWidth: 500 }}>
          {selectedInsight && (
            <>
              <Dialog.Title>{selectedInsight.title}</Dialog.Title>
              <Dialog.Content>
                <Text style={{ marginBottom: 16 }}>{selectedInsight.description}</Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                  <Chip
                    textStyle={{ color: getCategoryColor(selectedInsight.category) }}
                    style={[styles.chip, { backgroundColor: getBackgroundColor(getCategoryColor(selectedInsight.category)) }]}
                  >
                    {selectedInsight.category}
                  </Chip>
                  <Chip
                    textStyle={{ color: getImpactColor(selectedInsight.impact) }}
                    style={[styles.chip, { backgroundColor: getBackgroundColor(getImpactColor(selectedInsight.impact)) }]}
                  >
                    {selectedInsight.impact} Impact
                  </Chip>
                </View>
                
                <Divider style={{ marginVertical: 16 }} />
                
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Recommendation</Text>
                <Text style={{ marginBottom: 16 }}>{selectedInsight.recommendation}</Text>
                
                <View>
                  <Text style={{ fontSize: getFontSize(12) }}>AI Confidence: {Math.round(selectedInsight.confidence * 100)}%</Text>
                  <ProgressBar
                    progress={selectedInsight.confidence}
                    color={theme.colors.primary}
                    style={styles.confidenceBar}
                  />
                </View>
              </Dialog.Content>
              <Dialog.Actions style={styles.dialogActions}>
                <Button onPress={closeDialog}>Close</Button>
                <Button 
                  mode="contained" 
                  onPress={() => console.log('Take action on insight:', selectedInsight.id)}
                >
                  Take Action
                </Button>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
      </Portal>
    </ScrollView>
  );
} 