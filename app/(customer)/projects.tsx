import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Text, Card, Button, Chip, useTheme, ProgressBar, IconButton, SegmentedButtons, Portal, Modal, TextInput, RadioButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MD3Theme } from 'react-native-paper';
import { ProjectsService, SolarProject } from '../../src/services/supabase/projects';
import { useAuth } from '../../src/hooks/useAuth';
import { router } from 'expo-router';
import { initializePayment } from '../../src/services/razorpay/client';

// Remove mock data
// const PROJECTS: Project[] = [ ... ];

// Extend the SolarProject interface to include solar_type
interface ExtendedSolarProject extends SolarProject {
  solar_type?: 'physical' | 'digital';
  digital_project_capacity?: number;
  savings_range?: number;
  state?: string;
}

type ProjectStatus = 'quote' | 'confirmed' | 'installation' | 'active';

interface Project extends ExtendedSolarProject {
  name: string;
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
}

export default function ProjectsPage() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('in_review');
  const [serviceRequestVisible, setServiceRequestVisible] = useState(false);
  const [serviceRequestDescription, setServiceRequestDescription] = useState('');
  const [serviceRequestType, setServiceRequestType] = useState('maintenance');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const { user } = useAuth();
  const projectsService = new ProjectsService();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'emi'>('full');
  const [emiType, setEmiType] = useState<'partial' | 'full'>('full');
  const [partialAmount, setPartialAmount] = useState('');

  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch projects for the current user with all details
        const customerProjects = await projectsService.getCustomerProjects(user.id);
        
        // Transform the data to match our Project interface
        const transformedProjects: Project[] = customerProjects.map(project => {
          // Determine solar type based on project_type field
          const projectType = project.project_type?.toLowerCase() || '';
          const solarType = projectType === 'digital' ? 'digital' : 'physical';
          
          return {
            ...project,
            name: `Solar Project ${project.id.substring(0, 4)}`,
            lastMaintenance: project.status === 'active' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null,
            nextMaintenance: project.status === 'active' ? new Date(Date.now() + 150 * 24 * 60 * 60 * 1000) : null,
            solar_type: solarType,
            // Set digital project specific fields if it's a digital project
            digital_project_capacity: projectType === 'digital' ? project.capacity_kw : undefined,
            savings_range: projectType === 'digital' ? project.savings_range : undefined,
            state: projectType === 'digital' ? project.state : undefined,
          };
        });
        
        setProjects(transformedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load your solar projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    tabsContainer: {
      marginBottom: 16,
    },
    tabsScrollContent: {
      paddingHorizontal: 4,
    },
    tabButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginHorizontal: 4,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
    },
    activeTabButton: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    activeTabText: {
      color: theme.colors.onPrimary,
      fontWeight: 'bold',
    },
    projectsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    projectCard: {
      width: '100%',
      marginBottom: 16,
    },
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    projectTitle: {
      flex: 1,
      marginRight: 8,
    },
    statusChip: {
      marginLeft: 8,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    metricItem: {
      width: '33%',
      alignItems: 'center',
      marginBottom: 16,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    progressSection: {
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    maintenanceSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    actionButton: {
      marginLeft: 8,
    },
    modalContainer: {
      backgroundColor: theme.colors.background,
      padding: 20,
      margin: 20,
      borderRadius: 8,
    },
    modalTitle: {
      marginBottom: 16,
    },
    modalInput: {
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    modalButton: {
      marginLeft: 8,
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyStateText: {
      textAlign: 'center',
      marginTop: 16,
      color: theme.colors.onSurfaceVariant,
    },
    detailsSection: {
      marginTop: 16,
      marginBottom: 24,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    detailLabel: {
      fontWeight: '500',
    },
    costSection: {
      marginTop: 16,
      marginBottom: 16,
      padding: 12,
      backgroundColor: '#F5F5F5',
      borderRadius: 8,
    },
    costRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    digitalSolarSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
    },
    radioLabel: {
      marginLeft: 8,
      flex: 1,
    },
  });

  const getStatusColor = (status: ProjectStatus, theme: MD3Theme) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'quote':
        return theme.colors.tertiary;
      case 'installation':
        return theme.colors.error;
      case 'confirmed':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusBackgroundColor = (status: ProjectStatus, theme: MD3Theme) => {
    switch (status) {
      case 'active':
        return '#6750A433'; // Primary color with 20% opacity
      case 'quote':
        return '#7D526033'; // Tertiary color with 20% opacity
      case 'installation':
        return '#B3261E33'; // Error color with 20% opacity
      case 'confirmed':
        return '#4F378B33'; // Secondary color with 20% opacity
      default:
        return '#79747E33'; // Default outline color with 20% opacity
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'quote':
        return 'Quote';
      case 'installation':
        return 'Installation';
      case 'confirmed':
        return 'Confirmed';
      default:
        return status;
    }
  };

  // Function to ensure project type is correctly displayed
  const getProjectTypeLabel = (projectType: string) => {
    const normalizedType = projectType?.toLowerCase() || '';
    if (normalizedType === 'digital') {
      return 'Digital Solar';
    }
    switch (normalizedType) {
      case 'residential':
        return 'Residential';
      case 'commercial':
        return 'Commercial';
      case 'industrial':
        return 'Industrial';
      default:
        return projectType || 'Unknown';
    }
  };

  // Function to get the solar type label
  const getSolarTypeLabel = (solarType: string | undefined) => {
    if (!solarType) return 'Physical Solar'; // Default to Physical Solar if not specified
    return solarType.toLowerCase() === 'digital' ? 'Digital Solar' : 'Physical Solar';
  };

  // Function to get the project type label
  const getProjectCategoryLabel = (projectType: string) => {
    const normalizedType = projectType?.toLowerCase() || '';
    if (normalizedType === 'digital') {
      return 'Digital Solar';
    }
    switch (normalizedType) {
      case 'residential':
        return 'Residential';
      case 'commercial':
        return 'Commercial';
      case 'industrial':
        return 'Industrial';
      default:
        return projectType || 'Unknown';
    }
  };

  const handleServiceRequest = () => {
    // Here you would typically send the service request to your backend
    console.log('Service request submitted:', {
      projectId: selectedProject?.id,
      type: serviceRequestType,
      description: serviceRequestDescription,
    });
    
    // Reset form and close modal
    setServiceRequestDescription('');
    setServiceRequestType('maintenance');
    setServiceRequestVisible(false);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsModalVisible(true);
  };

  const handleTrackProgress = (project: Project) => {
    // Navigate to the project details page with the project ID
    router.push({
      pathname: '/project-details',
      params: { projectId: project.id }
    });
  };

  const handlePayment = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      
      // Calculate payment amount based on selection
      let paymentAmount = 0;
      const estimatedCost = selectedProject.estimated_cost || 0;
      
      if (paymentType === 'full') {
        // 10% of total project cost
        paymentAmount = estimatedCost * 0.1;
      } else if (paymentType === 'emi') {
        if (emiType === 'full') {
          // 10% of total project cost
          paymentAmount = estimatedCost * 0.1;
        } else {
          // 10% of partial amount
          const partialAmountValue = parseFloat(partialAmount) || 0;
          paymentAmount = partialAmountValue * 0.1;
        }
      }
      
      // Initialize Razorpay payment
      const result = await initializePayment({
        amount: Math.round(paymentAmount * 100), // Convert to paise
        currency: 'INR',
        name: 'Go2Solar India',
        description: `Payment for ${selectedProject.name} - ${paymentType === 'full' ? 'Full Payment' : 'EMI'} (${emiType})`,
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          project_id: selectedProject.id,
          payment_type: paymentType,
          emi_type: emiType,
          partial_amount: emiType === 'partial' ? partialAmount : '',
        },
        projectId: selectedProject.id,
      });
      
      if (result.success) {
        // Refresh projects to get updated status
        const updatedProjects = await projectsService.getCustomerProjects(user?.id || '');
        
        // Transform the data to match our Project interface
        const transformedProjects: Project[] = updatedProjects.map(project => {
          const projectType = project.project_type?.toLowerCase() || '';
          const solarType = projectType === 'digital' ? 'digital' : 'physical';
          
          return {
            ...project,
            name: `Solar Project ${project.id.substring(0, 4)}`,
            lastMaintenance: project.status === 'active' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null,
            nextMaintenance: project.status === 'active' ? new Date(Date.now() + 150 * 24 * 60 * 60 * 1000) : null,
            solar_type: solarType,
            digital_project_capacity: projectType === 'digital' ? project.capacity_kw : undefined,
            savings_range: projectType === 'digital' ? project.savings_range : undefined,
            state: projectType === 'digital' ? project.state : undefined,
          };
        });
        
        setProjects(transformedProjects);
        
        // Close modal and reset state
        setPaymentModalVisible(false);
        setPaymentType('full');
        setEmiType('full');
        setPartialAmount('');
        
        // Show success message
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully. The project is now in progress.'
        );
      } else {
        Alert.alert('Payment Failed', result.error || 'There was an error processing your payment.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Error', 'An unexpected error occurred while processing your payment.');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceRequestModal = () => (
    <Portal>
      <Modal
        visible={serviceRequestVisible}
        onDismiss={() => setServiceRequestVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant="headlineSmall" style={styles.modalTitle}>
          Raise Service Request
        </Text>
        
        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
          Project: {selectedProject?.name}
        </Text>
        
        <SegmentedButtons
          value={serviceRequestType}
          onValueChange={setServiceRequestType}
          buttons={[
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'repair', label: 'Repair' },
            { value: 'inspection', label: 'Inspection' },
          ]}
          style={{ marginBottom: 16 }}
        />
        
        <TextInput
          label="Description"
          value={serviceRequestDescription}
          onChangeText={setServiceRequestDescription}
          multiline
          numberOfLines={4}
          style={styles.modalInput}
        />
        
        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => setServiceRequestVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleServiceRequest}
            style={styles.modalButton}
            disabled={!serviceRequestDescription.trim()}
          >
            Submit
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderProjectDetailsModal = () => (
    <Portal>
      <Modal
        visible={detailsModalVisible}
        onDismiss={() => setDetailsModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedProject && (
          <>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Project Details
            </Text>
            
            <View style={styles.detailsSection}>
              <Text variant="titleMedium">Project Information</Text>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Project Name:</Text>
                <Text variant="bodyMedium">{selectedProject.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Project Category:</Text>
                <Text variant="bodyMedium">
                  {getProjectCategoryLabel(selectedProject.project_type)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Solar Type:</Text>
                <Text variant="bodyMedium">
                  {getSolarTypeLabel(selectedProject.solar_type)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Status:</Text>
                <Text variant="bodyMedium">{getStatusLabel(selectedProject.status)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Capacity:</Text>
                <Text variant="bodyMedium">{selectedProject.capacity_kw} kW</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Annual Energy:</Text>
                <Text variant="bodyMedium">{selectedProject.annual_energy} kWh</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Annual Savings:</Text>
                <Text variant="bodyMedium">₹{selectedProject.annual_savings}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Estimated Cost:</Text>
                <Text variant="bodyMedium">{formatCurrency(selectedProject.estimated_cost)}</Text>
              </View>
              {selectedProject.actual_cost && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Actual Cost:</Text>
                  <Text variant="bodyMedium">{formatCurrency(selectedProject.actual_cost)}</Text>
                </View>
              )}
              {selectedProject.subsidy && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Subsidy:</Text>
                  <Text variant="bodyMedium">{formatCurrency(selectedProject.subsidy)}</Text>
                </View>
              )}
              {selectedProject.effective_cost && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Effective Cost:</Text>
                  <Text variant="bodyMedium">{formatCurrency(selectedProject.effective_cost)}</Text>
                </View>
              )}
              {selectedProject.installation_date && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Installation Date:</Text>
                  <Text variant="bodyMedium">{formatDate(selectedProject.installation_date)}</Text>
                </View>
              )}
              {selectedProject.completion_date && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Completion Date:</Text>
                  <Text variant="bodyMedium">{formatDate(selectedProject.completion_date)}</Text>
                </View>
              )}
              {selectedProject.monthly_bill && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Monthly Bill:</Text>
                  <Text variant="bodyMedium">₹{selectedProject.monthly_bill}</Text>
                </View>
              )}
              {selectedProject.need_financing && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Financing:</Text>
                  <Text variant="bodyMedium">{selectedProject.need_financing}</Text>
                </View>
              )}
              {selectedProject.location && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Location:</Text>
                  <Text variant="bodyMedium">{selectedProject.location}</Text>
                </View>
              )}
              {selectedProject.space_required && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Space Required:</Text>
                  <Text variant="bodyMedium">{selectedProject.space_required} sq ft</Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setDetailsModalVisible(false)}
                style={styles.modalButton}
              >
                Close
              </Button>
              {selectedProject.status === 'quote' && (
            <Button
              mode="contained"
                  onPress={() => {
                    setDetailsModalVisible(false);
                    handleTrackProgress(selectedProject);
                  }}
                  style={styles.modalButton}
                >
                  Track Progress
            </Button>
              )}
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  const renderPaymentModal = () => (
    <Portal>
      <Modal
        visible={paymentModalVisible}
        onDismiss={() => setPaymentModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant="headlineSmall" style={styles.modalTitle}>
          Payment Details
        </Text>
        
        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
          Project: {selectedProject?.name}
        </Text>
        
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Select Payment Type
        </Text>
        
        <RadioButton.Group
          onValueChange={value => setPaymentType(value as 'full' | 'emi')}
          value={paymentType}
        >
          <View style={styles.radioOption}>
            <RadioButton value="full" />
            <View style={styles.radioLabel}>
              <Text variant="bodyMedium">Full Payment</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Pay 10% of project cost ({formatCurrency((selectedProject?.estimated_cost || 0) * 0.1)})
              </Text>
            </View>
          </View>
          
          <View style={styles.radioOption}>
            <RadioButton value="emi" />
            <View style={styles.radioLabel}>
              <Text variant="bodyMedium">EMI</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Choose between partial or full EMI
              </Text>
            </View>
          </View>
        </RadioButton.Group>
        
        {paymentType === 'emi' && (
          <>
            <Divider style={{ marginVertical: 16 }} />
            
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Select EMI Type
            </Text>
            
            <RadioButton.Group
              onValueChange={value => setEmiType(value as 'partial' | 'full')}
              value={emiType}
            >
              <View style={styles.radioOption}>
                <RadioButton value="full" />
                <View style={styles.radioLabel}>
                  <Text variant="bodyMedium">Full EMI</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Pay 10% of project cost ({formatCurrency((selectedProject?.estimated_cost || 0) * 0.1)})
                  </Text>
                </View>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="partial" />
                <View style={styles.radioLabel}>
                  <Text variant="bodyMedium">Partial EMI</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Pay 10% of partial amount
                  </Text>
                </View>
              </View>
            </RadioButton.Group>
            
            {emiType === 'partial' && (
              <TextInput
                label="Partial Amount"
                value={partialAmount}
                onChangeText={setPartialAmount}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginTop: 16 }}
                right={<TextInput.Affix text="₹" />}
              />
            )}
          </>
        )}
        
        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => setPaymentModalVisible(false)}
            style={styles.modalButton}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handlePayment}
            style={styles.modalButton}
            loading={loading}
            disabled={loading || (emiType === 'partial' && !partialAmount)}
          >
            Proceed to Payment
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderProjectCard = (project: Project) => {
    const statusColor = getStatusColor(project.status, theme);
    
    return (
      <Card key={project.id} style={styles.projectCard}>
        <Card.Content>
          <View style={styles.projectHeader}>
            <View style={styles.projectTitle}>
              <Text variant="titleLarge">{project.name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {getProjectCategoryLabel(project.project_type)} • {getSolarTypeLabel(project.solar_type)}
              </Text>
            </View>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: getStatusBackgroundColor(project.status, theme) }]}
              textStyle={{ color: statusColor }}
            >
              <Text>{getStatusLabel(project.status)}</Text>
            </Chip>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{project.capacity_kw} kW</Text>
              <Text style={styles.metricLabel}>Capacity</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{project.annual_energy} kWh</Text>
              <Text style={styles.metricLabel}>Annual Energy</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>₹{project.annual_savings}</Text>
              <Text style={styles.metricLabel}>Annual Savings</Text>
            </View>
          </View>

          {project.estimated_cost && (
            <View style={styles.costSection}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>Cost Details</Text>
              <View style={styles.costRow}>
                <Text variant="bodyMedium">Estimated Cost:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(project.estimated_cost)}
                </Text>
              </View>
              {project.subsidy && (
                <View style={styles.costRow}>
                  <Text variant="bodyMedium">Subsidy:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    {formatCurrency(project.subsidy)}
                  </Text>
                </View>
              )}
              {project.effective_cost && (
                <View style={styles.costRow}>
                  <Text variant="bodyMedium">Effective Cost:</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {formatCurrency(project.effective_cost)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Show system health only for physical solar projects */}
          {project.solar_type === 'physical' && project.status === 'active' && (
            <>
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text variant="titleMedium">System Health</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>85%</Text>
                </View>
                <ProgressBar
                  progress={0.85}
                  color={theme.colors.primary}
                  style={{ height: 8, borderRadius: 4 }}
                />
              </View>

              <View style={styles.maintenanceSection}>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>Maintenance</Text>
                <View style={{ marginBottom: 8 }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Last Maintenance
                  </Text>
                  <Text variant="bodyMedium">{formatDate(project.lastMaintenance)}</Text>
                </View>
                <View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Next Maintenance
                  </Text>
                  <Text variant="bodyMedium">{formatDate(project.nextMaintenance)}</Text>
                </View>
              </View>
            </>
          )}

          {/* Show digital solar specific information */}
          {project.solar_type === 'digital' && project.status === 'active' && (
            <View style={styles.digitalSolarSection}>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>Digital Solar Details</Text>
              <View style={{ marginBottom: 8 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Reserved Capacity
                </Text>
                <Text variant="bodyMedium">{project.digital_project_capacity || project.capacity_kw} kW</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Expected Savings
                </Text>
                <Text variant="bodyMedium">{project.savings_range || 25}% of your electricity bill</Text>
              </View>
              <View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Project Location
                </Text>
                <Text variant="bodyMedium">{project.state || 'India'}</Text>
              </View>
            </View>
          )}

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => handleViewDetails(project)}
              style={styles.actionButton}
            >
              <Text>View Details</Text>
            </Button>
            
            {project.status === 'active' && (
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedProject(project);
                  setServiceRequestVisible(true);
                }}
                style={styles.actionButton}
              >
                <Text>Raise Service Request</Text>
              </Button>
            )}
            
            {project.status === 'quote' && (
              <Button
                mode="contained"
                onPress={() => handleTrackProgress(project)}
                style={styles.actionButton}
              >
                <Text>Track Progress</Text>
              </Button>
            )}
            
            {project.status === 'confirmed' && (
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedProject(project);
                  setPaymentModalVisible(true);
                }}
                style={styles.actionButton}
              >
                <Text>Proceed to Payment</Text>
              </Button>
            )}
            
            {project.status === 'installation' && (
              <Button
                mode="contained"
                onPress={() => handleTrackProgress(project)}
                style={styles.actionButton}
              >
                <Text>View Installation Status</Text>
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="solar-panel" size={64} color={theme.colors.primary} />
      <Text variant="titleMedium" style={styles.emptyStateText}>
        {message}
      </Text>
    </View>
  );

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'installed') {
      return project.status === 'active';
    } else if (activeTab === 'in_progress') {
      return project.status === 'installation';
    } else if (activeTab === 'confirmed') {
      return project.status === 'confirmed';
    } else if (activeTab === 'in_review') {
      return project.status === 'quote';
    }
    return false;
  });

  const renderCustomTabs = () => {
    const tabs = [
      { value: 'in_review', label: 'Quote' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'installed', label: 'Active' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.value}
            style={[
              styles.tabButton,
              activeTab === tab.value && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text 
              style={[
                styles.tabText,
                activeTab === tab.value && styles.activeTabText
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text variant="headlineMedium">My Solar Projects</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          Track and manage your solar installations
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        {renderCustomTabs()}
      </View>

      {loading ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading your projects...</Text>
        </View>
      ) : error ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={{ marginTop: 16, textAlign: 'center', color: theme.colors.error }}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              setLoading(true);
              setError(null);
              // Retry fetching projects
              if (user) {
                projectsService.getCustomerProjects(user.id)
                  .then(customerProjects => {
                    const transformedProjects: Project[] = customerProjects.map(project => ({
                      ...project,
                      name: `Solar Project ${project.id.substring(0, 4)}`,
                      lastMaintenance: project.status === 'active' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null,
                      nextMaintenance: project.status === 'active' ? new Date(Date.now() + 150 * 24 * 60 * 60 * 1000) : null,
                    }));
                    setProjects(transformedProjects);
                  })
                  .catch(err => {
                    console.error('Error retrying fetch:', err);
                    setError('Failed to load your solar projects. Please try again later.');
                  })
                  .finally(() => setLoading(false));
              }
            }}
            style={{ marginTop: 16 }}
          >
            Retry
          </Button>
        </View>
      ) : filteredProjects.length > 0 ? (
        <View style={styles.projectsGrid}>
          {filteredProjects.map((project) => renderProjectCard(project))}
        </View>
      ) : (
        renderEmptyState(
          activeTab === 'installed'
            ? 'You have no installed solar projects yet'
            : activeTab === 'in_progress'
            ? 'You have no projects in progress'
            : activeTab === 'confirmed'
            ? 'You have no confirmed projects'
            : 'You have no projects in review'
        )
      )}
      
      {renderServiceRequestModal()}
      {renderProjectDetailsModal()}
      {renderPaymentModal()}
    </ScrollView>
  );
}