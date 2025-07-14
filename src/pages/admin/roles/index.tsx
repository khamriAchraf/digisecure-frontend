import { Container } from '@mantine/core';
import { Role } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import { useEffect } from 'react';
import { t } from '../../../../i18n';

export default function AdminRolesPage() {
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

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);

  const handleView = (role: Role) => {
    console.log('View role:', role);
    // Implement view functionality
  };

  const handleEdit = (role: Role) => {
    console.log('Edit role:', role);
    // Implement edit functionality
  };

  const handleDelete = (role: Role) => {
    console.log('Delete role:', role);
    // Implement delete functionality
  };

  const handleCreate = () => {
    console.log('Create new role');
    // Implement create functionality
  };

  const handleExport = () => {
    console.log('Export roles');
    // Implement export functionality
  };

  return (
    <Container size="xl" py="md">
      <DataTable<Role>
        dataType="roles"
        data={paginatedData?.data || data}
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
        title={t('datatable.roles')}
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