import { Container } from '@mantine/core';
import { Group } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../i18n';
import { Computer } from '../../../../types/models';
import Head from 'next/head';
import { useDeleteComputer, usePurgeAsset, useRestoreAsset } from '@/mutations';

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
    isRecycleBin,
    setRecycleBin,
  } = useDataTable<Computer>({
    dataType: 'computers',
  });

  const { mutate: deleteComputer } = useDeleteComputer({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeComputer } = usePurgeAsset('computers', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreComputer } = useRestoreAsset('computers', {
    onSuccess: () => {
      refresh();
    },
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
    deleteComputer(computer.id);
  };

  const handlePurge = (computer: Computer) => {
    purgeComputer(computer.id);
  };

  const handleRestore = (computer: Computer) => {
    restoreComputer(computer.id);
  };

  const handleCreate = () => {
    router.push('/assets/computers/new');
  };

  const handleExport = () => {
    console.log('Export computers');
    // Implement export functionality
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.computers')} - Digi Secure</title>
      </Head>
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
        onPurge={handlePurge}
        onRestore={handleRestore}
        selectable={true}
        title={isRecycleBin ? t('datatable.recycleBinComputers') : t('datatable.computers')}
        showSearch={true}
        showFilters={true}
        showActions={true}
        showPagination={true}
        showPageSizeSelector={true}
        showRefreshButton={true}
        showCreateButton={true}
        showExportButton={true}
        recycleBin={isRecycleBin}
        onRecycleBinChange={setRecycleBin}
      />
    </Container>
    </React.Fragment>
  );
}
