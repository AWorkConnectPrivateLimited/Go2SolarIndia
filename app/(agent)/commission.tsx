import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, ProgressBar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AgentCommission() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    card: {
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    value: {
      fontSize: 16,
      fontWeight: '500',
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
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    transactionDate: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
  });

  // Mock data for commission
  const commissionData = {
    totalEarnings: 12500,
    monthlyEarnings: 3500,
    pendingEarnings: 1200,
    nextPayout: '2023-05-15',
    targetProgress: 0.75,
    monthlyTarget: 5000,
    currentProgress: 3750,
  };

  // Mock data for recent transactions
  const recentTransactions = [
    { id: 1, title: 'Solar Installation Commission', date: '2023-04-20', amount: 1500 },
    { id: 2, title: 'Digital Solar Referral', date: '2023-04-18', amount: 500 },
    { id: 3, title: 'Service Commission', date: '2023-04-15', amount: 300 },
    { id: 4, title: 'Installation Bonus', date: '2023-04-10', amount: 1000 },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Commission Dashboard</Text>
        <Text style={styles.subtitle}>Track your earnings and performance</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Earnings Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Earnings</Text>
            <Text style={styles.value}>₹{commissionData.totalEarnings}</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Earnings</Text>
            <Text style={styles.value}>₹{commissionData.monthlyEarnings}</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.row}>
            <Text style={styles.label}>Pending Earnings</Text>
            <Text style={styles.value}>₹{commissionData.pendingEarnings}</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.row}>
            <Text style={styles.label}>Next Payout</Text>
            <Text style={styles.value}>{commissionData.nextPayout}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Target</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.progressContainer}>
              <View style={styles.progressLabel}>
                <Text style={styles.progressText}>Progress: ₹{commissionData.currentProgress} / ₹{commissionData.monthlyTarget}</Text>
                <Text style={styles.progressText}>{Math.round(commissionData.targetProgress * 100)}%</Text>
              </View>
              <ProgressBar 
                progress={commissionData.targetProgress} 
                color={theme.colors.primary} 
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Card style={styles.card}>
          <Card.Content>
            {recentTransactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <View style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <Text style={styles.transactionAmount}>₹{transaction.amount}</Text>
                </View>
                {transaction.id !== recentTransactions.length && <Divider style={{ marginVertical: 8 }} />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 