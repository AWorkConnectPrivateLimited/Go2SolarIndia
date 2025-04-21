import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Divider, Avatar, useTheme, TextInput, Portal, Dialog, Menu } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';

// Mock data for ticket details
const mockTickets = [
  {
    id: '1',
    title: 'Solar Panel Not Generating Power',
    description: 'The solar panel system installed last week is not generating any power. The inverter shows an error code E03.',
    category: 'Technical Issue',
    status: 'In Progress',
    priority: 'High',
    customer: {
      id: '101',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 9876543210',
    },
    assignedTo: {
      id: '201',
      name: 'John Smith',
      role: 'Installation Technician',
    },
    createdAt: '2024-03-20T10:30:00Z',
    updatedAt: '2024-03-24T14:45:00Z',
    project: {
      id: '301',
      name: 'Residential Solar Installation - Mumbai',
      type: 'Physical Solar',
    },
    comments: [
      {
        id: '401',
        author: {
          id: '201',
          name: 'John Smith',
          role: 'Installation Technician',
        },
        content: 'Initial assessment completed. The issue appears to be with the inverter connection. Scheduled a visit tomorrow.',
        timestamp: '2024-03-20T11:45:00Z',
      },
      {
        id: '402',
        author: {
          id: '101',
          name: 'Rahul Sharma',
          role: 'Customer',
        },
        content: 'Thank you for the update. Please let me know when you arrive tomorrow.',
        timestamp: '2024-03-20T12:30:00Z',
      },
      {
        id: '403',
        author: {
          id: '201',
          name: 'John Smith',
          role: 'Installation Technician',
        },
        content: 'On-site inspection completed. Found a loose connection in the inverter. Fixed the issue and system is now generating power normally.',
        timestamp: '2024-03-21T15:20:00Z',
      },
    ],
    attachments: [
      {
        id: '501',
        name: 'error_log.pdf',
        type: 'application/pdf',
        size: '245 KB',
      },
      {
        id: '502',
        name: 'inverter_photo.jpg',
        type: 'image/jpeg',
        size: '1.2 MB',
      },
    ],
    history: [
      {
        id: '601',
        action: 'Ticket Created',
        user: 'System',
        timestamp: '2024-03-20T10:30:00Z',
      },
      {
        id: '602',
        action: 'Assigned to John Smith',
        user: 'Support Admin',
        timestamp: '2024-03-20T10:35:00Z',
      },
      {
        id: '603',
        action: 'Status Changed to In Progress',
        user: 'John Smith',
        timestamp: '2024-03-20T11:45:00Z',
      },
      {
        id: '604',
        action: 'Comment Added',
        user: 'Rahul Sharma',
        timestamp: '2024-03-20T12:30:00Z',
      },
      {
        id: '605',
        action: 'Comment Added',
        user: 'John Smith',
        timestamp: '2024-03-21T15:20:00Z',
      },
    ],
  },
  // Additional mock tickets can be added here
];

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const { width } = useWindowDimensions();
  const theme = useTheme();

  // Calculate responsive sizes
  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 768;
  const isLargeScreen = width >= 768;

  const getResponsiveSize = (small: number, medium: number, large: number) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  const getFontSize = (size: number) => {
    const baseSize = getResponsiveSize(size * 0.8, size, size * 1.2);
    return Math.round(baseSize);
  };

  useEffect(() => {
    // In a real app, this would fetch the ticket data from an API
    const foundTicket = mockTickets.find(t => t.id === id);
    setTicket(foundTicket || null);
  }, [id]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical issue':
        return theme.colors.primary;
      case 'billing':
        return theme.colors.secondary;
      case 'installation':
        return theme.colors.tertiary;
      case 'maintenance':
        return '#FF9800';
      default:
        return theme.colors.outline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return theme.colors.primary;
      case 'in progress':
        return theme.colors.secondary;
      case 'resolved':
        return '#4CAF50';
      case 'closed':
        return theme.colors.outline;
      default:
        return theme.colors.outline;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return '#FF9800';
      case 'low':
        return theme.colors.primary;
      default:
        return theme.colors.outline;
    }
  };

  const getBackgroundColor = (color: string) => {
    // Convert hex to rgba with 20% opacity
    if (color.startsWith('#')) {
      return color + '33'; // 33 is hex for 20% opacity
    }
    return color;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const openMenu = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleAction = (action: string) => {
    setDialogAction(action);
    setDialogVisible(true);
    closeMenu();
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const handleSubmitComment = () => {
    if (newComment.trim() === '') return;
    
    // In a real app, this would send the comment to an API
    console.log('Submitting comment:', newComment);
    setNewComment('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: getResponsiveSize(12, 16, 20),
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    headerTitle: {
      flex: 1,
    },
    ticketId: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    card: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    sectionTitle: {
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: getResponsiveSize(8, 12, 16),
    },
    infoLabel: {
      width: getResponsiveSize(100, 120, 140),
      color: theme.colors.onSurfaceVariant,
    },
    infoValue: {
      flex: 1,
    },
    commentContainer: {
      marginBottom: getResponsiveSize(16, 20, 24),
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    commentAuthor: {
      marginLeft: 8,
      flex: 1,
    },
    commentContent: {
      marginLeft: 48,
      marginBottom: 16,
    },
    commentInput: {
      marginTop: 16,
    },
    attachmentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    attachmentIcon: {
      marginRight: 8,
    },
    historyItem: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    historyTime: {
      width: getResponsiveSize(100, 120, 140),
      color: theme.colors.onSurfaceVariant,
    },
    historyAction: {
      flex: 1,
    },
    avatar: {
      backgroundColor: theme.colors.primary,
    },
  });

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Text>Loading ticket details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text variant="headlineMedium">{ticket.title}</Text>
          <Text variant="bodyMedium" style={styles.ticketId}>Ticket #{ticket.id}</Text>
        </View>
        <IconButton
          icon="dots-vertical"
          size={24}
          onPress={openMenu}
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipContainer}>
            <Chip
              textStyle={{ color: getCategoryColor(ticket.category) }}
              style={[styles.chip, { backgroundColor: getBackgroundColor(getCategoryColor(ticket.category)) }]}
            >
              {ticket.category}
            </Chip>
            <Chip
              textStyle={{ color: getStatusColor(ticket.status) }}
              style={[styles.chip, { backgroundColor: getBackgroundColor(getStatusColor(ticket.status)) }]}
            >
              {ticket.status}
            </Chip>
            <Chip
              textStyle={{ color: getPriorityColor(ticket.priority) }}
              style={[styles.chip, { backgroundColor: getBackgroundColor(getPriorityColor(ticket.priority)) }]}
            >
              {ticket.priority} Priority
            </Chip>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>{ticket.description}</Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{ticket.customer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{ticket.customer.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{ticket.customer.phone}</Text>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Project:</Text>
            <Text style={styles.infoValue}>{ticket.project.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{ticket.project.type}</Text>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>Assigned To</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Avatar.Text 
              size={40} 
              label={getInitials(ticket.assignedTo.name)} 
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12 }}>
              <Text variant="bodyLarge">{ticket.assignedTo.name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {ticket.assignedTo.role}
              </Text>
            </View>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(ticket.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(ticket.updatedAt)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Comments</Text>
          <View style={styles.commentContainer}>
            {ticket.comments.map((comment: any) => (
              <View key={comment.id}>
                <View style={styles.commentHeader}>
                  <Avatar.Text 
                    size={32} 
                    label={getInitials(comment.author.name)} 
                    style={styles.avatar}
                  />
                  <View style={styles.commentAuthor}>
                    <Text variant="bodyLarge">{comment.author.name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {comment.author.role} • {formatDate(comment.timestamp)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <Divider style={{ marginBottom: 16 }} />
              </View>
            ))}
          </View>

          <TextInput
            mode="outlined"
            label="Add a comment"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={3}
            style={styles.commentInput}
          />
          <Button 
            mode="contained" 
            onPress={handleSubmitComment}
            style={{ alignSelf: 'flex-end', marginTop: 8 }}
          >
            Submit Comment
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Attachments</Text>
          {ticket.attachments.map((attachment: any) => (
            <View key={attachment.id} style={styles.attachmentContainer}>
              <IconButton
                icon="file"
                size={20}
                style={styles.attachmentIcon}
              />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{attachment.name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {attachment.type} • {attachment.size}
                </Text>
              </View>
              <IconButton
                icon="download"
                size={20}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Ticket History</Text>
          {ticket.history.map((item: any) => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.historyTime}>{formatDate(item.timestamp)}</Text>
              <Text style={styles.historyAction}>
                <Text style={{ fontWeight: 'bold' }}>{item.action}</Text>
                {item.user !== 'System' && ` by ${item.user}`}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
        >
          <Menu.Item onPress={() => handleAction('edit')} title="Edit Ticket" />
          <Menu.Item onPress={() => handleAction('assign')} title="Reassign Ticket" />
          <Menu.Item onPress={() => handleAction('status')} title="Change Status" />
          <Menu.Item onPress={() => handleAction('priority')} title="Change Priority" />
          <Menu.Item onPress={() => handleAction('close')} title="Close Ticket" />
        </Menu>

        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to {dialogAction} this ticket?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={closeDialog}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
} 