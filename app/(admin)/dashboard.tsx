import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { Text, Card, Button, DataTable, Divider, IconButton, Menu, Portal, Dialog, Paragraph, useTheme, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { UsersService } from '../../src/services/supabase/users';
import { ProjectsService } from '../../src/services/supabase/projects';
import { ServiceRequestsService } from '../../src/services/supabase/service-requests';
import { WalletService } from '../../src/services/supabase/wallet';
import { ReferralsService } from '../../src/services/supabase/referrals';
import { Database } from '../../src/types/database.types';
import { DatabaseError } from '../../src/services/supabase/database';
import { WalletTransaction } from '../../src/services/supabase/wallet';
import { ServiceRequest } from '../../src/services/supabase/service-requests';
import { Referral } from '../../src/services/supabase/referrals';
import { DigitalWallet } from '../../src/services/supabase/wallet';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { supabase } from '../../src/services/supabase/client';

type User = Database['public']['Tables']['users']['Row'];
type Project = Database['public']['Tables']['solar_projects']['Row'];

// Initialize services
const usersService = new UsersService();
const projectsService = new ProjectsService();
const serviceRequestsService = new ServiceRequestsService();
const walletService = new WalletService();
const referralsService = new ReferralsService();

interface RecentUser {
  id: string;
  name: string | null;
  role: 'customer' | 'agent' | 'admin';
  status: string;
  date: string;
}

interface RecentProject {
  id: string;
  name: string;
  customer: string;
  type: 'physical' | 'digital';
  status: 'quote' | 'confirmed' | 'installation' | 'active';
  date: string;
}

interface DashboardData {
  totalUsers: number;
  totalProjects: number;
  totalServiceRequests: number;
  recentProjects: any[];
  recentServiceRequests: any[];
  walletBalance: number;
  referralRewards: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Feather.glyphMap;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
  <Card style={styles.statsCard}>
    <Card.Content style={styles.statContent}>
      <Feather name={icon} size={24} color={theme.colors.primary} />
      <Text variant="titleMedium" style={styles.statTitle}>{title}</Text>
      <Text variant="headlineMedium" style={styles.statValue}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    margin: 8,
    minWidth: 200,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statTitle: {
    marginTop: 8,
    color: theme.colors.secondary,
  },
  statValue: {
    marginTop: 4,
    color: theme.colors.primary,
  },
  card: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcome: {
    fontSize: 24,
    marginBottom: 24,
    color: theme.colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionColumn: {
    width: '30%',
    minWidth: 250,
  },
  actionGroupTitle: {
    marginBottom: 8,
    color: theme.colors.secondary,
  },
  actionButton: {
    marginBottom: 8,
    width: '100%',
  },
  tableContainer: {
    marginTop: 16,
  },
  tableHeader: {
    backgroundColor: theme.colors.background,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
  },
  tableCell: {
    flex: 1,
  },
  tableText: {
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 16,
  },
  activeText: {
    color: theme.colors.success,
  },
  installationText: {
    color: theme.colors.warning,
  },
  confirmedText: {
    color: theme.colors.primary,
  },
  quoteText: {
    color: theme.colors.secondary,
  },
});

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    totalProjects: 0,
    totalServiceRequests: 0,
    recentProjects: [],
    recentServiceRequests: [],
    walletBalance: 0,
    referralRewards: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
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

  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Authentication error: ' + error.message);
          router.replace('/(auth)/login');
          return;
        }
        
        if (!session) {
          console.log('No active session found, redirecting to login');
          router.replace('/(auth)/login');
          return;
        }
        
        // Check if user has admin role
        const userRole = session.user?.user_metadata?.role;
        if (userRole !== 'admin') {
          console.log('User is not an admin, redirecting to login');
          router.replace('/(auth)/login');
          return;
        }
        
        setAuthState(session);
        // Fetch dashboard data after confirming authentication
        fetchDashboardData();
      } catch (error) {
        console.error('Error checking auth state:', error);
        setError('Authentication error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        router.replace('/(auth)/login');
      }
    };
    
    checkAuth();
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard data...');

      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count');
      
      if (testError) {
        console.error('Error testing Supabase connection:', testError);
        throw new Error('Database connection error: ' + testError.message);
      }
      
      console.log('Supabase connection test successful, user count:', testData[0]?.count);

      // Fetch users using UsersService
      console.log('Fetching users...');
      const { data: usersData, error: usersError } = await usersService.getAll();
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }
      console.log('Users fetched successfully:', usersData?.length || 0);

      // Fetch projects
      console.log('Fetching projects...');
      const { data: projectsData, error: projectsError } = await projectsService.getAll();
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
      }
      console.log('Projects fetched successfully:', projectsData?.length || 0);

      // Fetch service requests
      console.log('Fetching service requests...');
      const { data: serviceRequestsData, error: serviceRequestsError } = await serviceRequestsService.getAll();
      if (serviceRequestsError) {
        console.error('Error fetching service requests:', serviceRequestsError);
        throw serviceRequestsError;
      }
      console.log('Service requests fetched successfully:', serviceRequestsData?.length || 0);

      // Update dashboard data
      setDashboardData({
        totalUsers: usersData?.length || 0,
        totalProjects: projectsData?.length || 0,
        totalServiceRequests: serviceRequestsData?.length || 0,
        recentProjects: projectsData?.slice(0, 5) || [],
        recentServiceRequests: serviceRequestsData?.slice(0, 5) || [],
        walletBalance: 0, // TODO: Implement wallet balance
        referralRewards: 0 // TODO: Implement referral rewards
      });

      // Update recent users
      if (usersData) {
        const recentUsersData = usersData.slice(0, 5).map(user => ({
          id: user.id,
          name: user.full_name,
          role: user.role,
          status: user.status,
          date: user.created_at
        }));
        setRecentUsers(recentUsersData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => {
      setRefreshing(false);
    });
  };

  const openMenu = (item: any) => {
    setSelectedItem(item);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleAction = (action: string) => {
    closeMenu();
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) { // 1 Crore or more
      return (num / 10000000).toFixed(1) + ' Cr';
    } else if (num >= 100000) { // 1 Lakh or more
      return (num / 100000).toFixed(1) + ' L';
    } else if (num >= 1000) { // 1 Thousand or more
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  };

  const formatCurrencyAbbreviated = (amount: number) => {
    if (amount >= 10000000) { // 1 Crore or more
      return '₹' + (amount / 10000000).toFixed(1) + ' Cr';
    } else if (amount >= 100000) { // 1 Lakh or more
      return '₹' + (amount / 100000).toFixed(1) + ' L';
    } else if (amount >= 1000) { // 1 Thousand or more
      return '₹' + (amount / 1000).toFixed(1) + 'k';
    } else {
      return '₹' + amount.toString();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading dashboard data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchDashboardData}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.welcome}>Welcome to the Admin Dashboard</Text>
        
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Users"
            value={dashboardData.totalUsers}
            icon="users"
          />
          <StatCard
            title="Total Projects"
            value={dashboardData.totalProjects}
            icon="briefcase"
          />
          <StatCard
            title="Service Requests"
            value={dashboardData.totalServiceRequests}
            icon="tool"
          />
          <StatCard
            title="Wallet Balance"
            value={`₹${dashboardData.walletBalance.toLocaleString()}`}
            icon="credit-card"
          />
        </View>
        
        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardHeader}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Users & Roles</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/users')}
                  style={styles.actionButton}
                  icon="account-group"
                >
                  Manage Users
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/users/roles')}
                  style={styles.actionButton}
                  icon="shield-account"
                >
                  User Roles
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Projects</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/projects')}
                  style={styles.actionButton}
                  icon="solar-power"
                >
                  Manage Projects
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/projects/approvals')}
                  style={styles.actionButton}
                  icon="check-decagram"
                >
                  Approvals
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Integrations</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/integrations')}
                  style={styles.actionButton}
                  icon="connection"
                >
                  Manage Integrations
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/integrations/health')}
                  style={styles.actionButton}
                  icon="heart-pulse"
                >
                  Health Check
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Analytics</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/reports')}
                  style={styles.actionButton}
                  icon="chart-box"
                >
                  View Reports
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/analytics')}
                  style={styles.actionButton}
                  icon="chart-timeline-variant"
                >
                  Analytics
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>System</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/settings')}
                  style={styles.actionButton}
                  icon="cog"
                >
                  Settings
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/geofencing')}
                  style={styles.actionButton}
                  icon="map-marker-radius"
                >
                  Geofencing
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/logs')}
                  style={styles.actionButton}
                  icon="text-box-search"
                >
                  System Logs
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Future Pending Screens */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardHeader}>Future Pending Screens</Text>
            <View style={styles.actionsGrid}>
              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Service Management</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/service-requests')}
                  style={styles.actionButton}
                  icon="wrench"
                >
                  Service Requests
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/maintenance')}
                  style={styles.actionButton}
                  icon="tools"
                >
                  Maintenance
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/troubleshooting')}
                  style={styles.actionButton}
                  icon="bug"
                >
                  Troubleshooting
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Marketing & Support</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/marketing')}
                  style={styles.actionButton}
                  icon="bullhorn"
                >
                  Marketing Tools
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/support')}
                  style={styles.actionButton}
                  icon="headset"
                >
                  Support Center
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/notifications')}
                  style={styles.actionButton}
                  icon="bell"
                >
                  Notifications
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Financial</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/wallet')}
                  style={styles.actionButton}
                  icon="wallet"
                >
                  Wallet Management
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/referrals')}
                  style={styles.actionButton}
                  icon="account-multiple"
                >
                  Referral Program
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/payments')}
                  style={styles.actionButton}
                  icon="cash-multiple"
                >
                  Payment Processing
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>Energy Management</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/energy')}
                  style={styles.actionButton}
                  icon="lightning-bolt"
                >
                  Energy Consumption
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/sundaygrids')}
                  style={styles.actionButton}
                  icon="solar-panel"
                >
                  SundayGrids
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/inverters')}
                  style={styles.actionButton}
                  icon="power-plug"
                >
                  Inverter Management
                </Button>
              </View>

              <View style={styles.actionColumn}>
                <Text variant="titleSmall" style={styles.actionGroupTitle}>AI & Automation</Text>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/chatbot')}
                  style={styles.actionButton}
                  icon="robot"
                >
                  Chatbot Management
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/workflow')}
                  style={styles.actionButton}
                  icon="cog-sync"
                >
                  Workflow Automation
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => router.push('/(admin)/insights')}
                  style={styles.actionButton}
                  icon="brain"
                >
                  AI Insights
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Recent Projects */}
        <Card style={styles.card}>
          <Card.Title title="Recent Projects" />
          <Card.Content>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>ID</DataTable.Title>
                <DataTable.Title>Customer</DataTable.Title>
                <DataTable.Title>Type</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>
              {dashboardData.recentProjects.map((project) => (
                <DataTable.Row key={project.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{project.id.slice(0, 8)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{project.customer_id}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{project.project_type}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={[
                      styles.tableText,
                      project.status === 'active' ? styles.activeText :
                      project.status === 'installation' ? styles.installationText :
                      project.status === 'confirmed' ? styles.confirmedText :
                      styles.quoteText
                    ]}>
                      {project.status}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
        
        {/* Recent Service Requests */}
        <Card style={styles.card}>
          <Card.Title title="Recent Service Requests" />
          <Card.Content>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>ID</DataTable.Title>
                <DataTable.Title>Type</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Description</DataTable.Title>
              </DataTable.Header>
              {dashboardData.recentServiceRequests.map((request: ServiceRequest) => (
                <DataTable.Row key={request.id} style={styles.tableRow}>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{request.id.slice(0, 8)}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText}>{request.type}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={[
                      styles.tableText,
                      request.status === 'open' ? styles.quoteText :
                      request.status === 'assigned' ? styles.installationText :
                      request.status === 'in_progress' ? styles.activeText :
                      styles.confirmedText
                    ]}>
                      {request.status}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCell}>
                    <Text style={styles.tableText} numberOfLines={1} ellipsizeMode="tail">
                      {request.description}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
        
        {/* Menu for actions */}
        <Portal>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={{ x: 0, y: 0 }}
          >
            <Menu.Item onPress={() => handleAction('view')} title="View Details" />
            <Menu.Item onPress={() => handleAction('edit')} title="Edit" />
            <Menu.Item onPress={() => handleAction('delete')} title="Delete" />
          </Menu>
          
          <Dialog visible={dialogVisible} onDismiss={closeDialog}>
            <Dialog.Title>Confirm Action</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Are you sure you want to perform this action on {selectedItem?.name || 'this item'}?
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={closeDialog}>Cancel</Button>
              <Button onPress={closeDialog}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </View>
  );
} 