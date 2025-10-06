import { Container } from '@mantine/core';
import { Location } from '../../../../../types/models';
import { DataTable, useDataTable } from '../../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../../i18n';
import Head from 'next/head';
import { useDeleteLocation, usePurgeAsset, useRestoreAsset } from '@/mutations';

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
    dataType: 'locations',
  });

  const { mutate: deleteLocation } = useDeleteLocation({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeLocation } = usePurgeAsset('locations', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreLocation } = useRestoreAsset('locations', {
    onSuccess: () => {
      refresh();
    },
  });

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);

  const handleRowClick = (location: Location) => {
    router.push(`/admin/reference_data/locations/${location.id}`);
  };

  const handleEdit = (location: Location) => {
    console.log('Edit location:', location);
    // Implement edit functionality
  };

  const handleDelete = (location: Location) => {
    deleteLocation(location.id);
  };

  const handlePurge = (location: Location) => {
    purgeLocation(location.id);
  };

  const handleRestore = (location: Location) => {
    restoreLocation(location.id);
  };

  const handleCreate = () => {
    router.push('/admin/reference_data/locations/new');
  };

  const handleExport = () => {
    console.log('Export locations');
    // Implement export functionality
  };

  const handleBack = () => {
    router.push('/admin/reference_data');
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.locations')} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <DataTable<Location>
        dataType="locations"
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
        title={isRecycleBin ? t('datatable.recycleBinLocations') : t('datatable.locations')}
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
