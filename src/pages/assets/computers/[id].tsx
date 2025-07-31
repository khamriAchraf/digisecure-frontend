import { Container, Title, Stack, Loader, Text, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useComputer, useGroups } from '../../../fetchers';
import { useAddUserToGroup, useRemoveUserFromGroup, useUpdateUser } from '../../../mutations';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Head from 'next/head';

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

  const addUserToGroupMutation = useAddUserToGroup({ onSuccess: mutateComputer });
  const removeUserFromGroupMutation = useRemoveUserFromGroup({ onSuccess: mutateComputer });

  const updateUserMutation = useUpdateUser({ onSuccess: mutateComputer });

  const handleBack = () => {
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
        addUserToGroupMutation.mutate({ groupId: Number(groupId), computerId })
      );
      
      await Promise.all(promises);
    },
    [computerId, addUserToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!computerId) return;
      
      await removeUserFromGroupMutation.mutate({ 
        groupId: Number(groupId), 
        computerId 
      });
    },
    [computerId, removeUserFromGroupMutation],
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
    await updateUserMutation.mutate({ id: computerId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.computer.edit.title', { name: computer?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center">
          <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{t('forms.computer.edit.title', { name: computer?.name || '' })}</Title>
        </Group>

        {/* Dynamic Edit Form */}
        {computer && (
          <DynamicEditForm
            resourceType="computer"
            initialValues={computer}
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
    </React.Fragment>
  );
} 