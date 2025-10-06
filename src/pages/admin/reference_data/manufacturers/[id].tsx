import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../../components/RelationshipWidget';
import { useUser, useGroups, useLocation, useManufacturer } from '../../../../fetchers';
import { useAddUserToGroup, useRemoveUserFromGroup, useUpdateLocation, useDeleteLocation, useDeleteManufacturer, useUpdateManufacturer } from '../../../../mutations';
import React, { useCallback } from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import Head from 'next/head';
import { useState } from 'react';
import ConfirmModal from '../../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../../hooks/usePermissions';

export default function EditManufacturerPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const manufacturerId = id ? Number(id) : undefined;

  const {
    data: manufacturer,
    isLoading: manufacturerLoading,
    isError: manufacturerError,
    mutate: mutateManufacturer,
  } = useManufacturer(manufacturerId);

  


  const updateManufacturerMutation = useUpdateManufacturer({ onSuccess: mutateManufacturer });
  const deleteManufacturerMutation = useDeleteManufacturer({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('users');
  const canDelete = useHasPermission(PERMISSIONS.MANUFACTURER_DELETE);

  const handleBack = () => {
    router.push('/admin/reference_data/manufacturers');
  };

  if (manufacturerError) {
    handleBack();
  }

  const handleDeleteManufacturer = async () => {
    if (!manufacturerId) return;
    await deleteManufacturerMutation.mutate(manufacturerId);
    router.push('/admin/reference_data/manufacturers');
  };


  if (manufacturerLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (manufacturerError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!manufacturerId) return;
    await updateManufacturerMutation.mutate({ id: manufacturerId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.manufacturer.edit.title', { name: manufacturer?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center" justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.manufacturer.edit.title', { name: manufacturer?.name || '' })}</Title>
          </Group>
          {canDelete && (
            <Popover opened={deletePopoverOpened} withArrow>
              <Popover.Target>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  onMouseEnter={() => setDeletePopoverOpened(true)}
                  onMouseLeave={() => setDeletePopoverOpened(false)}
                  onClick={() => setConfirmOpen(true)}
                  aria-label={t('common.delete')}
                >
                  <IconTrash size={20} />   
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="sm">{t('common.delete')}</Text>
              </Popover.Dropdown>
            </Popover>
          )}
        </Group>

        {/* Dynamic Edit Form */}
        {manufacturer && (
          <DynamicEditForm
            resourceType="manufacturer"
            initialValues={manufacturer}
            onSubmit={handleFormSubmit}
            isSubmitting={updateManufacturerMutation.isLoading}
          />
        )}
      </Stack>
      <ConfirmModal
        opened={confirmOpen}
        title={t(deleteTitleKey)}
        message={t(deleteMessageKey)}
        confirmLabel={t(confirmKey)}
        cancelLabel={t(cancelKey)}
        confirmColor="red"
        loading={deleteManufacturerMutation.isLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteManufacturer}
        showImpactedAssets={true}
        resourceType="manufacturer"
        resourceId={manufacturerId}
        resourceName={manufacturer?.name}
      />
    </Container>
    </React.Fragment>
  );
} 