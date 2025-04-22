import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, Button, List, Chip, SegmentedButtons, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data - Replace with actual data from your backend
const TRANSACTIONS = [
  {
    id: '1',
    type: 'credit',
    amount: 5000,
    description: 'Referral Bonus',
    date: '2024-03-15',
    status: 'completed',
  },
  {
    id: '2',
    type: 'debit',
    amount: 2000,
    description: 'Bill Payment',
    date: '2024-03-10',
    status: 'completed',
  },
  {
    id: '3',
    type: 'credit',
    amount: 1500,
    description: 'Cashback',
    date: '2024-03-05',
    status: 'completed',
  },
  {
    id: '4',
    type: 'pending',
    amount: 3000,
    description: 'Referral Bonus',
    date: '2024-03-01',
    status: 'pending',
  },
];

export default function WalletScreen() {
  const theme = useTheme();
  const [transactionFilter, setTransactionFilter] = useState('all');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
    },
    balanceCard: {
      marginBottom: 24,
    },
    balanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    balanceIcon: {
      marginRight: 8,
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginVertical: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 8,
    },
    filterButtons: {
      marginBottom: 16,
    },
    transactionDate: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    creditAmount: {
      color: theme.colors.primary,
    },
    debitAmount: {
      color: theme.colors.error,
    },
    pendingAmount: {
      color: theme.colors.secondary,
    },
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return 'arrow-down-circle';
      case 'debit':
        return 'arrow-up-circle';
      case 'pending':
        return 'clock';
      default:
        return 'circle';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return theme.colors.primary;
      case 'debit':
        return theme.colors.error;
      case 'pending':
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const formatAmount = (amount: number, type: string) => {
    return `${type === 'debit' ? '-' : '+'}₹${amount.toLocaleString()}`;
  };

  const filteredTransactions = TRANSACTIONS.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Wallet</Text>

        <Card style={styles.balanceCard}>
          <Card.Content>
            <View style={styles.balanceHeader}>
              <MaterialCommunityIcons
                name="wallet"
                size={24}
                color={theme.colors.primary}
                style={styles.balanceIcon}
              />
              <Text variant="titleMedium">Available Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>₹4,500</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Last updated: Today, 10:30 AM
            </Text>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="bank-transfer"
                onPress={() => {}}
                style={{ flex: 1 }}
              >
                Withdraw
              </Button>
              <Button
                mode="contained-tonal"
                icon="share"
                onPress={() => {}}
                style={{ flex: 1 }}
              >
                Share
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={{ marginBottom: 16 }}>Transaction History</Text>
        
        <SegmentedButtons
          value={transactionFilter}
          onValueChange={setTransactionFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'credit', label: 'Credits' },
            { value: 'debit', label: 'Debits' },
          ]}
          style={styles.filterButtons}
        />

        <Card>
          <Card.Content>
            {filteredTransactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <List.Item
                  title={transaction.description}
                  description={transaction.date}
                  left={props => (
                    <MaterialCommunityIcons
                      {...props}
                      name={getTransactionIcon(transaction.type)}
                      size={24}
                      color={getTransactionColor(transaction.type)}
                    />
                  )}
                  right={props => (
                    <Text
                      {...props}
                      style={[
                        styles.transactionAmount,
                        transaction.type === 'credit' && styles.creditAmount,
                        transaction.type === 'debit' && styles.debitAmount,
                        transaction.type === 'pending' && styles.pendingAmount,
                      ]}
                    >
                      {formatAmount(transaction.amount, transaction.type)}
                    </Text>
                  )}
                />
                <Divider />
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 