import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../../components/RelationshipWidget';
import { useUser, useGroups, useLocation, useManufacturer, useOperatingSystem } from '../../../../fetchers';
import { useDeleteOperatingSystem, useUpdateOperatingSystem } from '../../../../mutations';
import React, { useCallback } from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import Head from 'next/head';
import { useState } from 'react';
import ConfirmModal from '../../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../../hooks/usePermissions';

export default function EditOperatingSystemPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const operatingSystemId = id ? Number(id) : undefined;

  const {
    data: operatingSystem,
    isLoading: operatingSystemLoading,
    isError: operatingSystemError,
    mutate: mutateOperatingSystem,
  } = useOperatingSystem(operatingSystemId);

  


  const updateOperatingSystemMutation = useUpdateOperatingSystem({ onSuccess: mutateOperatingSystem });
  const deleteOperatingSystemMutation = useDeleteOperatingSystem({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('operating_systems');
  const canDelete = useHasPermission(PERMISSIONS.OPERATING_SYSTEM_DELETE);

  const handleBack = () => {
    router.push('/admin/reference_data/operating_systems');
  };

  if (operatingSystemError) {
    handleBack();
  }

  const handleDeleteOperatingSystem = async () => {
    if (!operatingSystemId) return;
    await deleteOperatingSystemMutation.mutate(operatingSystemId);
    router.push('/admin/reference_data/operating_systems');
  };


  if (operatingSystemLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (operatingSystemError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!operatingSystemId) return;
    await updateOperatingSystemMutation.mutate({ id: operatingSystemId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.operatingSystem.edit.title', { name: operatingSystem?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center" justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.operatingSystem.edit.title', { name: operatingSystem?.name || '' })}</Title>
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
        {operatingSystem && (
          <DynamicEditForm
            resourceType="operating_system"
            initialValues={operatingSystem}
            onSubmit={handleFormSubmit}
            isSubmitting={updateOperatingSystemMutation.isLoading}
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
        loading={deleteOperatingSystemMutation.isLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteOperatingSystem}
      />
    </Container>
    </React.Fragment>
  );
} 