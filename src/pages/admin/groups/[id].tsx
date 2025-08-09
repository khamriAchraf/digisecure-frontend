import { Container, Title, Stack, Loader, Text, Group as MantineGroup, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useGroup, useUsers, useAssets } from '../../../fetchers';
import {
  useAddUserToGroup,
  useRemoveUserFromGroup,
  useAddAssetToGroup,
  useRemoveAssetFromGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '../../../mutations';
import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Asset, User } from '../../../../types';
import Head from 'next/head';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

export default function EditGroupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const groupId = id ? Number(id) : undefined;

  const {
    data: group,
    isLoading: groupLoading,
    isError: groupError,
    mutate: mutateGroup,
  } = useGroup(groupId);

  // Remove static fetch; we'll use server-side search instead

  const addUserMutation = useAddUserToGroup({ onSuccess: mutateGroup });
  const removeUserMutation = useRemoveUserFromGroup({ onSuccess: mutateGroup });

  const addAssetMutation = useAddAssetToGroup({ onSuccess: mutateGroup });
  const removeAssetMutation = useRemoveAssetFromGroup({ onSuccess: mutateGroup });

  const updateGroupMutation = useUpdateGroup({ onSuccess: mutateGroup });
  const deleteGroupMutation = useDeleteGroup({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('groups');
  const canDelete = useHasPermission(PERMISSIONS.GROUP_DELETE);

  // Search state for available users (debounced)
  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState(userSearch);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [userSearch]);
  const { data: usersData, isLoading: usersLoading } = useUsers({ page: 1, per_page: 1000, search: debouncedUserSearch });

  // 1. Local cache of every user option we ever received
  const [allUserOptions, setAllUserOptions] = useState<User[]>([]);

  // Asset search state (debounced)
  const [assetSearch, setAssetSearch] = useState('');
  const [debouncedAssetSearch, setDebouncedAssetSearch] = useState(assetSearch);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedAssetSearch(assetSearch), 300);
    return () => clearTimeout(handler);
  }, [assetSearch]);

  // Fetch assets from the backend
  const { data: assetsData, isLoading: assetsLoading } = useAssets({ page: 1, per_page: 1000, search: debouncedAssetSearch });

  // Local cache of assets we've received so far
  const [allAssetOptions, setAllAssetOptions] = useState<Asset[]>([]);

  // 2. Whenever a new list comes back from the server, merge it
  useEffect(() => {
    if (usersData?.data) {
      setAllUserOptions(prev => {
        const map = new Map(prev.map(u => [u.id, u]));
        usersData.data.forEach(u => map.set(u.id, u)); // keeps newest copy
        return Array.from(map.values());
      });
    }
  }, [usersData]);

  // Merge newly fetched assets into local cache
  useEffect(() => {
    if (assetsData?.data) {
      setAllAssetOptions(prev => {
        const map = new Map(prev.map(a => [a.id, a]));
        assetsData.data.forEach(a => map.set(a.id, a));
        return Array.from(map.values());
      });
    }
  }, [assetsData]);

  const handleBack = () => {
    router.push('/admin/groups');
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    await deleteGroupMutation.mutate(groupId);
    router.push('/admin/groups');
  };

  const currentUserItems: RelationshipItem[] = (group?.users || []).map((u) => ({
    id: u.id,
    label: u.username || u.full_name || u.email,
  }));

  const currentAssetItems: RelationshipItem[] = (group?.assets || []).map((a) => ({
    id: a.id,
    label: a.name,
  }));

  const addUsers = useCallback(
    async (userIds: (string | number)[]) => {
      if (!groupId) return;
      await Promise.all(
        userIds.map((userId) => addUserMutation.mutate({ groupId, userId: Number(userId) }))
      );
    },
    [groupId, addUserMutation],
  );

  const removeUser = useCallback(
    async (userId: string | number) => {
      if (!groupId) return;
      await removeUserMutation.mutate({ groupId, userId: Number(userId) });
    },
    [groupId, removeUserMutation],
  );

  const addAssets = useCallback(
    async (assetIds: (string | number)[]) => {
      if (!groupId) return;
      await Promise.all(
        assetIds.map((assetId) =>
          addAssetMutation.mutate({ groupId, assetId: Number(assetId) })
        ),
      );
    },
    [groupId, addAssetMutation],
  );

  const removeAsset = useCallback(
    async (assetId: string | number) => {
      if (!groupId) return;
      await removeAssetMutation.mutate({ groupId, assetId: Number(assetId) });
    },
    [groupId, removeAssetMutation],
  );

  if (groupLoading) {
    return (
      <MantineGroup justify="center" py="xl">
        <Loader />
      </MantineGroup>
    );
  }

  if (groupError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!groupId) return;
    await updateGroupMutation.mutate({ id: groupId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.group.edit.title', { name: group?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <MantineGroup align="center" justify="space-between">
          <MantineGroup>
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.group.edit.title', { name: group?.name || '' })}</Title>
          </MantineGroup>
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
        </MantineGroup>

        {/* Dynamic Edit Form */}
        {group && (
          <DynamicEditForm
            resourceType="group"
            initialValues={group}
            onSubmit={handleFormSubmit}
            isSubmitting={updateGroupMutation.isLoading}
            relationshipOverrides={{
              users: {
                currentItems: currentUserItems,
                availableItems: allUserOptions.map((u) => ({
                  id: u.id,
                  label: u.username || u.full_name || u.email,
                })),
                searchValue: userSearch,
                onSearchChange: setUserSearch,
                onAdd: addUsers,
                onRemove: removeUser,
                loading: addUserMutation.isLoading || removeUserMutation.isLoading,
                optionsLoading: usersLoading,
              },
              assets: {
                currentItems: currentAssetItems,
                availableItems: allAssetOptions.map((a) => ({
                  id: a.id,
                  label: a.name,
                })),
                searchValue: assetSearch,
                onSearchChange: setAssetSearch,
                onAdd: addAssets,
                onRemove: removeAsset,
                loading: addAssetMutation.isLoading || removeAssetMutation.isLoading,
                optionsLoading: assetsLoading,
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
        loading={deleteGroupMutation.isLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteGroup}
      />
    </Container>
    </React.Fragment>
  );
} 