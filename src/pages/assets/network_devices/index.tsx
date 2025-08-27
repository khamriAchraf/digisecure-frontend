import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { DataTable, useDataTable } from '../../../../components/DataTable';
import { NetworkDevice } from '../../../../types/models';
import { useLanguage } from '../../../../src/contexts/LanguageContext';
import { Container } from '@mantine/core';
import Head from 'next/head';
import { useDeleteNetworkDevice, usePurgeAsset, useRestoreAsset } from '@/mutations';

const NetworkDevicesPage: NextPage = () => {
  const { t } = useLanguage();
  const router = useRouter();

  const {
    data: networkDevices,
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
  } = useDataTable<NetworkDevice>({
    dataType: 'network_devices',
  });

  const { mutate: deleteNetworkDevice } = useDeleteNetworkDevice({
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: purgeNetworkDevice } = usePurgeAsset('network_devices', {
    onSuccess: () => {
      refresh();
    },
  });

  const { mutate: restoreNetworkDevice } = useRestoreAsset('network_devices', {
    onSuccess: () => {
      refresh();
    },
  });

  const handleEdit = (nd: NetworkDevice) => {
    router.push(`/assets/network_devices/${nd.id}`);
  };

  const handleCreate = () => {
    router.push('/assets/network_devices/new');
  };

  const handleDelete = (nd: NetworkDevice) => {
    deleteNetworkDevice(nd.id);
  };

  const handlePurge = (nd: NetworkDevice) => {
    purgeNetworkDevice(nd.id);
  };

  const handleRestore = (nd: NetworkDevice) => {
    restoreNetworkDevice(nd.id);
  };

  const errorMessage = error ? (typeof error === 'string' ? error : 'Error loading data') : null;

  return (
    <React.Fragment>
      <Head>
        <title>{t('datatable.network_devices')} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <DataTable<NetworkDevice>
        dataType="network_devices"
        data={paginatedData?.data || networkDevices}
        paginatedData={paginatedData}
        isLoading={isLoading}
        error={errorMessage}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={(field, order) => setSort(field as keyof NetworkDevice, order)}
        onSearchChange={setSearch}
        onDelete={handleDelete}
        onRefresh={refresh}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onRowClick={handleEdit}
        onPurge={handlePurge}
        onRestore={handleRestore}
        title={isRecycleBin ? t('datatable.recycleBinNetworkDevices') : t('datatable.network_devices')}
        showFilters={false}
        recycleBin={isRecycleBin}
        onRecycleBinChange={setRecycleBin}
      />
    </Container>
    </React.Fragment>
  );
};

export default NetworkDevicesPage;
