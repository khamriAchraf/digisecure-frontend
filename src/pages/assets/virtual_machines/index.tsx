import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { DataTable, useDataTable } from '../../../../components/DataTable';
import { VirtualMachine } from '../../../../types/models';
import { useLanguage } from '../../../../src/contexts/LanguageContext';
import { Container } from '@mantine/core';
import Head from 'next/head';
import { useDeleteVirtualMachine, usePurgeAsset, useRestoreAsset } from '@/mutations';

const VirtualMachinesPage: NextPage = () => {
  const { t } = useLanguage();
  const router = useRouter();

  const {
    data: virtualMachines,
    paginatedData,
    isLoading,
    error,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    refresh,
    isRecycleBin,
    setRecycleBin,
  } = useDataTable<VirtualMachine>({
    dataType: 'virtual_machines',
  });

  const { mutate: deleteVirtualMachine } = useDeleteVirtualMachine({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeVirtualMachine } = usePurgeAsset('virtual_machines', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreVirtualMachine } = useRestoreAsset('virtual_machines', {
    onSuccess: () => {
      refresh();
    },
  });

  const handleEdit = (vm: VirtualMachine) => {
    router.push(`/assets/virtual_machines/${vm.id}`);
  };

  const handleDelete = (vm: VirtualMachine) => {
    deleteVirtualMachine(vm.id);
  };

  const handlePurge = (vm: VirtualMachine) => {
    purgeVirtualMachine(vm.id);
  };

  const handleRestore = (vm: VirtualMachine) => {
    restoreVirtualMachine(vm.id);
  };

  const handleCreate = () => {
    router.push('/assets/virtual_machines/new');
  };

  // Convert error to string for DataTable
  const errorMessage = error ? (typeof error === 'string' ? error : 'An error occurred while loading data') : null;

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.virtual_machines')} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <DataTable<VirtualMachine>
        dataType="virtual_machines"
        data={paginatedData?.data || virtualMachines}
        paginatedData={paginatedData}
        isLoading={isLoading}
        error={errorMessage}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={(field, order) => setSort(field as keyof VirtualMachine, order)}
        onSearchChange={setSearch}
        onRefresh={refresh}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onRowClick={handleEdit}
        onPurge={handlePurge}
        onRestore={handleRestore}
        title={isRecycleBin ? t('datatable.recycleBinVirtualMachines') : t('datatable.virtual_machines')}
        showSearch={true}
        showFilters={false}
        showActions={true}
        showPagination={true}
        showPageSizeSelector={true}
        showRefreshButton={true}
        showCreateButton={true}
        showExportButton={true}
        recycleBin={isRecycleBin}
        onRecycleBinChange={setRecycleBin}
      /></Container>
    </React.Fragment>
  );
};

export default VirtualMachinesPage; 