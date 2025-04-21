import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for payments
const mockPayments = [
  {
    id: '1',
    user: 'John Doe',
    amount: 50000,
    method: 'Credit Card',
    status: 'Completed',
    date: '2024-03-24',
    reference: 'PAY-2024-001',
  },
  {
    id: '2',
    user: 'Bob Johnson',
    amount: 75000,
    method: 'UPI',
    status: 'Pending',
    date: '2024-03-23',
    reference: 'PAY-2024-002',
  },
  {
    id: '3',
    user: 'Sarah Williams',
    amount: 25000,
    method: 'Net Banking',
    status: 'Failed',
    date: '2024-03-22',
    reference: 'PAY-2024-003',
  },
  {
    id: '4',
    user: 'David Miller',
    amount: 100000,
    method: 'Wallet',
    status: 'Refunded',
    date: '2024-03-21',
    reference: 'PAY-2024-004',
  },
];

export default function PaymentsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPayments, setFilteredPayments] = useState(mockPayments);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
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
    const filtered = mockPayments.filter(payment =>
      payment.user.toLowerCase().includes(query.toLowerCase()) ||
      payment.reference.toLowerCase().includes(query.toLowerCase()) ||
      payment.method.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return theme.colors.secondary;
      case 'pending':
        return theme.colors.tertiary;
      case 'failed':
        return theme.colors.error;
      case 'refunded':
        return theme.colors.primary;
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
      case 'refunded':
        return '#2196F333'; // Primary color with 20% opacity
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

  const openMenu = (payment: any) => {
    setSelectedPayment(payment);
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
        <Text variant="headlineMedium">Payment Processing</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Manage payment transactions and reconciliation
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search payments..."
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
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Amount</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Method</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Date</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredPayments.map((payment) => (
                <DataTable.Row key={payment.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{payment.user}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{formatCurrency(payment.amount)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{payment.method}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(payment.status) }}
                      style={[styles.chip, { backgroundColor: getStatusBackgroundColor(payment.status) }]}
                    >
                      {payment.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{payment.date}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(payment)}
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
          <Menu.Item onPress={() => handleAction('refund')} title="Process Refund" />
          <Menu.Item onPress={() => handleAction('reconcile')} title="Reconcile" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedPayment?.reference || 'this payment'}?
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