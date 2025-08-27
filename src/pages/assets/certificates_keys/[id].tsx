import { Container, Title, Stack, Loader, Text, Group, ActionIcon, Popover } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { RelationshipItem } from '../../../../components/RelationshipWidget';
import { useCertificateKey, useGroups } from '../../../fetchers';
import { useAddAssetToGroup, useRemoveAssetFromGroup, useUpdateCertificateKey, useDeleteCertificateKey } from '../../../mutations';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Head from 'next/head';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal';
import { useConfirmMessages } from '../../../../components/DataTable/useConfirmMessages';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

export default function EditCertificateKeyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const certificateKeyId = id ? Number(id) : undefined;

  const {
    data: certificateKey,
    isLoading: certificateKeyLoading,
    isError: certificateKeyError,
    mutate: mutateCertificateKey,
  } = useCertificateKey(certificateKeyId);


  // Fetch all groups (large page size to avoid pagination)
  const { data: groupsData, isLoading: groupsLoading } = useGroups({ page: 1, per_page: 1000 });

  const addAssetToGroupMutation = useAddAssetToGroup({ onSuccess: mutateCertificateKey });
  const removeAssetFromGroupMutation = useRemoveAssetFromGroup({ onSuccess: mutateCertificateKey });

  const updateCertificateKeyMutation = useUpdateCertificateKey({ onSuccess: mutateCertificateKey });
  const deleteCertificateKeyMutation = useDeleteCertificateKey({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey } = useConfirmMessages('certificate_keys');
  const canDelete = useHasPermission(PERMISSIONS.CERTIFICATE_KEY_DELETE);

  const handleBack = () => {
    router.push('/assets/certificates_keys');
  };

  const handleDelete = async () => {
    if (!certificateKeyId) return;
    await deleteCertificateKeyMutation.mutate(certificateKeyId);
    router.push('/assets/certificates_keys');
  };

  const currentGroupItems: RelationshipItem[] = (certificateKey?.groups || []).map((g) => ({
    id: g.id,
    label: g.name,
  }));

  const availableGroupItems: RelationshipItem[] = (groupsData?.data || []).map((g: any) => ({
    id: g.id,
    label: g.name,
  }));

  const addGroups = useCallback(
    async (groupIds: (string | number)[]) => {
      if (!certificateKeyId) return;
      
      // Add user to each group individually
      const promises = groupIds.map((groupId) =>
        addAssetToGroupMutation.mutate({ groupId: Number(groupId), assetId: certificateKeyId })
      );
      
      await Promise.all(promises);
    },
    [certificateKeyId, addAssetToGroupMutation],
  );

  const removeGroup = useCallback(
    async (groupId: string | number) => {
      if (!certificateKeyId) return;
      
      await removeAssetFromGroupMutation.mutate({ 
        groupId: Number(groupId), 
        assetId: certificateKeyId 
      });
    },
    [certificateKeyId, removeAssetFromGroupMutation],
  );

  if (certificateKeyLoading || groupsLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (certificateKeyError) {
    return (
      <Container size="sm" py="xl">
        <Text c="red">{t('common.error')}</Text>
      </Container>
    );
  }

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!certificateKeyId) return;
    await updateCertificateKeyMutation.mutate({ id: certificateKeyId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.certificate_key.edit.title', { name: certificateKey?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center" justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.certificate_key.edit.title', { name: certificateKey?.name || '' })}</Title>
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
        {certificateKey && (
          <DynamicEditForm
            resourceType="certificate_key"
            initialValues={certificateKey}
            onSubmit={handleFormSubmit}
            isSubmitting={updateCertificateKeyMutation.isLoading}
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
        loading={deleteCertificateKeyMutation.isLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Container>
    </React.Fragment>
  );
} 