import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Button, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { useGroups, useNetworkDevice } from '../../../fetchers';
import { useAddAssetToGroup, useRemoveAssetFromGroup, useUpdateNetworkDevice, useDeleteNetworkDevice } from '../../../mutations';
import { useTranslation } from '../../../hooks/useTranslation';
import React, { useCallback, useState } from 'react';
import Head from 'next/head';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

export default function EditNetworkDevicePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const ndId = id ? Number(id) : undefined;

  const { data: device, isLoading, isError, mutate } = useNetworkDevice(ndId);

  const { data: groupsData, isLoading: groupsLoading } = useGroups({ page: 1, per_page: 1000 });

  const addAssetToGroupMutation = useAddAssetToGroup({ onSuccess: mutate });
  const removeAssetFromGroupMutation = useRemoveAssetFromGroup({ onSuccess: mutate });

  const updateNetworkDeviceMutation = useUpdateNetworkDevice({ onSuccess: mutate });
  const deleteNetworkDeviceMutation = useDeleteNetworkDevice({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('network_devices');
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const canDelete = useHasPermission(PERMISSIONS.NETWORK_DEVICE_DELETE);

  const currentGroupItems: RelationshipItem[] = (device?.groups || []).map((g) => ({
    id: g.id,
    label: g.name,
  }));

  const availableGroupItems: RelationshipItem[] = (groupsData?.data || []).map((g: any) => ({
    id: g.id,
    label: g.name,
  }));

  const addGroups = useCallback(
    async (groupIds: (string | number)[]) => {
      if (!ndId) return;

      const promises = groupIds.map((groupId) =>
        addAssetToGroupMutation.mutate({ groupId: Number(groupId), assetId: ndId })
      );

      await Promise.all(promises);
    },
    [ndId, addAssetToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!ndId) return;

      await removeAssetFromGroupMutation.mutate({
        groupId: Number(groupId),
        assetId: ndId
      });
    },
    [ndId, removeAssetFromGroupMutation],
  );

  const updateMutation = useUpdateNetworkDevice({ onSuccess: mutate });

  const handleBack = () => router.push('/assets/network_devices');

  const handleDelete = async () => {
    if (!ndId) return;
    await deleteNetworkDeviceMutation.mutate(ndId);
    router.push('/assets/network_devices');
  };

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (isError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleSubmit = async (values: Record<string, any>) => {
    if (!ndId) return;
    await updateMutation.mutate({ id: ndId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.network_device.edit.title', { name: device?.name || '' })} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <Stack>
          <Group align="center" justify="space-between">
            <Group>
              <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Title order={2}>{t('forms.network_device.edit.title', { name: device?.name || '' })}</Title>
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

          {device && (
            <DynamicEditForm
              resourceType="network_device"
              initialValues={device}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isLoading}
              relationshipOverrides={{
                groups: {
                  currentItems: currentGroupItems,
                  availableItems: availableGroupItems,
                  onAdd: addGroups,
                  onRemove: removeGroup,
                  loading: addAssetToGroupMutation.isLoading || removeAssetFromGroupMutation.isLoading,
                },
              }}
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
          loading={deleteNetworkDeviceMutation.isLoading}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      </Container>
    </React.Fragment>
  );
}
