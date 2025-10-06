import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../../components/RelationshipWidget';
import { useUser, useGroups, useLocation } from '../../../../fetchers';
import { useAddUserToGroup, useRemoveUserFromGroup, useUpdateLocation, useDeleteLocation } from '../../../../mutations';
import React, { useCallback } from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import Head from 'next/head';
import { useState } from 'react';
import ConfirmModal from '../../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../../hooks/usePermissions';

export default function EditUserPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const locationId = id ? Number(id) : undefined;

  const {
    data: location,
    isLoading: locationLoading,
    isError: locationError,
    mutate: mutateLocation,
  } = useLocation(locationId);

  


  const updateLocationMutation = useUpdateLocation({ onSuccess: mutateLocation });
  const deleteLocationMutation = useDeleteLocation({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('users');
  const canDelete = useHasPermission(PERMISSIONS.LOCATION_DELETE);

  const handleBack = () => {
    router.push('/admin/reference_data/locations');
  };

  if (locationError) {
    handleBack();
  }

  const handleDeleteLocation = async () => {
    if (!locationId) return;
    await deleteLocationMutation.mutate(locationId);
    router.push('/admin/reference_data/locations');
  };


  if (locationLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (locationError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!locationId) return;
    await updateLocationMutation.mutate({ id: locationId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.location.edit.title', { name: location?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center" justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.location.edit.title', { name: location?.name || '' })}</Title>
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
        {location && (
          <DynamicEditForm
            resourceType="location"
            initialValues={location}
            onSubmit={handleFormSubmit}
            isSubmitting={updateLocationMutation.isLoading}
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
        loading={deleteLocationMutation.isLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteLocation}
        showImpactedAssets={true}
        resourceType="location"
        resourceId={locationId}
        resourceName={location?.name}
      />
    </Container>
    </React.Fragment>
  );
} 