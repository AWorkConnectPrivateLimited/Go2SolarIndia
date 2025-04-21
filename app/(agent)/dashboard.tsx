import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { RootState } from '../../src/store';

export default function AgentDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.welcome}>
        Welcome, Agent {user?.email}
      </Text>
      
      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Customers</Text>
            <Text variant="bodyMedium">Manage your customer list</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(agent)/customers')}>View Customers</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Tasks</Text>
            <Text variant="bodyMedium">View and manage your tasks</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(agent)/tasks')}>View Tasks</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Reports</Text>
            <Text variant="bodyMedium">Generate and view reports</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(agent)/reports')}>View Reports</Button>
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