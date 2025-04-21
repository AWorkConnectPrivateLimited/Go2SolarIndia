import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, Portal, Dialog, TextInput, Menu, IconButton, Chip, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { RolesService, RoleWithUserCount } from '../../../src/services/supabase/roles';
import { DatabaseError } from '../../../src/services/supabase/database';

// Available permissions
const availablePermissions = [
  'view_profile',
  'view_projects',
  'create_service_requests',
  'manage_service_requests',
  'view_customers',
  'manage_users',
  'manage_roles',
  'view_reports',
];

export default function RolesScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState<RoleWithUserCount[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<RoleWithUserCount[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [selectedRole, setSelectedRole] = useState<RoleWithUserCount | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // Initialize roles service
  const rolesService = new RolesService();

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch roles from the database
  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRoles = await rolesService.getRolesWithUserCount();
      setRoles(fetchedRoles);
      setFilteredRoles(fetchedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(error instanceof DatabaseError 
        ? `Database error: ${error.message}` 
        : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on search query
  const filterRoles = () => {
    if (searchQuery) {
      const filtered = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  };

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRoles();
  };

  // Open add role dialog
  const openAddDialog = () => {
    setDialogType('add');
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setDialogVisible(true);
  };

  // Open edit role dialog
  const openEditDialog = (role: RoleWithUserCount) => {
    setDialogType('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setDialogVisible(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogVisible(false);
  };

  // Handle save role
  const handleSave = async () => {
    try {
      if (dialogType === 'add') {
        await rolesService.createRole({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
      } else if (selectedRole) {
        await rolesService.updateRole(selectedRole.id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
      }
      
      // Refresh roles after saving
      await fetchRoles();
      closeDialog();
    } catch (error) {
      console.error('Error saving role:', error);
      setError(error instanceof DatabaseError 
        ? `Database error: ${error.message}` 
        : 'Failed to save role');
    }
  };

  // Open menu
  const openMenu = (role: RoleWithUserCount, event: any) => {
    setSelectedRole(role);
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
    
    if (!selectedRole) return;
    
    try {
      switch (action) {
        case 'edit':
          openEditDialog(selectedRole);
          break;
        case 'delete':
          await rolesService.deleteRole(selectedRole.id);
          await fetchRoles();
          break;
        case 'view':
          // Navigate to role details
          router.push(`/(admin)/users/roles/${selectedRole.id}`);
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      setError(error instanceof DatabaseError 
        ? `Database error: ${error.message}` 
        : `Failed to ${action} role`);
    }
  };

  // Toggle permission
  const togglePermission = (permission: string) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({
      ...formData,
      permissions: updatedPermissions,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading roles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchRoles}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium">Role Management</Text>
          <Button
            mode="contained"
            onPress={openAddDialog}
            icon="plus"
          >
            Create Role
          </Button>
        </View>

        {/* Search */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search roles..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
            />
          </Card.Content>
        </Card>

        {/* Roles Table */}
        <Card style={styles.tableCard}>
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Role Name</DataTable.Title>
                <DataTable.Title>Description</DataTable.Title>
                <DataTable.Title>Users</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredRoles.map((role) => (
                <DataTable.Row key={role.id}>
                  <DataTable.Cell>
                    <Text variant="bodyMedium">{role.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Text variant="bodySmall">{role.description}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Text variant="bodyMedium">{role.user_count}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={(event) => openMenu(role, event)}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add/Edit Role Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>{dialogType === 'add' ? 'Create New Role' : 'Edit Role'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Role Name"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
            />
            
            <Text variant="bodyMedium" style={styles.permissionsTitle}>Permissions</Text>
            <View style={styles.permissionsContainer}>
              {availablePermissions.map((permission) => (
                <Chip
                  key={permission}
                  selected={formData.permissions.includes(permission)}
                  onPress={() => togglePermission(permission)}
                  style={styles.permissionChip}
                >
                  {permission}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
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
  permissionsTitle: {
    marginBottom: 8,
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  permissionChip: {
    margin: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
}); 