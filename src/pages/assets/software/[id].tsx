import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover, Divider } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { useGroups, useSoftware } from '../../../fetchers';
import { useAddAssetToGroup, useRemoveAssetFromGroup, useUpdateSoftware, useDeleteSoftware } from '../../../mutations';
import { useTranslation } from '../../../hooks/useTranslation';
import React, { useCallback, useState } from 'react';
import Head from 'next/head';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

export default function EditSoftwarePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const swId = id ? Number(id) : undefined;

  const { data: software, isLoading, isError, mutate } = useSoftware(swId);

  const { data: groupsData, isLoading: groupsLoading } = useGroups({ page: 1, per_page: 1000 });

  const addAssetToGroupMutation = useAddAssetToGroup({ onSuccess: mutate });
  const removeAssetFromGroupMutation = useRemoveAssetFromGroup({ onSuccess: mutate });

  const updateSoftwareMutation = useUpdateSoftware({ onSuccess: mutate });
  const deleteSoftwareMutation = useDeleteSoftware({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('software');
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const canDelete = useHasPermission(PERMISSIONS.SOFTWARE_DELETE);

  const handleBack = () => router.push('/assets/software');

  const handleDelete = async () => {
    if (!swId) return;
    await deleteSoftwareMutation.mutate(swId);
    router.push('/assets/software');
  };

  const currentGroupItems: RelationshipItem[] = (software?.groups || []).map((g) => ({
    id: g.id,
    label: g.name,
  }));

  const availableGroupItems: RelationshipItem[] = (groupsData?.data || []).map((g: any) => ({
    id: g.id,
    label: g.name,
  }));

  const addGroups = useCallback(
    async (groupIds: (string | number)[]) => {
      if (!swId) return;
      
      const promises = groupIds.map((groupId) =>
        addAssetToGroupMutation.mutate({ groupId: Number(groupId), assetId: swId })
      );
      
      await Promise.all(promises);
    },
    [swId, addAssetToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!swId) return;
      
      await removeAssetFromGroupMutation.mutate({ 
        groupId: Number(groupId), 
        assetId: swId 
      });
    },
    [swId, removeAssetFromGroupMutation],
  );

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
    if (!swId) return;
    await updateSoftwareMutation.mutate({ id: swId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.software.edit.title', { name: software?.name || '' })} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <Stack>
          <Group align="center" justify="space-between">
            <Group>
              <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Title order={2}>{t('forms.software.edit.title', { name: software?.name || '' })}</Title>
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
          <Divider my="xs" />
          {software && (
            <DynamicEditForm
              resourceType="software"
              initialValues={software}
              onSubmit={handleSubmit}
              isSubmitting={updateSoftwareMutation.isLoading}
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
          loading={deleteSoftwareMutation.isLoading}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      </Container>
    </React.Fragment>
  );
}
