import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { Text, useTheme, Button, Card, Divider, List, ActivityIndicator, Chip, Portal, Modal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { initializePayout, getPayoutHistory } from '../../src/services/razorpay/client';
import { supabase } from '../../src/services/supabase/client';
import { format } from 'date-fns';

interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference_id: string;
  created_at: string;
}

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processed' | 'failed';
  account_number: string;
  ifsc: string;
  reference_id: string;
  created_at: string;
  updated_at: string;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  last_updated: string;
  created_at: string;
}

export default function WalletScreen() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;
      
      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('digital_wallet')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (walletError) {
        console.error('Error fetching wallet:', walletError);
        
        // If wallet doesn't exist, create one
        if (walletError.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('digital_wallet')
            .insert([
              { 
                user_id: user.id, 
                balance: 0,
                last_updated: new Date().toISOString()
              }
            ])
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating wallet:', createError);
          } else {
            setWallet(newWallet);
          }
        }
      } else {
        setWallet(walletData);
        
        // Fetch wallet transactions
        const { data: transactionData, error: transactionError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false });
        
        if (transactionError) {
          console.error('Error fetching transactions:', transactionError);
        } else {
          setTransactions(transactionData || []);
        }
      }
      
      // Fetch payout history - handle case when table doesn't exist
      try {
        const { success, payouts: payoutData, error: payoutError } = await getPayoutHistory(user.id);
        
        if (!success) {
          console.error('Error fetching payouts:', payoutError);
          // Initialize empty payouts array if table doesn't exist
          if (payoutError && payoutError.includes('relation "public.payouts" does not exist')) {
            setPayouts([]);
          }
        } else {
          setPayouts(payoutData || []);
        }
      } catch (error) {
        console.error('Error in payout history:', error);
        setPayouts([]);
      }
    } catch (error) {
      console.error('Error in fetchWalletData:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleRequestPayout = async () => {
    if (!wallet) return;
    
    if (!payoutAmount || isNaN(Number(payoutAmount)) || Number(payoutAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }
    
    if (!accountNumber || accountNumber.length < 9) {
      Alert.alert('Invalid Account Number', 'Please enter a valid bank account number.');
      return;
    }
    
    if (!ifscCode || ifscCode.length < 4) {
      Alert.alert('Invalid IFSC Code', 'Please enter a valid IFSC code.');
      return;
    }
    
    if (!accountName) {
      Alert.alert('Invalid Account Name', 'Please enter the account holder name.');
      return;
    }
    
    const amountInPaise = Math.round(Number(payoutAmount) * 100);
    
    if (amountInPaise > wallet.balance) {
      Alert.alert('Insufficient Balance', 'Your wallet balance is insufficient for this payout.');
      return;
    }
    
    try {
      setProcessingPayout(true);
      
      const referenceId = `PAYOUT-${user?.id || 'unknown'}-${Date.now()}`;
      
      const result = await initializePayout({
        amount: amountInPaise,
        accountNumber,
        ifsc: ifscCode,
        name: accountName,
        purpose: 'payout',
        mode: 'IMPS',
        referenceId,
      });
      
      if (result.success) {
        Alert.alert('Payout Initiated', 'Your payout request has been submitted successfully.');
        setShowPayoutModal(false);
        setPayoutAmount('');
        setAccountNumber('');
        setIfscCode('');
        setAccountName('');
        fetchWalletData(); // Refresh wallet data
      } else {
        Alert.alert('Payout Failed', result.error || 'There was an error processing your payout request.');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      Alert.alert('Payout Error', 'An unexpected error occurred while processing your payout request.');
    } finally {
      setProcessingPayout(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return 'arrow-down-circle';
      case 'debit':
        return 'arrow-up-circle';
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
      default:
        return theme.colors.outline;
    }
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getPayoutStatusText = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Processed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Convert from paise to rupees
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    walletCard: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: theme.colors.primary,
    },
    walletCardTitle: {
      color: theme.colors.onPrimary,
      marginBottom: 8,
    },
    walletBalance: {
      color: theme.colors.onPrimary,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    walletActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    walletActionButton: {
      flex: 1,
      marginHorizontal: 4,
    },
    sectionTitle: {
      marginBottom: 16,
    },
    transactionItem: {
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: 'hidden',
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    transactionAmount: {
      fontWeight: 'bold',
    },
    transactionTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    transactionContent: {
      padding: 12,
    },
    transactionDescription: {
      marginBottom: 8,
    },
    transactionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    payoutItem: {
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: 'hidden',
    },
    payoutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    payoutAmount: {
      fontWeight: 'bold',
    },
    payoutTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    payoutContent: {
      padding: 12,
    },
    payoutDetails: {
      marginBottom: 8,
    },
    payoutFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      textAlign: 'center',
      marginBottom: 16,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      margin: 20,
      borderRadius: 8,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    modalInput: {
      marginBottom: 16,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineMedium">Digital Wallet</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Manage your solar credits and cashback
        </Text>
      </View>

      <Card style={styles.walletCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.walletCardTitle}>Available Balance</Text>
          <Text style={styles.walletBalance}>
            {formatCurrency((wallet?.balance || 0) * 100)}
          </Text>
          <View style={styles.walletActions}>
            <Button 
              mode="contained-tonal" 
              onPress={() => setShowPayoutModal(true)}
              style={[styles.walletActionButton, { marginHorizontal: 0 }]}
              icon="bank-transfer"
              disabled={!wallet || wallet.balance <= 0}
            >
              Withdraw
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.sectionTitle}>Recent Transactions</Text>

      {transactions.length > 0 ? (
        transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons 
                  name={getTransactionIcon(transaction.type)} 
                  size={20} 
                  color={getTransactionColor(transaction.type)} 
                  style={{ marginRight: 8 }}
                />
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.type) }
                  ]}
                >
                  {transaction.type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </Text>
              </View>
              <Text style={styles.transactionTime}>
                {format(new Date(transaction.created_at), 'MMM d, h:mm a')}
              </Text>
            </View>
            <View style={styles.transactionContent}>
              <Text variant="bodyMedium" style={styles.transactionDescription}>
                {transaction.description}
              </Text>
            </View>
            <View style={styles.transactionFooter}>
              <Text variant="bodySmall">
                Ref: {transaction.reference_id?.substring(0, 8)}...
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="wallet-outline" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
            style={styles.emptyIcon}
          />
          <Text variant="titleMedium" style={styles.emptyText}>
            No transactions yet
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Your transaction history will appear here when you make or receive payments.
          </Text>
        </View>
      )}

      <Text variant="titleLarge" style={[styles.sectionTitle, { marginTop: 24 }]}>Payout History</Text>

      {payouts.length > 0 ? (
        payouts.map((payout) => (
          <View key={payout.id} style={styles.payoutItem}>
            <View style={styles.payoutHeader}>
              <Text variant="titleMedium" style={styles.payoutAmount}>
                {formatCurrency(payout.amount, payout.currency)}
              </Text>
              <Text style={styles.payoutTime}>
                {format(new Date(payout.created_at), 'MMM d, h:mm a')}
              </Text>
            </View>
            <View style={styles.payoutContent}>
              <Text variant="bodyMedium" style={styles.payoutDetails}>
                Bank: {payout.account_number?.substring(payout.account_number.length - 4)} • IFSC: {payout.ifsc}
              </Text>
            </View>
            <View style={styles.payoutFooter}>
              <Chip 
                icon={payout.status === 'processed' ? 'check-circle' : 
                      payout.status === 'pending' ? 'clock-outline' : 'alert-circle'}
                textStyle={{ color: getPayoutStatusColor(payout.status) }}
              >
                {getPayoutStatusText(payout.status)}
              </Chip>
              <Text variant="bodySmall">
                Ref: {payout.reference_id?.substring(0, 8)}...
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="bank-transfer-out" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
            style={styles.emptyIcon}
          />
          <Text variant="titleMedium" style={styles.emptyText}>
            No payout history
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Your payout history will appear here when you withdraw funds from your wallet.
          </Text>
        </View>
      )}

      <Portal>
        <Modal
          visible={showPayoutModal}
          onDismiss={() => setShowPayoutModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Request Payout</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            Withdraw funds from your wallet to your bank account.
          </Text>
          
          <TextInput
            label="Amount (₹)"
            value={payoutAmount}
            onChangeText={setPayoutAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="IFSC Code"
            value={ifscCode}
            onChangeText={setIfscCode}
            mode="outlined"
            style={styles.modalInput}
            autoCapitalize="characters"
          />
          
          <TextInput
            label="Account Holder Name"
            value={accountName}
            onChangeText={setAccountName}
            mode="outlined"
            style={styles.modalInput}
          />
          
          <Text variant="bodySmall" style={{ marginBottom: 24, color: theme.colors.onSurfaceVariant }}>
            Your payout will be processed within 24-48 hours.
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={() => setShowPayoutModal(false)}
              disabled={processingPayout}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleRequestPayout}
              loading={processingPayout}
              disabled={processingPayout}
            >
              Request Payout
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
} 