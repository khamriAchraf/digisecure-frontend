import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useComputer, useGroups } from '../../../fetchers';
import { useAddAssetToGroup, useRemoveAssetFromGroup, useUpdateComputer, useDeleteComputer } from '../../../mutations';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Head from 'next/head';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

export default function EditComputerPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const computerId = id ? Number(id) : undefined;

  const {
    data: computer,
    isLoading: computerLoading,
    isError: computerError,
    mutate: mutateComputer,
  } = useComputer(computerId);


  // Fetch all groups (large page size to avoid pagination)
  const { data: groupsData, isLoading: groupsLoading } = useGroups({ page: 1, per_page: 1000 });

  const addAssetToGroupMutation = useAddAssetToGroup({ onSuccess: mutateComputer });
  const removeAssetFromGroupMutation = useRemoveAssetFromGroup({ onSuccess: mutateComputer });

  const updateComputerMutation = useUpdateComputer({ onSuccess: mutateComputer });
  const deleteComputerMutation = useDeleteComputer({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('computers');
  const canDelete = useHasPermission(PERMISSIONS.COMPUTER_DELETE);

  const handleBack = () => {
    router.push('/assets/computers');
  };

  const handleDelete = async () => {
    if (!computerId) return;
    await deleteComputerMutation.mutate(computerId);
    router.push('/assets/computers');
  };

  const currentGroupItems: RelationshipItem[] = (computer?.groups || []).map((g) => ({
    id: g.id,
    label: g.name,
  }));

  const availableGroupItems: RelationshipItem[] = (groupsData?.data || []).map((g: any) => ({
    id: g.id,
    label: g.name,
  }));

  const addGroups = useCallback(
    async (groupIds: (string | number)[]) => {
      if (!computerId) return;
      
      // Add user to each group individually
      const promises = groupIds.map((groupId) =>
        addAssetToGroupMutation.mutate({ groupId: Number(groupId), assetId: computerId })
      );
      
      await Promise.all(promises);
    },
    [computerId, addAssetToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!computerId) return;
      
      await removeAssetFromGroupMutation.mutate({ 
        groupId: Number(groupId), 
        assetId: computerId 
      });
    },
    [computerId, removeAssetFromGroupMutation],
  );

  if (computerLoading || groupsLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (computerError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!computerId) return;
    await updateComputerMutation.mutate({ id: computerId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.computer.edit.title', { name: computer?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center" justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.computer.edit.title', { name: computer?.name || '' })}</Title>
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
        {computer && (
          <DynamicEditForm
            resourceType="computer"
            initialValues={computer}
            onSubmit={handleFormSubmit}
            isSubmitting={updateComputerMutation.isLoading}
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
        loading={deleteComputerMutation.isLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Container>
    </React.Fragment>
  );
} 