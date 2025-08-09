import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useVirtualMachine, useGroups } from '../../../fetchers';
import { useAddAssetToGroup, useRemoveAssetFromGroup, useUpdateVirtualMachine, useDeleteVirtualMachine } from '../../../mutations';
import React, { useCallback, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Head from 'next/head';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

export default function EditVirtualMachinePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const vmId = id ? Number(id) : undefined;

  const {
    data: vm,
    isLoading: vmLoading,
    isError: vmError,
    mutate: mutateVm,
  } = useVirtualMachine(vmId);

  // Fetch all groups (large page size to avoid pagination)
  const { data: groupsData, isLoading: groupsLoading } = useGroups({ page: 1, per_page: 1000 });

  const addAssetToGroupMutation = useAddAssetToGroup({ onSuccess: mutateVm });
  const removeAssetFromGroupMutation = useRemoveAssetFromGroup({ onSuccess: mutateVm });

  const updateVMMutation = useUpdateVirtualMachine({ onSuccess: mutateVm });
  const deleteVMMutation = useDeleteVirtualMachine({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('virtual_machines');
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const canDelete = useHasPermission(PERMISSIONS.VIRTUAL_MACHINE_DELETE);

  const handleBack = () => {
    router.push('/assets/virtual_machines');
  };

  const handleDelete = async () => {
    if (!vmId) return;
    await deleteVMMutation.mutate(vmId);
    router.push('/assets/virtual_machines');
  };

  const currentGroupItems: RelationshipItem[] = (vm?.groups || []).map((g) => ({
    id: g.id,
    label: g.name,
  }));

  const availableGroupItems: RelationshipItem[] = (groupsData?.data || []).map((g: any) => ({
    id: g.id,
    label: g.name,
  }));

  const addGroups = useCallback(
    async (groupIds: (string | number)[]) => {
      if (!vmId) return;
      
      const promises = groupIds.map((groupId) =>
        addAssetToGroupMutation.mutate({ groupId: Number(groupId), assetId: vmId })
      );
      
      await Promise.all(promises);
    },
    [vmId, addAssetToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!vmId) return;
      
      await removeAssetFromGroupMutation.mutate({ 
        groupId: Number(groupId), 
        assetId: vmId 
      });
    },
    [vmId, removeAssetFromGroupMutation],
  );

  if (vmLoading || groupsLoading) {
    return (
        <Group justify="center" py="xl">
            <Loader />
        </Group>
    );
  }

  if (vmError) {
    return (
        <Container size="sm" py="xl">
            <Text c="red">{t('common.error')}</Text>
        </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!vmId) return;
    await updateVMMutation.mutate({ id: vmId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.virtual_machine.edit.title', { name: vm?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
        <Stack>
            {/* Header */}
            <Group align="center" justify="space-between">
              <Group>
                <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
                    <IconArrowLeft size={20} />
                </ActionIcon>
                <Title order={2}>{t('forms.virtual_machine.edit.title', { name: vm?.name || '' })}</Title>
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
            {vm && (
            <DynamicEditForm
                resourceType="virtual_machine"
                initialValues={vm}
                onSubmit={handleFormSubmit}
                isSubmitting={updateVMMutation.isLoading}
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
          loading={deleteVMMutation.isLoading}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
        </Container>
    </React.Fragment>
  );
} 