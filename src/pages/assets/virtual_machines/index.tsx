import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { DataTable, useDataTable } from '../../../../components/DataTable';
import { VirtualMachine } from '../../../../types/models';
import { useLanguage } from '../../../../src/contexts/LanguageContext';
import { Container } from '@mantine/core';
import Head from 'next/head';

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
  } = useDataTable<VirtualMachine>({
    dataType: 'virtual_machines',
  });

  const handleEdit = (vm: VirtualMachine) => {
    router.push(`/assets/virtual_machines/${vm.id}`);
  };

  const handleDelete = (vm: VirtualMachine) => {
    console.log('Delete:', vm);
    // Implement delete logic here
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
        title={t('datatable.virtual_machines')}
        showSearch={true}
        showFilters={false}
        showActions={true}
        showPagination={true}
        showPageSizeSelector={true}
        showRefreshButton={true}
        showCreateButton={true}
        showExportButton={true}
      /></Container>
    </React.Fragment>
  );
};

export default VirtualMachinesPage; 