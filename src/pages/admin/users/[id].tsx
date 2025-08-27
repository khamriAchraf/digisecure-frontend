import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useUser, useGroups } from '../../../fetchers';
import { useAddUserToGroup, useRemoveUserFromGroup, useUpdateUser, useDeleteUser } from '../../../mutations';
import React, { useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Head from 'next/head';
import { useState } from 'react';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

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
  const deleteUserMutation = useDeleteUser({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('users');
  const canDelete = useHasPermission(PERMISSIONS.USER_DELETE);

  const handleBack = () => {
    router.push('/admin/users');
  };

  if (userError) {
    handleBack();
  }

  const handleDeleteUser = async () => {
    if (!userId) return;
    await deleteUserMutation.mutate(userId);
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
    <React.Fragment>
      <Head>
        <title>{t('forms.user.edit.title', { name: user?.username || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center" justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.user.edit.title', { name: user?.username || '' })}</Title>
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
      <ConfirmModal
        opened={confirmOpen}
        title={t(deleteTitleKey)}
        message={t(deleteMessageKey)}
        confirmLabel={t(confirmKey)}
        cancelLabel={t(cancelKey)}
        confirmColor="red"
        loading={deleteUserMutation.isLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteUser}
      />
    </Container>
    </React.Fragment>
  );
} 