import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { Text, useTheme, Button, Card, Divider, List, ActivityIndicator, Chip, Portal, Modal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { initializePayment, getPaymentHistory } from '../../src/services/razorpay/client';
import { format } from 'date-fns';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_id: string;
  order_id: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentsScreen() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;
      
      const { success, payments: paymentData, error } = await getPaymentHistory(user.id);
      
      if (!success) {
        console.error('Error fetching payments:', error);
        return;
      }
      
      setPayments(paymentData || []);
    } catch (error) {
      console.error('Error in fetchPayments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleMakePayment = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    try {
      setProcessingPayment(true);
      
      // Convert amount to paise (₹1 = 100 paise)
      const amountInPaise = Math.round(Number(paymentAmount) * 100);
      
      const result = await initializePayment({
        amount: amountInPaise,
        currency: 'INR',
        name: 'Go2Solar India',
        description: paymentDescription || 'Payment for Go2Solar services',
        prefill: {
          name: user?.full_name,
          email: user?.email,
          contact: user?.phone,
        },
        notes: {
          user_id: user?.id || '',
        },
      });
      
      if (result.success) {
        Alert.alert('Payment Successful', 'Your payment has been processed successfully.');
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentDescription('');
        fetchPayments(); // Refresh payment history
      } else {
        Alert.alert('Payment Failed', result.error || 'There was an error processing your payment.');
      }
    } catch (error) {
      console.error('Error making payment:', error);
      Alert.alert('Payment Error', 'An unexpected error occurred while processing your payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
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
    paymentCard: {
      marginBottom: 24,
      padding: 16,
    },
    paymentCardTitle: {
      marginBottom: 16,
    },
    paymentInput: {
      marginBottom: 16,
    },
    paymentButton: {
      marginTop: 8,
    },
    paymentHistoryTitle: {
      marginBottom: 16,
    },
    paymentItem: {
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: 'hidden',
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    paymentAmount: {
      fontWeight: 'bold',
    },
    paymentTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    paymentContent: {
      padding: 12,
    },
    paymentDescription: {
      marginBottom: 8,
    },
    paymentFooter: {
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
        <Text variant="headlineMedium">Payments</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Make payments and view your payment history
        </Text>
      </View>

      <Card style={styles.paymentCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.paymentCardTitle}>Make a Payment</Text>
          <TextInput
            label="Amount (₹)"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.paymentInput}
          />
          <TextInput
            label="Description (Optional)"
            value={paymentDescription}
            onChangeText={setPaymentDescription}
            mode="outlined"
            style={styles.paymentInput}
          />
          <Button 
            mode="contained" 
            onPress={() => setShowPaymentModal(true)}
            style={styles.paymentButton}
            icon="credit-card"
          >
            Pay Now
          </Button>
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.paymentHistoryTitle}>Payment History</Text>

      {payments.length > 0 ? (
        payments.map((payment) => (
          <View key={payment.id} style={styles.paymentItem}>
            <View style={styles.paymentHeader}>
              <Text variant="titleMedium" style={styles.paymentAmount}>
                {formatCurrency(payment.amount, payment.currency)}
              </Text>
              <Text style={styles.paymentTime}>
                {format(new Date(payment.created_at), 'MMM d, h:mm a')}
              </Text>
            </View>
            <View style={styles.paymentContent}>
              <Text variant="bodyMedium" style={styles.paymentDescription}>
                {payment.description}
              </Text>
            </View>
            <View style={styles.paymentFooter}>
              <Chip 
                icon={payment.status === 'completed' ? 'check-circle' : 
                      payment.status === 'pending' ? 'clock-outline' : 'alert-circle'}
                textStyle={{ color: getStatusColor(payment.status) }}
              >
                {getStatusText(payment.status)}
              </Chip>
              <Text variant="bodySmall">
                ID: {payment.payment_id?.substring(0, 8)}...
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="credit-card-off" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
            style={styles.emptyIcon}
          />
          <Text variant="titleMedium" style={styles.emptyText}>
            No payment history
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            You haven't made any payments yet. Use the form above to make your first payment.
          </Text>
        </View>
      )}

      <Portal>
        <Modal
          visible={showPaymentModal}
          onDismiss={() => setShowPaymentModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Confirm Payment</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            You are about to make a payment of {formatCurrency(Number(paymentAmount) * 100, 'INR')} to Go2Solar India.
          </Text>
          {paymentDescription && (
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Description: {paymentDescription}
            </Text>
          )}
          <Text variant="bodySmall" style={{ marginBottom: 24, color: theme.colors.onSurfaceVariant }}>
            You will be redirected to Razorpay's secure payment gateway to complete your transaction.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <Button 
              mode="outlined" 
              onPress={() => setShowPaymentModal(false)}
              disabled={processingPayment}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleMakePayment}
              loading={processingPayment}
              disabled={processingPayment}
            >
              Proceed to Pay
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
} 