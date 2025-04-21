import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { RootState } from '../../src/store';

export default function CustomerDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.welcome}>
        Welcome, {user?.email}
      </Text>
      
      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Instant Quote</Text>
            <Text variant="bodyMedium">Get a quick solar quote based on your bill</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(customer)/quote')}>Get Quote</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">My Projects</Text>
            <Text variant="bodyMedium">Track your solar installations</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(customer)/projects')}>View Projects</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Digital Wallet</Text>
            <Text variant="bodyMedium">Manage your solar credits</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(customer)/wallet')}>View Wallet</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Support</Text>
            <Text variant="bodyMedium">Get help with your solar system</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(customer)/support')}>Contact Support</Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcome: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
  },
}); 