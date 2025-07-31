import { Container } from '@mantine/core';
import { User } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { t } from '../../../../i18n';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminUsersPage() {
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
  } = useDataTable<User>({
    dataType: 'users',
  });

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);


  const handleRowClick = (user: User) => {
    router.push(`/admin/users/${user.id}`);
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
    router.push('/admin/users/new');
  };

  const handleExport = () => {
    console.log('Export users');
    // Implement export functionality
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.users')} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <DataTable<User>
          dataType="users"
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
          title={t('datatable.users')}
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
    </React.Fragment>
  );
}
