import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, TextInput, IconButton, Surface, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data - Replace with actual chat data from your backend
const INITIAL_MESSAGES = [
  {
    id: '1',
    text: 'Hello! How can I help you today?',
    sender: 'agent',
    timestamp: '10:30 AM',
    agent: {
      name: 'Sarah',
      avatar: 'S',
    },
  },
  {
    id: '2',
    text: 'I have a question about my solar installation.',
    sender: 'user',
    timestamp: '10:31 AM',
  },
  {
    id: '3',
    text: "Of course! I'd be happy to help. Could you please provide your project ID or installation address?",
    sender: 'agent',
    timestamp: '10:31 AM',
    agent: {
      name: 'Sarah',
      avatar: 'S',
    },
  },
];

export default function ChatScreen() {
  const theme = useTheme();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    chatContainer: {
      flex: 1,
      padding: 16,
    },
    messageContainer: {
      marginBottom: 16,
      maxWidth: '80%',
    },
    agentMessage: {
      alignSelf: 'flex-start',
    },
    userMessage: {
      alignSelf: 'flex-end',
    },
    messageBubble: {
      padding: 12,
      borderRadius: 16,
      marginTop: 4,
    },
    agentBubble: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    userBubble: {
      backgroundColor: theme.colors.primary,
    },
    agentText: {
      color: theme.colors.onSurfaceVariant,
    },
    userText: {
      color: theme.colors.onPrimary,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    inputContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textInput: {
      flex: 1,
      marginRight: 8,
      backgroundColor: theme.colors.background,
    },
    agentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    agentName: {
      marginLeft: 8,
      color: theme.colors.onSurfaceVariant,
    },
  });

  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');

      // Simulate agent response
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. Our agent will respond shortly.',
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agent: {
            name: 'Sarah',
            avatar: 'S',
          },
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>Live Chat Support</Text>
        <Text style={styles.headerSubtitle}>We typically reply in a few minutes</Text>
      </Surface>

      <ScrollView style={styles.chatContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === 'agent' ? styles.agentMessage : styles.userMessage,
            ]}
          >
            {message.sender === 'agent' && message.agent && (
              <View style={styles.agentInfo}>
                <Avatar.Text size={24} label={message.agent.avatar} />
                <Text style={styles.agentName}>{message.agent.name}</Text>
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.sender === 'agent' ? styles.agentBubble : styles.userBubble,
              ]}
            >
              <Text
                style={message.sender === 'agent' ? styles.agentText : styles.userText}
              >
                {message.text}
              </Text>
            </View>
            <Text style={styles.timestamp}>{message.timestamp}</Text>
          </View>
        ))}
      </ScrollView>

      <Surface style={styles.inputContainer}>
        <View style={styles.input}>
          <TextInput
            mode="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.textInput}
            right={
              <TextInput.Icon
                icon="paperclip"
                onPress={() => {}}
              />
            }
          />
          <IconButton
            icon="send"
            mode="contained"
            onPress={handleSend}
            disabled={!newMessage.trim()}
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
} 