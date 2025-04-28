import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Image, Pressable } from 'react-native';
import { Text, useTheme, TextInput, Button, Divider, List, Portal, Modal, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { supabase } from '../../src/services/supabase/client';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

interface KycDocument {
  id: string;
  user_id: string;
  document_type: 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'voter_id';
  document_number: string;
  document_front: string | null;
  document_back: string | null;
  selfie: string | null;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export default function KycUploadScreen() {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'aadhar' | 'pan' | 'passport' | 'driving_license' | 'voter_id'>('aadhar');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFront, setDocumentFront] = useState<string | null>(null);
  const [documentBack, setDocumentBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(null);

  useEffect(() => {
    fetchKycDocuments();
  }, []);

  const fetchKycDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch KYC documents from Supabase
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching KYC documents:', error);
        Alert.alert('Error', 'Failed to load KYC documents');
        return;
      }

      setKycDocuments(data || []);
    } catch (error) {
      console.error('Error in fetchKycDocuments:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async (type: 'front' | 'back' | 'selfie') => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your camera');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (result.canceled) return;

      // Upload to Supabase Storage
      const file = {
        uri: result.assets[0].uri,
        name: `kyc-${user?.id}-${selectedDocumentType}-${type}-${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      const formData = new FormData();
      formData.append('file', file as any);

      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(`${user?.id}/${file.name}`, formData);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(`${user?.id}/${file.name}`);

      // Update state based on type
      if (type === 'front') {
        setDocumentFront(publicUrl);
      } else if (type === 'back') {
        setDocumentBack(publicUrl);
      } else if (type === 'selfie') {
        setSelfie(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading document image:', error);
      Alert.alert('Error', 'Failed to upload document image');
    }
  };

  const handleSubmitKyc = async () => {
    try {
      if (!documentNumber) {
        Alert.alert('Error', 'Please enter your document number');
        return;
      }

      if (!documentFront) {
        Alert.alert('Error', 'Please upload the front of your document');
        return;
      }

      if (!selfie) {
        Alert.alert('Error', 'Please upload a selfie with your document');
        return;
      }

      setSubmitting(true);

      // Create KYC document record
      const { data, error } = await supabase
        .from('kyc_documents')
        .insert([{
          user_id: user?.id,
          document_type: selectedDocumentType,
          document_number: documentNumber,
          document_front: documentFront,
          document_back: documentBack,
          selfie: selfie,
          status: 'pending',
          rejection_reason: null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update user profile KYC status
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .update({
          kyc_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Reset form
      setDocumentNumber('');
      setDocumentFront(null);
      setDocumentBack(null);
      setSelfie(null);

      // Refresh documents
      await fetchKycDocuments();

      Alert.alert('Success', 'KYC documents submitted successfully. Our team will review them shortly.');
    } catch (error) {
      console.error('Error submitting KYC:', error);
      Alert.alert('Error', 'Failed to submit KYC documents');
    } finally {
      setSubmitting(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'aadhar':
        return 'Aadhar Card';
      case 'pan':
        return 'PAN Card';
      case 'passport':
        return 'Passport';
      case 'driving_license':
        return 'Driving License';
      case 'voter_id':
        return 'Voter ID';
      default:
        return 'Unknown Document';
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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
    documentTypeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    documentTypeButton: {
      marginRight: 8,
      marginBottom: 8,
    },
    documentTypeButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    documentTypeButtonText: {
      color: theme.colors.onSurface,
    },
    documentTypeButtonTextSelected: {
      color: theme.colors.onPrimary,
    },
    imageUploadContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    imageUploadBox: {
      width: '30%',
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    imageUploadBoxFilled: {
      borderColor: theme.colors.primary,
    },
    imagePreview: {
      width: '100%',
      height: '100%',
    },
    imageUploadText: {
      fontSize: 12,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    documentList: {
      marginTop: 24,
    },
    documentItem: {
      marginBottom: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: 'hidden',
    },
    documentItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    documentItemContent: {
      padding: 12,
    },
    documentItemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    documentStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 4,
    },
    documentStatusText: {
      marginLeft: 4,
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
    rejectionReason: {
      marginTop: 8,
      padding: 8,
      backgroundColor: `${theme.colors.error}20`,
      borderRadius: 4,
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
        <Text variant="headlineMedium">KYC Verification</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Submit your identity documents for verification
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Document Type</Text>
        <View style={styles.documentTypeSelector}>
          {['aadhar', 'pan', 'passport', 'driving_license', 'voter_id'].map((type) => (
            <Button
              key={type}
              mode={selectedDocumentType === type ? 'contained' : 'outlined'}
              onPress={() => setSelectedDocumentType(type as any)}
              style={[
                styles.documentTypeButton,
                selectedDocumentType === type && styles.documentTypeButtonSelected,
              ]}
              labelStyle={[
                styles.documentTypeButtonText,
                selectedDocumentType === type && styles.documentTypeButtonTextSelected,
              ]}
            >
              {getDocumentTypeLabel(type)}
            </Button>
          ))}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Document Number</Text>
          <TextInput
            mode="outlined"
            value={documentNumber}
            onChangeText={setDocumentNumber}
            placeholder={`Enter your ${getDocumentTypeLabel(selectedDocumentType)} number`}
            style={styles.input}
          />
        </View>

        <Text style={styles.sectionTitle}>Upload Documents</Text>
        <View style={styles.imageUploadContainer}>
          <View style={styles.imageUploadBox}>
            {documentFront ? (
              <Image source={{ uri: documentFront }} style={styles.imagePreview} />
            ) : (
              <Pressable 
                style={styles.imageUploadBox} 
                onPress={() => handlePickImage('front')}
              >
                <MaterialCommunityIcons name="camera" size={24} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.imageUploadText}>Front</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.imageUploadBox}>
            {documentBack ? (
              <Image source={{ uri: documentBack }} style={styles.imagePreview} />
            ) : (
              <Pressable 
                style={styles.imageUploadBox} 
                onPress={() => handlePickImage('back')}
              >
                <MaterialCommunityIcons name="camera" size={24} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.imageUploadText}>Back</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.imageUploadBox}>
            {selfie ? (
              <Image source={{ uri: selfie }} style={styles.imagePreview} />
            ) : (
              <Pressable 
                style={styles.imageUploadBox} 
                onPress={() => handlePickImage('selfie')}
              >
                <MaterialCommunityIcons name="face-man" size={24} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.imageUploadText}>Selfie</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Button 
          mode="contained" 
          onPress={handleSubmitKyc}
          loading={submitting}
          disabled={submitting || !documentNumber || !documentFront || !selfie}
          style={{ marginTop: 16 }}
        >
          Submit for Verification
        </Button>
      </View>

      {kycDocuments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your KYC Documents</Text>
          <View style={styles.documentList}>
            {kycDocuments.map((doc) => (
              <View key={doc.id} style={styles.documentItem}>
                <View style={styles.documentItemHeader}>
                  <Text variant="titleMedium">{getDocumentTypeLabel(doc.document_type)}</Text>
                  <Text variant="bodySmall">{new Date(doc.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.documentItemContent}>
                  <Text variant="bodyMedium">Document Number: {doc.document_number}</Text>
                </View>
                <View style={styles.documentItemFooter}>
                  <View 
                    style={[
                      styles.documentStatus, 
                      { backgroundColor: `${getStatusColor(doc.status)}20` }
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={doc.status === 'verified' ? 'check-circle' : 
                            doc.status === 'pending' ? 'clock-outline' : 'alert-circle'} 
                      size={16} 
                      color={getStatusColor(doc.status)} 
                    />
                    <Text 
                      style={[
                        styles.documentStatusText, 
                        { color: getStatusColor(doc.status) }
                      ]}
                    >
                      {getStatusText(doc.status)}
                    </Text>
                  </View>
                  <Button 
                    mode="text" 
                    onPress={() => {
                      setSelectedDocument(doc);
                      setShowStatusModal(true);
                    }}
                  >
                    View Details
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <Portal>
        <Modal
          visible={showStatusModal}
          onDismiss={() => setShowStatusModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedDocument && (
            <>
              <Text style={styles.modalTitle}>KYC Document Details</Text>
              <Text style={styles.modalText}>
                <Text style={{ fontWeight: 'bold' }}>Document Type: </Text>
                {getDocumentTypeLabel(selectedDocument.document_type)}
              </Text>
              <Text style={styles.modalText}>
                <Text style={{ fontWeight: 'bold' }}>Document Number: </Text>
                {selectedDocument.document_number}
              </Text>
              <Text style={styles.modalText}>
                <Text style={{ fontWeight: 'bold' }}>Status: </Text>
                {getStatusText(selectedDocument.status)}
              </Text>
              <Text style={styles.modalText}>
                <Text style={{ fontWeight: 'bold' }}>Submitted On: </Text>
                {new Date(selectedDocument.created_at).toLocaleString()}
              </Text>
              
              {selectedDocument.status === 'rejected' && selectedDocument.rejection_reason && (
                <View style={styles.rejectionReason}>
                  <Text style={{ fontWeight: 'bold', color: theme.colors.error }}>
                    Rejection Reason:
                  </Text>
                  <Text style={{ color: theme.colors.error }}>
                    {selectedDocument.rejection_reason}
                  </Text>
                </View>
              )}
              
              <Button 
                mode="contained" 
                onPress={() => setShowStatusModal(false)}
                style={{ marginTop: 16 }}
              >
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
} 