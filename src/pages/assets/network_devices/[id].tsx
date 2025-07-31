import { Container, Title, Stack, Loader, Text, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { useNetworkDevice } from '../../../fetchers';
import { useUpdateNetworkDevice } from '../../../mutations';
import { useTranslation } from '../../../hooks/useTranslation';
import React from 'react';
import Head from 'next/head';

export default function EditNetworkDevicePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const ndId = id ? Number(id) : undefined;

  const { data: device, isLoading, isError, mutate } = useNetworkDevice(ndId);
  const updateMutation = useUpdateNetworkDevice({ onSuccess: mutate });

  const handleBack = () => router.push('/assets/network_devices');

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
    if (!ndId) return;
    await updateMutation.mutate({ id: ndId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.network_device.edit.title', { name: device?.name || '' })} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        <Group align="center">
          <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{t('forms.network_device.edit.title', { name: device?.name || '' })}</Title>
        </Group>

        {device && (
          <DynamicEditForm
            resourceType="network_device"
            initialValues={device}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isLoading}
          />
        )}
      </Stack>
    </Container>
    </React.Fragment>
  );
}
