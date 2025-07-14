import { Container } from '@mantine/core';
import { User } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import { useEffect } from 'react';

export default function AdminUsersPage() {
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
  } = useDataTable<User>({
    dataType: 'users',
    initialPageSize: 20,
  });

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);


  const handleView = (user: User) => {
    console.log('View user:', user);
    // Implement view functionality
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
    <Container size="xl" py="md">
      <DataTable<User>
        dataType="users"
        data={paginatedData?.data || data}
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
    </Container>
  );
}
