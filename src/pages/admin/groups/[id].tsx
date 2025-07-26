import { Container, Title, Stack, Loader, Text, Group as MantineGroup, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useGroup, useUsers, useAssets } from '../../../fetchers';
import {
  useAddUserToGroup,
  useRemoveUserFromGroup,
  useAddAssetToGroup,
  useRemoveAssetFromGroup,
  useUpdateGroup,
} from '../../../mutations';
import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Asset, User } from '../../../../types';

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
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <MantineGroup align="center">
          <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{t('forms.group.edit.title', { name: group?.name || '' })}</Title>
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
    </Container>
  );
} 