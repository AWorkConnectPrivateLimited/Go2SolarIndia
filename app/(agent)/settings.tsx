import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Switch, List, Divider, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AgentSettings() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    card: {
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    listItem: {
      paddingVertical: 8,
    },
    listItemTitle: {
      fontSize: 16,
    },
    listItemDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    buttonContainer: {
      marginTop: 24,
    },
    button: {
      marginBottom: 12,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Push Notifications"
              description="Receive alerts about new tasks and updates"
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => (
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                />
              )}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Email Updates"
              description="Receive email notifications for important updates"
              left={props => <List.Icon {...props} icon="email" />}
              right={props => (
                <Switch
                  value={emailUpdates}
                  onValueChange={setEmailUpdates}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Dark Mode"
              description="Switch between light and dark theme"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={props => (
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Location Services"
              description="Allow app to access your location"
              left={props => <List.Icon {...props} icon="map-marker" />}
              right={props => (
                <Switch
                  value={locationServices}
                  onValueChange={setLocationServices}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Change Password"
              description="Update your account password"
              left={props => <List.Icon {...props} icon="lock" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              description="Read our terms of service"
              left={props => <List.Icon {...props} icon="file-document" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          icon="cog" 
          style={styles.button}
          onPress={() => {}}
        >
          Reset to Default Settings
        </Button>
        <Button 
          mode="contained" 
          icon="content-save" 
          style={styles.button}
          onPress={() => {}}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
} 