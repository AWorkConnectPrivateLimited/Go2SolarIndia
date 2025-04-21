import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, Portal, Dialog, TextInput, Menu, IconButton, Chip, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { usersService } from '../../../src/services/supabase/users';
import { User, UserFormData, UserStatus } from '../../../src/types/user';
import { supabase } from '../../../src/services/supabase/client';
import Toast from 'react-native-toast-message';
import { hashPassword } from '../../../src/utils/passwordUtils';
import { usersService as simpleUsersService } from '../../../src/services/users';

export default function UsersScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    role: 'customer',
    phone: '',
    status: 'active'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching users from database...');
      
      const { data: usersData, error: usersError } = await simpleUsersService.getAll();
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }
      
      if (!usersData) {
        console.error('No users data returned');
        throw new Error('No users data returned');
      }

      console.log('Users data received:', usersData);
      
      // Validate the data structure
      const validUsers = usersData.filter(user => {
        if (!user.id || !user.email || !user.role) {
          console.warn('Invalid user data:', user);
          return false;
        }
        return true;
      });
      
      console.log(`Successfully filtered ${validUsers.length} valid users out of ${usersData.length} total`);
      setUsers(validUsers);
      setFilteredUsers(validUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filterUsers = () => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterUsers();
  };

  // Open add user dialog
  const openAddDialog = () => {
    setDialogType('add');
    setFormData({
      email: '',
      phone: '',
      full_name: '',
      role: 'customer',
      status: 'active'
    });
    setDialogVisible(true);
  };

  // Open edit user dialog
  const openEditDialog = (user: User) => {
    setDialogType('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      phone: user.phone || '',
      full_name: user.full_name,
      role: user.role,
      status: user.status,
    });
    setDialogVisible(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogVisible(false);
    setError(null);
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.full_name) {
      setError('Full name is required');
      return false;
    }
    if (!formData.phone) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.role) {
      setError('Role is required');
      return false;
    }
    return true;
  };

  // Handle save user
  const handleSave = async () => {
    try {
      if (!validateForm()) return;
      setIsSubmitting(true);
      setError(null);

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      // Create auth user with proper metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            role: formData.role,
            full_name: formData.full_name,
            phone: formData.phone,
            is_active: formData.status === 'active',
            password_hash: hashPassword(tempPassword)
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // The database trigger will automatically create the user record
      // We just need to refresh the users list
      await fetchUsers();
      
      setDialogVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User created successfully. Temporary password: ' + tempPassword,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open menu
  const openMenu = (user: User, event: any) => {
    setSelectedUser(user);
    setMenuAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };

  // Close menu
  const closeMenu = () => {
    setMenuVisible(false);
  };

  // Handle menu action
  const handleMenuAction = async (action: string) => {
    closeMenu();
    
    if (!selectedUser) return;
    
    try {
      switch (action) {
        case 'edit':
          openEditDialog(selectedUser);
          break;
        case 'delete':
          await usersService.deleteUser(selectedUser.id);
          await fetchUsers();
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'User deleted successfully',
          });
          break;
        case 'view':
          // Navigate to user details
          router.push(`/(admin)/users/${selectedUser.id}`);
          break;
        case 'toggle_status':
          await handleStatusChange(selectedUser.id, selectedUser.status);
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} user`);
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: UserStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await usersService.updateUser(userId, { status: newStatus });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      Toast.show({
        type: 'success',
        text1: 'Status updated successfully'
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update user status'
      });
    }
  };

  const renderUserStatus = (user: User) => (
    <TouchableOpacity
      onPress={() => handleStatusChange(user.id, user.status)}
      style={[
        styles.statusBadge,
        { backgroundColor: user.status === 'active' ? '#10B981' : '#EF4444' }
      ]}
    >
      <Text style={styles.statusText}>
        {user.status === 'active' ? 'Active' : 'Inactive'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchUsers}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium">User Management</Text>
          <Button
            mode="contained"
            onPress={openAddDialog}
            icon="plus"
          >
            Create User
          </Button>
        </View>

        {/* Search */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search users..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
            />
          </Card.Content>
        </Card>

        {/* Users Table */}
        <Card style={styles.tableCard}>
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title>Email</DataTable.Title>
                <DataTable.Title>Role</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredUsers.map((user) => (
                <DataTable.Row key={user.id}>
                  <DataTable.Cell>
                    <Text variant="bodyMedium">{user.full_name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Text variant="bodySmall">{user.email}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.roleChip,
                        { borderColor: theme.colors.primary }
                      ]}
                    >
                      {user.role}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    {renderUserStatus(user)}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={(event) => openMenu(user, event)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add/Edit User Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>{dialogType === 'add' ? 'Create New User' : 'Edit User'}</Dialog.Title>
          <Dialog.Content>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            <TextInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(text) => setFormData({...formData, full_name: text})}
              mode="outlined"
              style={styles.input}
              disabled={isSubmitting}
            />
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={isSubmitting || dialogType === 'edit'}
            />
            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              disabled={isSubmitting}
            />
            <View style={styles.roleContainer}>
              <Text variant="bodyMedium" style={styles.roleTitle}>Role</Text>
              <View style={styles.roleChips}>
                {(['customer', 'agent', 'admin'] as const).map((role) => (
                  <Chip
                    key={role}
                    selected={formData.role === role}
                    onPress={() => setFormData({...formData, role})}
                    style={styles.roleChip}
                    disabled={isSubmitting}
                  >
                    {role}
                  </Chip>
                ))}
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog} disabled={isSubmitting}>Cancel</Button>
            <Button 
              onPress={handleSave} 
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Menu */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={menuAnchor}
        >
          <Menu.Item
            onPress={() => handleMenuAction('view')}
            title="View Details"
            leadingIcon="eye"
          />
          <Menu.Item
            onPress={() => handleMenuAction('edit')}
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => handleMenuAction('toggle_status')}
            title={selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'}
            leadingIcon={selectedUser?.status === 'active' ? 'close-circle' : 'check-circle'}
          />
          <Menu.Item
            onPress={() => handleMenuAction('delete')}
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
  },
  tableCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleTitle: {
    marginBottom: 8,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleChip: {
    margin: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
}); 