import { Container, Title, Stack, Loader, Text, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useVirtualMachine, useGroups } from '../../../fetchers';
import { useAddUserToGroup, useRemoveUserFromGroup, useUpdateVirtualMachine } from '../../../mutations';
import React, { useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Head from 'next/head';

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

  const addUserToGroupMutation = useAddUserToGroup({ onSuccess: mutateVm });
  const removeUserFromGroupMutation = useRemoveUserFromGroup({ onSuccess: mutateVm });

  const updateVMMutation = useUpdateVirtualMachine({ onSuccess: mutateVm });

  const handleBack = () => {
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
        addUserToGroupMutation.mutate({ groupId: Number(groupId), vmId })
      );
      
      await Promise.all(promises);
    },
    [vmId, addUserToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!vmId) return;
      
      await removeUserFromGroupMutation.mutate({ 
        groupId: Number(groupId), 
        vmId 
      });
    },
    [vmId, removeUserFromGroupMutation],
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
            <Group align="center">
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
                <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.virtual_machine.edit.title', { name: vm?.name || '' })}</Title>
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