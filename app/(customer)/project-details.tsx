import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Chip, useTheme, ProgressBar, IconButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MD3Theme } from 'react-native-paper';
import { ProjectsService, SolarProject } from '../../src/services/supabase/projects';
import { useAuth } from '../../src/hooks/useAuth';
import { router, useLocalSearchParams } from 'expo-router';

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

export default function ProjectDetailsPage() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const projectsService = new ProjectsService();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  // Fetch project details when component mounts
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!user || !projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch project details
        const projectDetails = await projectsService.getProjectById(projectId);
        
        if (!projectDetails) {
          setError('Project not found');
          return;
        }
        
        // Determine solar type based on project type
        let solarType: 'physical' | 'digital' = 'physical';
        const projectType = projectDetails.project_type?.toLowerCase() || '';
        if (projectType === 'digital') {
          solarType = 'digital';
        }
        
        // Transform the data to match our Project interface
        const transformedProject: Project = {
          ...projectDetails,
          name: `Solar Project ${projectDetails.id.substring(0, 4)}`,
          lastMaintenance: projectDetails.status === 'active' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null,
          nextMaintenance: projectDetails.status === 'active' ? new Date(Date.now() + 150 * 24 * 60 * 60 * 1000) : null,
          solar_type: solarType
        };
        
        setProject(transformedProject);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [user, projectId]);

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
    backButton: {
      marginBottom: 16,
    },
    projectCard: {
      marginBottom: 24,
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
    timelineSection: {
      marginTop: 24,
      marginBottom: 24,
    },
    timelineTitle: {
      marginBottom: 16,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    timelineIcon: {
      marginRight: 16,
    },
    timelineContent: {
      flex: 1,
    },
    timelineDate: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    timelineStatus: {
      marginTop: 4,
    },
    divider: {
      marginVertical: 16,
    },
    digitalSolarSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
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

  // Function to get the solar type label
  const getSolarTypeLabel = (solarType: string | undefined) => {
    if (!solarType) return 'Unknown';
    const normalizedType = solarType.toLowerCase();
    return normalizedType === 'physical' ? 'Physical Solar' : 'Digital Solar';
  };

  // Function to get the project type label
  const getProjectCategoryLabel = (projectType: string) => {
    const normalizedType = projectType?.toLowerCase() || '';
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

  const getTimelineItems = (project: Project) => {
    const items = [
      {
        id: 'quote',
        title: 'Quote Received',
        description: 'Your solar project quote has been generated',
        date: project.created_at ? new Date(project.created_at) : null,
        status: 'completed',
        icon: 'file-document-outline',
      },
      {
        id: 'confirmed',
        title: 'Project Confirmed',
        description: 'Your solar project has been confirmed',
        date: project.status === 'confirmed' || project.status === 'installation' || project.status === 'active' 
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          : null,
        status: project.status === 'quote' ? 'pending' : 'completed',
        icon: 'check-circle-outline',
      },
      {
        id: 'installation',
        title: 'Installation',
        description: 'Your solar panels are being installed',
        date: project.installation_date || null,
        status: project.status === 'installation' ? 'in_progress' : 
                project.status === 'active' ? 'completed' : 'pending',
        icon: 'solar-panel',
      },
      {
        id: 'active',
        title: 'System Activated',
        description: 'Your solar system is now active and generating power',
        date: project.completion_date || null,
        status: project.status === 'active' ? 'completed' : 'pending',
        icon: 'power-plug',
      },
    ];
    
    return items;
  };

  const getTimelineStatusColor = (status: string, theme: MD3Theme) => {
    switch (status) {
      case 'completed':
        return theme.colors.primary;
      case 'in_progress':
        return theme.colors.tertiary;
      case 'pending':
        return theme.colors.outline;
      default:
        return theme.colors.outline;
    }
  };

  const getTimelineStatusBackgroundColor = (status: string, theme: MD3Theme) => {
    switch (status) {
      case 'completed':
        return '#6750A433'; // Primary color with 20% opacity
      case 'in_progress':
        return '#7D526033'; // Tertiary color with 20% opacity
      case 'pending':
        return '#79747E33'; // Outline color with 20% opacity
      default:
        return '#79747E33'; // Default outline color with 20% opacity
    }
  };

  const renderTimeline = (project: Project) => {
    const timelineItems = getTimelineItems(project);
    
    return (
      <View style={styles.timelineSection}>
        <Text variant="titleLarge" style={styles.timelineTitle}>Project Timeline</Text>
        
        {timelineItems.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <MaterialCommunityIcons 
                name={item.icon as any} 
                size={24} 
                color={getTimelineStatusColor(item.status, theme)} 
              />
              {index < timelineItems.length - 1 && (
                <View 
                  style={{ 
                    width: 2, 
                    height: 40, 
                    backgroundColor: theme.colors.outlineVariant,
                    marginLeft: 11,
                    marginTop: 4
                  }} 
                />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text variant="titleMedium">{item.title}</Text>
              <Text variant="bodyMedium">{item.description}</Text>
              {item.date && (
                <Text variant="bodySmall" style={styles.timelineDate}>
                  {formatDate(item.date)}
                </Text>
              )}
              <Chip 
                mode="flat" 
                style={[
                  styles.timelineStatus, 
                  { backgroundColor: getTimelineStatusBackgroundColor(item.status, theme) }
                ]}
                textStyle={{ color: getTimelineStatusColor(item.status, theme) }}
              >
                {item.status === 'completed' ? 'Completed' : 
                 item.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </Chip>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderProjectDetails = () => {
    if (!project) return null;
    
    const statusColor = getStatusColor(project.status, theme);
    
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant="headlineMedium">Project Details</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            Track the progress of your solar installation
          </Text>
        </View>

        <Card style={styles.projectCard}>
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
                {getStatusLabel(project.status)}
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

            <Divider style={styles.divider} />

            {renderTimeline(project)}

            {/* Show system health only for physical solar projects */}
            {project.solar_type === 'physical' && project.status === 'active' && (
              <>
                <Divider style={styles.divider} />
                
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
              <>
                <Divider style={styles.divider} />
                
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
              </>
            )}

            <View style={styles.actionButtons}>
              {project.status === 'active' && (
                <Button
                  mode="contained"
                  onPress={() => {
                    // Navigate to service request page
                    router.push({
                      pathname: '/service-request',
                      params: { projectId: project.id }
                    });
                  }}
                  style={styles.actionButton}
                >
                  Raise Service Request
                </Button>
              )}
              
              {project.status === 'quote' && (
                <Button
                  mode="contained"
                  onPress={() => {
                    // Navigate to quote details page
                    router.push({
                      pathname: '/quote-details',
                      params: { projectId: project.id }
                    });
                  }}
                  style={styles.actionButton}
                >
                  View Quote Details
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading project details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={{ marginTop: 16, textAlign: 'center', color: theme.colors.error }}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return renderProjectDetails();
} 