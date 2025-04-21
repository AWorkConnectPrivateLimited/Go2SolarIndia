import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for wallet transactions
const mockTransactions = [
  {
    id: '1',
    user: 'John Doe',
    type: 'Credit',
    amount: 1000,
    status: 'Completed',
    date: '2024-03-24',
    description: 'Energy generation credit',
  },
  {
    id: '2',
    user: 'Jane Smith',
    type: 'Debit',
    amount: 500,
    status: 'Pending',
    date: '2024-03-23',
    description: 'Bill payment',
  },
  {
    id: '3',
    user: 'Bob Johnson',
    type: 'Credit',
    amount: 750,
    status: 'Failed',
    date: '2024-03-22',
    description: 'Referral reward',
  },
  {
    id: '4',
    user: 'Alice Brown',
    type: 'Debit',
    amount: 250,
    status: 'Completed',
    date: '2024-03-21',
    description: 'Service charge',
  },
];

export default function WalletScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
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
    const filtered = mockTransactions.filter(transaction =>
      transaction.user.toLowerCase().includes(query.toLowerCase()) ||
      transaction.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return theme.colors.secondary;
      case 'debit':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getTypeBackgroundColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return '#00968833'; // Secondary color with 20% opacity (33 in hex = 20%)
      case 'debit':
        return '#F4433633'; // Error color with 20% opacity
      default:
        return '#9E9E9E33'; // Outline color with 20% opacity
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return theme.colors.secondary;
      case 'pending':
        return theme.colors.tertiary;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#00968833'; // Secondary color with 20% opacity (33 in hex = 20%)
      case 'pending':
        return '#9C27B033'; // Tertiary color with 20% opacity
      case 'failed':
        return '#F4433633'; // Error color with 20% opacity
      default:
        return '#9E9E9E33'; // Outline color with 20% opacity
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const openMenu = (transaction: any) => {
    setSelectedTransaction(transaction);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleAction = (action: string) => {
    closeMenu();
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
    header: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    searchContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    card: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    tableContainer: {
      overflow: 'scroll',
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
      fontSize: getFontSize(12),
    },
    chip: {
      marginRight: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Wallet Management</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Manage digital wallet transactions and balances
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search transactions..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>User</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Type</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Amount</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Date</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredTransactions.map((transaction) => (
                <DataTable.Row key={transaction.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{transaction.user}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getTypeColor(transaction.type) }}
                      style={[styles.chip, { backgroundColor: getTypeBackgroundColor(transaction.type) }]}
                    >
                      {transaction.type}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={[styles.tableText, { color: getTypeColor(transaction.type) }]}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(transaction.status) }}
                      style={[styles.chip, { backgroundColor: getStatusBackgroundColor(transaction.status) }]}
                    >
                      {transaction.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{transaction.date}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(transaction)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('view')} title="View Details" />
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Transaction" />
          <Menu.Item onPress={() => handleAction('reverse')} title="Reverse Transaction" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedTransaction?.user || 'this transaction'}?
            </Text>
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