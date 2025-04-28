import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Image, Pressable } from 'react-native';
import { Text, useTheme, TextInput, Button, Avatar, Divider, List, Switch, Portal, Modal, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { supabase } from '../../src/services/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  profile_image: string | null;
  kyc_status: 'pending' | 'verified' | 'rejected';
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile from Supabase
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          createDefaultProfile();
          return;
        }
        Alert.alert('Error', 'Failed to load profile data');
        return;
      }

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultProfile = async () => {
    try {
      const defaultProfile = {
        user_id: user?.id,
        full_name: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        profile_image: null,
        kyc_status: 'pending',
        notification_preferences: {
          email: true,
          sms: true,
          push: true,
        },
      };

      const { data, error } = await supabase
        .from('customer_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      });
    } catch (error) {
      console.error('Error creating default profile:', error);
      Alert.alert('Error', 'Failed to create profile');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh profile data
      await fetchUserProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotificationPreferences = async (key: string, value: boolean) => {
    try {
      if (!profile) return;
      
      const updatedPreferences = {
        ...profile.notification_preferences,
        [key]: value,
      };

      const { error } = await supabase
        .from('customer_profiles')
        .update({
          notification_preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setProfile({
        ...profile,
        notification_preferences: updatedPreferences,
      });
      
      Alert.alert('Success', 'Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const handleUploadProfileImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled) return;

      // Upload to Supabase Storage
      const file = {
        uri: result.assets[0].uri,
        name: `profile-${user?.id}-${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      const formData = new FormData();
      formData.append('file', file as any);

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(`${user?.id}/${file.name}`, formData);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(`${user?.id}/${file.name}`);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('customer_profiles')
        .update({
          profile_image: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // Refresh profile data
      await fetchUserProfile();
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'Failed to update profile image');
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Verification';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

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
    profileHeader: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      backgroundColor: theme.colors.primary,
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
    },
    profileName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      marginBottom: 8,
      color: theme.colors.onSurfaceVariant,
    },
    input: {
      backgroundColor: 'transparent',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 16,
    },
    kycStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: `${getKycStatusColor(profile?.kyc_status || 'pending')}20`,
    },
    kycStatusText: {
      marginLeft: 8,
      color: getKycStatusColor(profile?.kyc_status || 'pending'),
      fontWeight: 'bold',
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
    modalText: {
      marginBottom: 16,
    },
    notificationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    notificationLabel: {
      fontSize: 16,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium">My Profile</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Manage your personal information and account settings
        </Text>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {profile?.profile_image ? (
            <Avatar.Image 
              size={100} 
              source={{ uri: profile.profile_image }} 
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text 
              size={100} 
              label={profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'} 
              style={styles.avatar}
            />
          )}
          <IconButton
            icon="camera"
            size={20}
            style={styles.editAvatarButton}
            onPress={handleUploadProfileImage}
          />
        </View>
        <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
        <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        {isEditing ? (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                mode="outlined"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                mode="outlined"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                mode="outlined"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={2}
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                mode="outlined"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>State</Text>
              <TextInput
                mode="outlined"
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                mode="outlined"
                value={formData.pincode}
                onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSaveProfile}
                loading={saving}
                disabled={saving}
              >
                Save Changes
              </Button>
            </View>
          </>
        ) : (
          <>
            <List.Item
              title="Full Name"
              description={profile?.full_name || 'Not set'}
              left={props => <List.Icon {...props} icon="account" />}
            />
            <Divider />
            <List.Item
              title="Phone Number"
              description={profile?.phone || 'Not set'}
              left={props => <List.Icon {...props} icon="phone" />}
            />
            <Divider />
            <List.Item
              title="Address"
              description={profile?.address || 'Not set'}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
            <Divider />
            <List.Item
              title="City"
              description={profile?.city || 'Not set'}
              left={props => <List.Icon {...props} icon="city" />}
            />
            <Divider />
            <List.Item
              title="State"
              description={profile?.state || 'Not set'}
              left={props => <List.Icon {...props} icon="state-machine" />}
            />
            <Divider />
            <List.Item
              title="Pincode"
              description={profile?.pincode || 'Not set'}
              left={props => <List.Icon {...props} icon="map-marker-radius" />}
            />
            
            <Button 
              mode="contained" 
              onPress={() => setIsEditing(true)}
              style={{ marginTop: 16 }}
            >
              Edit Profile
            </Button>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KYC Status</Text>
        <Pressable onPress={() => setShowKycModal(true)}>
          <View style={styles.kycStatus}>
            <MaterialCommunityIcons 
              name={profile?.kyc_status === 'verified' ? 'check-circle' : 
                    profile?.kyc_status === 'pending' ? 'clock-outline' : 'alert-circle'} 
              size={24} 
              color={getKycStatusColor(profile?.kyc_status || 'pending')} 
            />
            <Text style={styles.kycStatusText}>
              {getKycStatusText(profile?.kyc_status || 'pending')}
            </Text>
          </View>
        </Pressable>
        
        <Button 
          mode="outlined" 
          onPress={() => router.push('/(customer)/kyc-upload')}
          style={{ marginTop: 16 }}
          icon={profile?.kyc_status === 'verified' ? 'check-circle' : 'upload'}
        >
          {profile?.kyc_status === 'verified' ? 'View KYC Documents' : 'Submit KYC Documents'}
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <List.Item
          title="Notification Preferences"
          description="Manage how you receive notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowNotificationModal(true)}
        />
        <Divider />
        <List.Item
          title="Change Password"
          description="Update your account password"
          left={props => <List.Icon {...props} icon="lock" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/(auth)/reset-password')}
        />
        <Divider />
        <List.Item
          title="Privacy Policy"
          description="Read our privacy policy"
          left={props => <List.Icon {...props} icon="shield-check" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/(customer)/privacy-policy')}
        />
        <Divider />
        <List.Item
          title="Terms of Service"
          description="Read our terms of service"
          left={props => <List.Icon {...props} icon="file-document" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/(customer)/terms')}
        />
      </View>

      <Portal>
        <Modal
          visible={showKycModal}
          onDismiss={() => setShowKycModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>KYC Verification</Text>
          <Text style={styles.modalText}>
            {profile?.kyc_status === 'verified' 
              ? 'Your account is verified. You have full access to all features.'
              : profile?.kyc_status === 'pending'
                ? 'Your KYC verification is pending. Our team will review your documents shortly.'
                : 'Your KYC verification was rejected. Please submit updated documents.'}
          </Text>
          
          {profile?.kyc_status !== 'verified' && (
            <Button 
              mode="contained" 
              onPress={() => {
                setShowKycModal(false);
                router.push('/(customer)/kyc-upload');
              }}
            >
              {profile?.kyc_status === 'pending' ? 'Check Status' : 'Resubmit Documents'}
            </Button>
          )}
        </Modal>

        <Modal
          visible={showNotificationModal}
          onDismiss={() => setShowNotificationModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Notification Preferences</Text>
          <Text style={styles.modalText}>
            Choose how you want to receive notifications about your solar projects and account.
          </Text>
          
          <View style={styles.notificationItem}>
            <Text style={styles.notificationLabel}>Email Notifications</Text>
            <Switch
              value={profile?.notification_preferences?.email || false}
              onValueChange={(value) => handleUpdateNotificationPreferences('email', value)}
            />
          </View>
          
          <View style={styles.notificationItem}>
            <Text style={styles.notificationLabel}>SMS Notifications</Text>
            <Switch
              value={profile?.notification_preferences?.sms || false}
              onValueChange={(value) => handleUpdateNotificationPreferences('sms', value)}
            />
          </View>
          
          <View style={styles.notificationItem}>
            <Text style={styles.notificationLabel}>Push Notifications</Text>
            <Switch
              value={profile?.notification_preferences?.push || false}
              onValueChange={(value) => handleUpdateNotificationPreferences('push', value)}
            />
          </View>
          
          <Button 
            mode="contained" 
            onPress={() => setShowNotificationModal(false)}
            style={{ marginTop: 16 }}
          >
            Done
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
} 