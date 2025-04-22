import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button, TextInput, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReferScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 24,
    },
    card: {
      marginBottom: 16,
    },
    rewardSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    rewardIcon: {
      marginRight: 16,
    },
    rewardText: {
      flex: 1,
    },
    input: {
      marginBottom: 16,
    },
    shareButton: {
      marginTop: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Refer a Friend</Text>
        <Text style={styles.subtitle}>
          Share Go2Solar with your friends and earn rewards when they go solar!
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rewardSection}>
              <MaterialCommunityIcons
                name="gift"
                size={40}
                color={theme.colors.primary}
                style={styles.rewardIcon}
              />
              <View style={styles.rewardText}>
                <Text variant="titleMedium">Earn ₹5,000</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  For each friend who installs solar with us
                </Text>
              </View>
            </View>

            <TextInput
              mode="outlined"
              label="Friend's Name"
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Friend's Phone Number"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Friend's Email (Optional)"
              keyboardType="email-address"
              style={styles.input}
            />

            <Button mode="contained" onPress={() => {}} style={styles.shareButton}>
              Refer Now
            </Button>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>Share your referral code</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <TextInput
                mode="outlined"
                value="GO2SOLAR123"
                disabled
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button mode="contained-tonal" onPress={() => {}}>
                Copy
              </Button>
            </View>
            <Button
              mode="outlined"
              icon="share"
              onPress={() => {}}
            >
              Share Via WhatsApp
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
} 