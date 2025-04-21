import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { router } from 'expo-router';

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    name: 'Home Solar System',
    type: 'physical',
    status: 'installation',
    capacity: 5,
    estimatedCost: 375000,
    installationDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'Digital Solar Investment',
    type: 'digital',
    status: 'active',
    capacity: 2,
    estimatedCost: 150000,
    installationDate: '2023-05-01',
  },
];

export default function ProjectsScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quote':
        return 'info';
      case 'confirmed':
        return 'warning';
      case 'installation':
        return 'primary';
      case 'active':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'quote':
        return 'Quote';
      case 'confirmed':
        return 'Confirmed';
      case 'installation':
        return 'Installation';
      case 'active':
        return 'Active';
      default:
        return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>My Solar Projects</Text>
      
      {mockProjects.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              You don't have any solar projects yet.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(customer)/quote')}
              style={styles.button}
            >
              Get a Quote
            </Button>
          </Card.Content>
        </Card>
      ) : (
        mockProjects.map((project) => (
          <Card key={project.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleLarge">{project.name}</Text>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getStatusColor(project.status) }}
                  style={styles.chip}
                >
                  {getStatusLabel(project.status)}
                </Chip>
              </View>
              
              <View style={styles.details}>
                <Text variant="bodyMedium">
                  <Text style={styles.label}>Type:</Text> {project.type === 'physical' ? 'Physical Solar' : 'Digital Solar'}
                </Text>
                <Text variant="bodyMedium">
                  <Text style={styles.label}>Capacity:</Text> {project.capacity} kW
                </Text>
                <Text variant="bodyMedium">
                  <Text style={styles.label}>Cost:</Text> ₹{project.estimatedCost.toLocaleString()}
                </Text>
                <Text variant="bodyMedium">
                  <Text style={styles.label}>Installation Date:</Text> {project.installationDate}
                </Text>
              </View>
              
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.button}
              >
                View Details
              </Button>
            </Card.Content>
          </Card>
        ))
      )}
      
      <Button
        mode="outlined"
        onPress={() => router.push('/(customer)/quote')}
        style={styles.addButton}
      >
        Add New Project
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chip: {
    marginLeft: 10,
  },
  details: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
  },
}); 