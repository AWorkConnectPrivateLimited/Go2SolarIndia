import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Text, useTheme, Divider, List, Chip, IconButton, ActivityIndicator, Button, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { supabase } from '../../src/services/supabase/client';
import { router } from 'expo-router';
import { format } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  type: 'alert' | 'update' | 'promotion';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: {
    [key: string]: any;
  };
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'alert' | 'update' | 'promotion'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications from Supabase
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update notification read status
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update all notifications read status
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
    
    // Mark as read if not already read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const handleActionPress = () => {
    if (!selectedNotification) return;
    
    setShowNotificationModal(false);
    
    // Navigate based on notification type and data
    if (selectedNotification.type === 'alert' && selectedNotification.data?.project_id) {
      router.push(`/(customer)/projects/${selectedNotification.data.project_id}`);
    } else if (selectedNotification.type === 'update' && selectedNotification.data?.service_request_id) {
      router.push(`/(customer)/service-requests/${selectedNotification.data.service_request_id}`);
    } else if (selectedNotification.type === 'promotion' && selectedNotification.data?.promotion_id) {
      router.push(`/(customer)/promotions/${selectedNotification.data.promotion_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return 'alert-circle';
      case 'update':
        return 'information';
      case 'promotion':
        return 'tag';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert':
        return theme.colors.error;
      case 'update':
        return theme.colors.primary;
      case 'promotion':
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
    }
  };

  const getActionButtonText = (type: string) => {
    switch (type) {
      case 'alert':
        return 'View Details';
      case 'update':
        return 'View Service Request';
      case 'promotion':
        return 'View Offer';
      default:
        return 'View';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === filter);

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

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
    filterContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    filterChip: {
      marginRight: 8,
    },
    notificationItem: {
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: 'hidden',
    },
    notificationItemUnread: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    notificationTitle: {
      flex: 1,
      marginRight: 8,
    },
    notificationTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    notificationContent: {
      padding: 12,
    },
    notificationMessage: {
      marginBottom: 8,
    },
    notificationFooter: {
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
    modalMessage: {
      marginBottom: 16,
    },
    modalTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
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
        <Text variant="headlineMedium">Notifications</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Stay updated with your solar projects and offers
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={filter === 'alert'}
          onPress={() => setFilter('alert')}
          style={styles.filterChip}
          icon="alert-circle"
        >
          Alerts
        </Chip>
        <Chip
          selected={filter === 'update'}
          onPress={() => setFilter('update')}
          style={styles.filterChip}
          icon="information"
        >
          Updates
        </Chip>
        <Chip
          selected={filter === 'promotion'}
          onPress={() => setFilter('promotion')}
          style={styles.filterChip}
          icon="tag"
        >
          Offers
        </Chip>
      </View>

      {unreadCount > 0 && (
        <Button 
          mode="outlined" 
          onPress={markAllAsRead}
          style={{ marginBottom: 16 }}
          icon="check-all"
        >
          Mark all as read
        </Button>
      )}

      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
          <Pressable 
            key={notification.id} 
            onPress={() => handleNotificationPress(notification)}
          >
            <View 
              style={[
                styles.notificationItem,
                !notification.is_read && styles.notificationItemUnread
              ]}
            >
              <View style={styles.notificationHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons 
                    name={getNotificationIcon(notification.type)} 
                    size={20} 
                    color={getNotificationColor(notification.type)} 
                    style={{ marginRight: 8 }}
                  />
                  <Text 
                    variant="titleMedium" 
                    style={styles.notificationTitle}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>
                </View>
                <Text style={styles.notificationTime}>
                  {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                </Text>
              </View>
              <View style={styles.notificationContent}>
                <Text 
                  variant="bodyMedium" 
                  style={styles.notificationMessage}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>
              </View>
              <View style={styles.notificationFooter}>
                <Chip 
                  icon={getNotificationIcon(notification.type)}
                  textStyle={{ color: getNotificationColor(notification.type) }}
                >
                  {notification.type === 'alert' ? 'Alert' : 
                   notification.type === 'update' ? 'Update' : 'Offer'}
                </Chip>
                <IconButton 
                  icon="chevron-right" 
                  size={20} 
                />
              </View>
            </View>
          </Pressable>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="bell-off" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
            style={styles.emptyIcon}
          />
          <Text variant="titleMedium" style={styles.emptyText}>
            No notifications found
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            {filter === 'all' 
              ? 'You don\'t have any notifications yet.' 
              : `You don't have any ${filter === 'alert' ? 'alerts' : filter === 'update' ? 'updates' : 'offers'} yet.`}
          </Text>
        </View>
      )}

      <Portal>
        <Modal
          visible={showNotificationModal}
          onDismiss={() => setShowNotificationModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedNotification && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <MaterialCommunityIcons 
                  name={getNotificationIcon(selectedNotification.type)} 
                  size={24} 
                  color={getNotificationColor(selectedNotification.type)} 
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
              </View>
              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
              <Text style={styles.modalTime}>
                {format(new Date(selectedNotification.created_at), 'MMMM d, yyyy h:mm a')}
              </Text>
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowNotificationModal(false)}
                >
                  Close
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleActionPress}
                >
                  {getActionButtonText(selectedNotification.type)}
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
} 