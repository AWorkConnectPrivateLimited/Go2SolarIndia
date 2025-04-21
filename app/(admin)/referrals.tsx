import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Chip, IconButton, Menu, Portal, Dialog, Searchbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for referrals
const mockReferrals = [
  {
    id: '1',
    referrer: 'John Doe',
    referred: 'Jane Smith',
    status: 'Completed',
    reward: 1000,
    date: '2024-03-24',
    project: 'Home Solar System',
  },
  {
    id: '2',
    referrer: 'Bob Johnson',
    referred: 'Alice Brown',
    status: 'Pending',
    reward: 750,
    date: '2024-03-23',
    project: 'Commercial Solar',
  },
  {
    id: '3',
    referrer: 'Sarah Williams',
    referred: 'Mike Davis',
    status: 'Failed',
    reward: 500,
    date: '2024-03-22',
    project: 'Community Solar',
  },
  {
    id: '4',
    referrer: 'David Miller',
    referred: 'Emily Wilson',
    status: 'In Progress',
    reward: 1000,
    date: '2024-03-21',
    project: 'Industrial Solar',
  },
];

export default function ReferralsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReferrals, setFilteredReferrals] = useState(mockReferrals);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
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
    const filtered = mockReferrals.filter(referral =>
      referral.referrer.toLowerCase().includes(query.toLowerCase()) ||
      referral.referred.toLowerCase().includes(query.toLowerCase()) ||
      referral.project.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredReferrals(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return theme.colors.secondary;
      case 'pending':
        return theme.colors.tertiary;
      case 'failed':
        return theme.colors.error;
      case 'in progress':
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
      case 'in progress':
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

  const openMenu = (referral: any) => {
    setSelectedReferral(referral);
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
        <Text variant="headlineMedium">Referral Program</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Manage referral system and rewards
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search referrals..."
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
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Referrer</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Referred</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Status</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Reward</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Date</Text></DataTable.Title>
                <DataTable.Title style={styles.tableCell}><Text style={styles.tableText}>Actions</Text></DataTable.Title>
              </DataTable.Header>

              {filteredReferrals.map((referral) => (
                <DataTable.Row key={referral.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{referral.referrer}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{referral.referred}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Chip
                      textStyle={{ color: getStatusColor(referral.status) }}
                      style={[styles.chip, { backgroundColor: getStatusBackgroundColor(referral.status) }]}
                    >
                      {referral.status}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{formatCurrency(referral.reward)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{referral.date}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => openMenu(referral)}
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
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Referral" />
          <Menu.Item onPress={() => handleAction('process')} title="Process Reward" />
          <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to perform this action on {selectedReferral?.referrer || 'this referral'}?
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