import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { router } from 'expo-router';

export default function QuoteScreen() {
  const [billAmount, setBillAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState<{
    systemSize: number;
    estimatedCost: number;
    annualSavings: number;
    paybackPeriod: number;
  } | null>(null);

  const calculateQuote = () => {
    if (!billAmount || isNaN(Number(billAmount)) || Number(billAmount) <= 0) {
      setError('Please enter a valid bill amount');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simple calculation for demonstration
    // In a real app, this would call an API with more complex calculations
    const amount = Number(billAmount);
    const systemSize = Math.ceil(amount / 1000); // kW
    const costPerKw = 75000; // ₹75,000 per kW
    const estimatedCost = systemSize * costPerKw;
    const annualSavings = amount * 12 * 0.8; // 80% savings
    const paybackPeriod = estimatedCost / annualSavings;
    
    setQuote({
      systemSize,
      estimatedCost,
      annualSavings,
      paybackPeriod,
    });
    
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Solar Quote Calculator</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Enter Your Monthly Electricity Bill</Text>
          <TextInput
            label="Bill Amount (₹)"
            value={billAmount}
            onChangeText={setBillAmount}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            disabled={loading}
          />
          
          {error ? (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          ) : null}
          
          <Button
            mode="contained"
            onPress={calculateQuote}
            loading={loading}
            style={styles.button}
            disabled={loading}
          >
            Calculate Quote
          </Button>
        </Card.Content>
      </Card>
      
      {quote && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.quoteTitle}>Your Solar Quote</Text>
            
            <View style={styles.quoteItem}>
              <Text variant="titleMedium">System Size</Text>
              <Text variant="bodyLarge">{quote.systemSize} kW</Text>
            </View>
            
            <View style={styles.quoteItem}>
              <Text variant="titleMedium">Estimated Cost</Text>
              <Text variant="bodyLarge">₹{quote.estimatedCost.toLocaleString()}</Text>
            </View>
            
            <View style={styles.quoteItem}>
              <Text variant="titleMedium">Annual Savings</Text>
              <Text variant="bodyLarge">₹{quote.annualSavings.toLocaleString()}</Text>
            </View>
            
            <View style={styles.quoteItem}>
              <Text variant="titleMedium">Payback Period</Text>
              <Text variant="bodyLarge">{quote.paybackPeriod.toFixed(1)} years</Text>
            </View>
            
            <Button
              mode="contained"
              onPress={() => router.push('/(customer)/projects')}
              style={styles.button}
            >
              Proceed with Installation
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  quoteTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  quoteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
}); 