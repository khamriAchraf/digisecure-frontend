import React, { useState } from 'react';
import { Container, Tabs, Button, Group, Text, Alert, Modal, Stack, TextInput, Select } from '@mantine/core';
import { IconAlertCircle, IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { DataTable, useDataTable, DataType } from './index';
import { User, Role, Group, Asset } from '../../types/models';

// Example component for Users
function UsersTable() {
  const {
    data,
    paginatedData,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortOrder,
    searchQuery,
    filters,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilters,
    clearFilters,
    refresh,
    selectedItems,
    setSelectedItems,
  } = useDataTable<User>({
    dataType: 'users',
    initialPageSize: 20,
  });

  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewModalOpened(true);
  };

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
    // Implement edit functionality
  };

  const handleDelete = (user: User) => {
    console.log('Delete user:', user);
    // Implement delete functionality
  };

  const handleCreate = () => {
    console.log('Create new user');
    // Implement create functionality
  };

  const handleExport = () => {
    console.log('Export users');
    // Implement export functionality
  };

  return (
    <>
      <DataTable<User>
        dataType="users"
        data={data}
        paginatedData={paginatedData}
        isLoading={isLoading}
        error={error?.message}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={setSort}
        onSearchChange={setSearch}
        onFilterChange={setFilters}
        onRefresh={refresh}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onExport={handleExport}
        selectable={true}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        title="Users Management"
        showSearch={true}
        showFilters={true}
        showActions={true}
        showPagination={true}
        showPageSizeSelector={true}
        showRefreshButton={true}
        showCreateButton={true}
        showExportButton={true}
      />

      {/* View User Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <Stack>
            <Text><strong>ID:</strong> {selectedUser.id}</Text>
            <Text><strong>Full Name:</strong> {selectedUser.full_name || 'N/A'}</Text>
            <Text><strong>Username:</strong> {selectedUser.username}</Text>
            <Text><strong>Email:</strong> {selectedUser.email}</Text>
            <Text><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</Text>
            <Text><strong>Location:</strong> {selectedUser.location || 'N/A'}</Text>
            <Text><strong>Status:</strong> {selectedUser.status}</Text>
          </Stack>
        )}
      </Modal>
    </>
  );
}

// Example component for Roles
function RolesTable() {
  const {
    data,
    paginatedData,
    isLoading,
    error,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilters,
    refresh,
  } = useDataTable<Role>({
    dataType: 'roles',
  });

  const handleEdit = (role: Role) => {
    console.log('Edit role:', role);
  };

  const handleDelete = (role: Role) => {
    console.log('Delete role:', role);
  };

  const handleCreate = () => {
    console.log('Create new role');
  };

  return (
    <DataTable<Role>
      dataType="roles"
      data={data}
      paginatedData={paginatedData}
      isLoading={isLoading}
      error={error?.message}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortChange={setSort}
      onSearchChange={setSearch}
      onFilterChange={setFilters}
      onRefresh={refresh}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      title="Roles Management"
    />
  );
}

// Example component for Groups
function GroupsTable() {
  const {
    data,
    paginatedData,
    isLoading,
    error,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilters,
    refresh,
  } = useDataTable<Group>({
    dataType: 'groups',
  });

  const handleEdit = (group: Group) => {
    console.log('Edit group:', group);
  };

  const handleDelete = (group: Group) => {
    console.log('Delete group:', group);
  };

  const handleCreate = () => {
    console.log('Create new group');
  };

  return (
    <DataTable<Group>
      dataType="groups"
      data={data}
      paginatedData={paginatedData}
      isLoading={isLoading}
      error={error?.message}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortChange={setSort}
      onSearchChange={setSearch}
      onFilterChange={setFilters}
      onRefresh={refresh}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      title="Groups Management"
    />
  );
}

// Example component for Assets
function AssetsTable() {
  const {
    data,
    paginatedData,
    isLoading,
    error,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilters,
    refresh,
  } = useDataTable<Asset>({
    dataType: 'assets',
  });

  const handleEdit = (asset: Asset) => {
    console.log('Edit asset:', asset);
  };

  const handleDelete = (asset: Asset) => {
    console.log('Delete asset:', asset);
  };

  const handleCreate = () => {
    console.log('Create new asset');
  };

  return (
    <DataTable<Asset>
      dataType="assets"
      data={data}
      paginatedData={paginatedData}
      isLoading={isLoading}
      error={error?.message}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortChange={setSort}
      onSearchChange={setSearch}
      onFilterChange={setFilters}
      onRefresh={refresh}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      title="Assets Management"
    />
  );
}

// Main example component
export function DataTableExample() {
  return (
    <Container size="xl" py="md">
      <Tabs defaultValue="users">
        <Tabs.List>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="roles">Roles</Tabs.Tab>
          <Tabs.Tab value="groups">Groups</Tabs.Tab>
          <Tabs.Tab value="assets">Assets</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pt="md">
          <UsersTable />
        </Tabs.Panel>

        <Tabs.Panel value="roles" pt="md">
          <RolesTable />
        </Tabs.Panel>

        <Tabs.Panel value="groups" pt="md">
          <GroupsTable />
        </Tabs.Panel>

        <Tabs.Panel value="assets" pt="md">
          <AssetsTable />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 