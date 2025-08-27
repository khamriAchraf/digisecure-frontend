import { Container } from '@mantine/core';
import { User } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { t } from '../../../../i18n';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useDeleteUser, usePurgeUser, useRestoreUser } from '../../../mutations';

export default function AdminUsersPage() {
  const router = useRouter();
  const { mutate: deleteUser } = useDeleteUser({
    onSuccess: () => {
      refresh();
    },
  });
  const { mutate: purgeUser } = usePurgeUser({
    onSuccess: () => {
      refresh();
    },
  });
  const { mutate: restoreUser } = useRestoreUser({
    onSuccess: () => {
      refresh();
    },
  });
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
    deleteUser(user.id);
  };

  const handleBulkDelete = (users: User[]) => {
    users.forEach((u) => deleteUser(u.id));
  };

  const handleCreate = () => {
    router.push('/admin/users/new');
  };

  const handlePurge = (user: User) => {
    purgeUser(user.id);
  };

  const handleRestore = (user: User) => {
    restoreUser(user.id);
  };

  const handleBulkRestore = (users: User[]) => {
    users.forEach((u) => restoreUser(u.id));
  };

  const handleBulkPurge = (users: User[]) => {
    users.forEach((u) => purgeUser(u.id));
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
          onBulkDelete={handleBulkDelete}
          onCreate={handleCreate}
          onExport={handleExport}
          selectable={true}
          title={isRecycleBin ? t('datatable.recycleBinUsers') : t('datatable.users')}
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
          onPurge={handlePurge}
          onRestore={handleRestore}
          onBulkRestore={handleBulkRestore}
          onBulkPurge={handleBulkPurge}
        />
      </Container>
    </React.Fragment>
  );
}
