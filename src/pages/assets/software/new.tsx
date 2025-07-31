import { Container, Title, Stack, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import DynamicForm from '../../../../components/DynamicForm';
import { useCreateSoftware } from '../../../../src/mutations';
import React from 'react';
import Head from 'next/head';

export default function CreateSoftwarePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const createMutation = useCreateSoftware({
    onSuccess: () => router.push('/assets/software'),
    onError: (err) => alert(err instanceof Error ? err.message : 'Error'),
  });

  const handleBack = () => router.push('/assets/software');

  const handleSubmit = async (values: Record<string, any>) => {
    const clean = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    );
    await createMutation.mutate(clean);
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.software.create.title')} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <Stack>
          <Group align="center">
            <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>{t('forms.software.create.title')}</Title>
          </Group>

          <DynamicForm
            resourceType="software"
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isLoading}
          />
        </Stack>
      </Container>
    </React.Fragment>
  );
}
