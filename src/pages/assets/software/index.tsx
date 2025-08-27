import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { DataTable, useDataTable } from '../../../../components/DataTable';
import { Software } from '../../../../types/models';
import { useLanguage } from '../../../../src/contexts/LanguageContext';
import { Container } from '@mantine/core';
import Head from 'next/head';
import { useDeleteSoftware, usePurgeAsset, useRestoreAsset } from '@/mutations';

const SoftwarePage: NextPage = () => {
  const { t } = useLanguage();
  const router = useRouter();

  const {
    data: softwares,
    paginatedData,
    isLoading,
    error,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    refresh,
    isRecycleBin,
    setRecycleBin,
  } = useDataTable<Software>({ dataType: 'software' });

  const { mutate: deleteSoftware } = useDeleteSoftware({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeSoftware } = usePurgeAsset('software', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreSoftware } = useRestoreAsset('software', {
    onSuccess: () => {
      refresh();
    },
  });

  const handleEdit = (s: Software) => router.push(`/assets/software/${s.id}`);
  const handleCreate = () => router.push('/assets/software/new');

  const handleDelete = (s: Software) => {
    deleteSoftware(s.id);
  };

  const handlePurge = (s: Software) => {
    purgeSoftware(s.id);
  };

  const handleRestore = (s: Software) => {
    restoreSoftware(s.id);
  };

  const errorMessage = error ? (typeof error === 'string' ? error : 'Error') : null;

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.software')} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <DataTable<Software>
          dataType="software"
          data={paginatedData?.data || softwares}
          paginatedData={paginatedData}
          isLoading={isLoading}
          error={errorMessage}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSortChange={(f,o)=>setSort(f as keyof Software,o)}
          onSearchChange={setSearch}
          onDelete={handleDelete}
          onRefresh={refresh}
          onEdit={handleEdit}
          onCreate={handleCreate}
          onRowClick={handleEdit}
          onPurge={handlePurge}
          onRestore={handleRestore}
          title={isRecycleBin ? t('datatable.recycleBinSoftware') : t('datatable.software')}
          showFilters={false}
          recycleBin={isRecycleBin}
          onRecycleBinChange={setRecycleBin}
        />
      </Container>
    </React.Fragment>
  );
};

export default SoftwarePage;
