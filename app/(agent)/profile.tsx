import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, Button, Divider, useTheme } from 'react-native-paper';
import { useAuth } from '../../src/hooks/useAuth';

export default function AgentProfile() {
  const theme = useTheme();
  const { user } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatar: {
      marginBottom: 16,
      backgroundColor: theme.colors.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    email: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    card: {
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    label: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    value: {
      fontSize: 16,
      fontWeight: '500',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.email?.charAt(0).toUpperCase() || 'A'} 
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.user_metadata?.full_name || 'Agent'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{user?.user_metadata?.full_name || 'Not provided'}</Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email || 'Not provided'}</Text>
            </View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{user?.phone || 'Not provided'}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              mode="outlined" 
              icon="pencil" 
              style={{ marginBottom: 8 }}
              onPress={() => {}}
            >
              Edit Profile
            </Button>
            <Button 
              mode="outlined" 
              icon="lock" 
              style={{ marginBottom: 8 }}
              onPress={() => {}}
            >
              Change Password
            </Button>
            <Button 
              mode="outlined" 
              icon="bell" 
              onPress={() => {}}
            >
              Notification Settings
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 