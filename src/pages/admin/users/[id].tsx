import { Container, Title, Stack, Loader, Text, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useUser, useGroups } from '../../../fetchers';
import { useAddUserToGroup, useRemoveUserFromGroup, useUpdateUser } from '../../../mutations';
import { useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function EditUserPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const userId = id ? Number(id) : undefined;

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    mutate: mutateUser,
  } = useUser(userId);

  // Fetch all groups (large page size to avoid pagination)
  const { data: groupsData, isLoading: groupsLoading } = useGroups({ page: 1, per_page: 1000 });

  const addUserToGroupMutation = useAddUserToGroup({ onSuccess: mutateUser });
  const removeUserFromGroupMutation = useRemoveUserFromGroup({ onSuccess: mutateUser });

  const updateUserMutation = useUpdateUser({ onSuccess: mutateUser });

  const handleBack = () => {
    router.push('/admin/users');
  };

  const currentGroupItems: RelationshipItem[] = (user?.groups || []).map((g) => ({
    id: g.id,
    label: g.name,
  }));

  const availableGroupItems: RelationshipItem[] = (groupsData?.data || []).map((g: any) => ({
    id: g.id,
    label: g.name,
  }));

  const addGroups = useCallback(
    async (groupIds: (string | number)[]) => {
      if (!userId) return;
      
      // Add user to each group individually
      const promises = groupIds.map((groupId) =>
        addUserToGroupMutation.mutate({ groupId: Number(groupId), userId })
      );
      
      await Promise.all(promises);
    },
    [userId, addUserToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!userId) return;
      
      await removeUserFromGroupMutation.mutate({ 
        groupId: Number(groupId), 
        userId 
      });
    },
    [userId, removeUserFromGroupMutation],
  );

  if (userLoading || groupsLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (userError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!userId) return;
    await updateUserMutation.mutate({ id: userId, ...values });
  };

  // Map user data to include role_id from role object
  const mappedUserData = user ? {
    ...user,
    role_id: user.role?.id || null,
  } : null;

  return (
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center">
          <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{t('forms.user.edit.title', { name: user?.username || '' })}</Title>
        </Group>

        {/* Dynamic Edit Form */}
        {mappedUserData && (
          <DynamicEditForm
            resourceType="user"
            initialValues={mappedUserData}
            onSubmit={handleFormSubmit}
            isSubmitting={updateUserMutation.isLoading}
            relationshipOverrides={{
              groups: {
                currentItems: currentGroupItems,
                availableItems: availableGroupItems,
                onAdd: addGroups,
                onRemove: removeGroup,
                loading: addUserToGroupMutation.isLoading || removeUserFromGroupMutation.isLoading,
              },
            }}
          />
        )}
      </Stack>
    </Container>
  );
} 