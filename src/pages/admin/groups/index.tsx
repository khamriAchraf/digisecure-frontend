import { Container } from '@mantine/core';
import { Group } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../i18n';
import Head from 'next/head';
import { useDeleteGroup, usePurgeGroup, useRestoreGroup } from '@/mutations';

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
    isRecycleBin,
    setRecycleBin,
  } = useDataTable<Group>({
    dataType: 'groups',
  });

  const { mutate: deleteGroup } = useDeleteGroup({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeGroup } = usePurgeGroup({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreGroup } = useRestoreGroup({
    onSuccess: () => {
      refresh();
    },
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
    deleteGroup(group.id);
  };

  const handleCreate = () => {
    router.push('/admin/groups/new');
  };

  const handlePurge = (group: Group) => {
    purgeGroup(group.id);
  };

  const handleRestore = (group: Group) => {
    restoreGroup(group.id);
  };

  const handleExport = () => {
    console.log('Export groups');
    // Implement export functionality
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.groups')} - Digi Secure</title>
      </Head>
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
        onPurge={handlePurge}
        onRestore={handleRestore}
        selectable={true}
        title={isRecycleBin ? t('datatable.recycleBinGroups') : t('datatable.groups')}
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
