import { Container, Title, Stack, Loader, Text, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import DynamicEditForm from '../../../../components/DynamicEditForm';
import { useSoftware } from '../../../fetchers';
import { useUpdateSoftware } from '../../../mutations';
import { useTranslation } from '../../../hooks/useTranslation';
import React from 'react';
import Head from 'next/head';

export default function EditSoftwarePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const swId = id ? Number(id) : undefined;

  const { data: software, isLoading, isError, mutate } = useSoftware(swId);
  const updateMutation = useUpdateSoftware({ onSuccess: mutate });

  const handleBack = () => router.push('/assets/software');

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
    await updateMutation.mutate({ id: swId, ...values });
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.software.edit.title', { name: software?.name || '' })} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <Stack>
          <Group align="center">
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.software.edit.title', { name: software?.name || '' })}</Title>
          </Group>

          {software && (
            <DynamicEditForm
              resourceType="software"
              initialValues={software}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isLoading}
            />
          )}
        </Stack>
      </Container>
    </React.Fragment>
  );
}
