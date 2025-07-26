import { Container } from '@mantine/core';
import { Group } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../i18n';

export default function AdminGroupsPage() {
  const router = useRouter();
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

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);

  const handleRowClick = (group: Group) => {
    router.push(`/admin/groups/${group.id}`);
  };

  const handleEdit = (group: Group) => {
    console.log('Edit group:', group);
    // Implement edit functionality
  };

  const handleDelete = (group: Group) => {
    console.log('Delete group:', group);
    // Implement delete functionality
  };

  const handleCreate = () => {
    router.push('/admin/groups/new');
  };

  const handleExport = () => {
    console.log('Export groups');
    // Implement export functionality
  };

  return (
    <Container size="xl" py="md">
      <DataTable<Group>
        dataType="groups"
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
        onEdit={handleEdit}
        onRowClick={handleRowClick}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onExport={handleExport}
        selectable={true}
        title={t('datatable.groups')}
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
