import { Container } from '@mantine/core';
import { CertificateKey } from '../../../../types/models';
import { DataTable, useDataTable } from '../../../../components/DataTable/index';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { t } from '../../../../i18n';
import Head from 'next/head';
import { useDeleteCertificateKey, usePurgeAsset, useRestoreAsset } from '@/mutations';

export default function CertificatesKeysPage() {
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
  } = useDataTable<CertificateKey>({
    dataType: 'certificate_keys',
  });

  const { mutate: deleteCertificateKey } = useDeleteCertificateKey({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeCertificateKey } = usePurgeAsset('certificate_keys', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreCertificateKey } = useRestoreAsset('certificate_keys', {
    onSuccess: () => {
      refresh();
    },
  });

  useEffect(() => {
    console.log('paginatedData', paginatedData);
  }, [paginatedData]);

  const handleRowClick = (certificateKey: CertificateKey) => {
    router.push(`/assets/certificates_keys/${certificateKey.id}`);
  };

  const handleEdit = (certificateKey: CertificateKey) => {
    console.log('Edit certificate key:', certificateKey);
    // Implement edit functionality
  };

  const handleDelete = (certificateKey: CertificateKey) => {
    deleteCertificateKey(certificateKey.id);
  };

  const handlePurge = (certificateKey: CertificateKey) => {
    purgeCertificateKey(certificateKey.id);
  };

  const handleRestore = (certificateKey: CertificateKey) => {
    restoreCertificateKey(certificateKey.id);
  };

  const handleCreate = () => {
    router.push('/assets/certificates_keys/new');
  };

  const handleExport = () => {
    console.log('Export certificate keys');
    // Implement export functionality
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.certificate_keys')} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <DataTable<CertificateKey>
        dataType="certificate_keys"
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
        title={isRecycleBin ? t('datatable.recycleBinCertificateKeys') : t('datatable.certificate_keys')}
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
