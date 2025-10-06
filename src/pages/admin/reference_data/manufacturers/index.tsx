import { Container } from '@mantine/core';
import { Location, Manufacturer } from '../../../../../types/models';
import { DataTable, useDataTable } from '../../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../../i18n';
import Head from 'next/head';
import { useDeleteManufacturer, usePurgeAsset, useRestoreAsset } from '@/mutations';

export default function LocationsPage() {
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
  } = useDataTable<Location>({
    dataType: 'manufacturers',
  });

  const { mutate: deleteManufacturer } = useDeleteManufacturer({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeManufacturer } = usePurgeAsset('manufacturers', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreManufacturer } = useRestoreAsset('manufacturers', {
    onSuccess: () => {
      refresh();
    },
  });

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);

  const handleRowClick = (manufacturer: Manufacturer) => {
    router.push(`/admin/reference_data/manufacturers/${manufacturer.id}`);
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    console.log('Edit manufacturer:', manufacturer);
    // Implement edit functionality
  };

  const handleDelete = (manufacturer: Manufacturer) => {
    deleteManufacturer(manufacturer.id);
  };

  const handlePurge = (manufacturer: Manufacturer) => {
    purgeManufacturer(manufacturer.id);
  };

  const handleRestore = (manufacturer: Manufacturer) => {
    restoreManufacturer(manufacturer.id);
  };

  const handleCreate = () => {
    router.push('/admin/reference_data/manufacturers/new');
  };

  const handleExport = () => {
    console.log('Export manufacturers');
    // Implement export functionality
  };

  const handleBack = () => {
    router.push('/admin/reference_data');
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.manufacturers')} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <DataTable<Manufacturer>
        dataType="manufacturers"
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
        title={isRecycleBin ? t('datatable.recycleBinManufacturers') : t('datatable.manufacturers')}
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
