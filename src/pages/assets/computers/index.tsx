import { Container } from '@mantine/core';
import { Group } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../i18n';
import { Computer } from '../../../../types/models';

export default function ComputersPage() {
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
  } = useDataTable<Computer>({
    dataType: 'computers',
  });

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);

  const handleRowClick = (computer: Computer) => {
    router.push(`/assets/computers/${computer.id}`);
  };

  const handleEdit = (computer: Computer) => {
    console.log('Edit computer:', computer);
    // Implement edit functionality
  };

  const handleDelete = (computer: Computer) => {
    console.log('Delete computer:', computer);
    // Implement delete functionality
  };

  const handleCreate = () => {
    router.push('/assets/computers/new');
  };

  const handleExport = () => {
    console.log('Export computers');
    // Implement export functionality
  };

  return (
    <Container size="xl" py="md">
      <DataTable<Computer>
        dataType="computers"
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
        title={t('datatable.computers')}
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
