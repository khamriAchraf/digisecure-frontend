import { Container } from '@mantine/core';
import { Location } from '../../../../../types/models';
import { DataTable, useDataTable } from '../../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../../i18n';
import Head from 'next/head';
import { useDeleteLocation, useDeleteOperatingSystem, usePurgeAsset, useRestoreAsset } from '@/mutations';
import { OperatingSystem } from '../../../../../types/models';

export default function OperatingSystemsPage() {
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
  } = useDataTable<OperatingSystem>({
    dataType: 'operating_systems',
  });

  const { mutate: deleteOperatingSystem } = useDeleteOperatingSystem({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeOperatingSystem } = usePurgeAsset('operating_systems', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreOperatingSystem } = useRestoreAsset('operating_systems', {
    onSuccess: () => {
      refresh();
    },
  });

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);

  const handleRowClick = (operatingSystem: OperatingSystem) => {
    router.push(`/admin/reference_data/operating_systems/${operatingSystem.id}`);
  };

  const handleEdit = (operatingSystem: OperatingSystem) => {
    console.log('Edit operatingSystem:', operatingSystem);
    // Implement edit functionality
  };

  const handleDelete = (operatingSystem: OperatingSystem) => {
    deleteOperatingSystem(operatingSystem.id);
  };

  const handlePurge = (operatingSystem: OperatingSystem) => {
    purgeOperatingSystem(operatingSystem.id);
  };

  const handleRestore = (operatingSystem: OperatingSystem) => {
    restoreOperatingSystem(operatingSystem.id);
  };

  const handleCreate = () => {
    router.push('/admin/reference_data/operating_systems/new');
  };

  const handleExport = () => {
    console.log('Export operatingSystems');
    // Implement export functionality
  };

  const handleBack = () => {
    router.push('/admin/reference_data');
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.operatingSystems')} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <DataTable<OperatingSystem>
        dataType="operating_systems"
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
        title={isRecycleBin ? t('datatable.recycleBinOperatingSystems') : t('datatable.operatingSystems')}
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
        onBack={handleBack}
      />
    </Container>
    </React.Fragment>
  );
}
