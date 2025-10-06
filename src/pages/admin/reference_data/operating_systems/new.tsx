import { Container, Title, Stack, Group, ActionIcon, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import DynamicForm from '../../../../../components/DynamicForm';
import { useCreateOperatingSystem } from '../../../../../src/mutations';
import { useResourceSchema } from '../../../../../src/fetchers';
import React from 'react';
import Head from 'next/head';

export default function CreateOperatingSystemPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: schemaResp } = useResourceSchema('operating_system');
  const pageTitle = schemaResp?.ui?.title_key ? t(schemaResp.ui.title_key) : t('forms.certificate_key.create.title');
  const pageDescription = schemaResp?.ui?.description_key ? t(schemaResp.ui.description_key) : undefined;

  const createOperatingSystemMutation = useCreateOperatingSystem({
    onSuccess: (operatingSystem) => {
      console.log('Location created successfully:', location);
      router.push('/admin/reference_data/operating_systems');
    },
    onError: (error) => {
      console.error('Error creating operatingSystem:', error);
      alert(`Failed to create certificate key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/admin/reference_data/operating_systems');
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const toDateOnly = (val: any) => {
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      return val || null;
    };

    // Map only fields defined by the create schema
    const requestBody = {
        name: values.name,
        vendor: values.vendor,
        version: values.version,
        architecture: values.architecture,
        end_of_life_date: toDateOnly(values.end_of_life_date),
        end_of_support_date: toDateOnly(values.end_of_support_date),
        comment: values.comment || null,
    };

    await createOperatingSystemMutation.mutate(requestBody);
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t("forms.operatingSystem.create.title")} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center">
          <ActionIcon
            variant="light"
            onClick={handleBack}
            aria-label={t('common.back')}
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{t("forms.operatingSystem.create.title")}</Title>
        </Group>

        {/* Dynamic Form */}
        <DynamicForm
          resourceType="operating_system"
          onSubmit={handleSubmit}
          isSubmitting={createOperatingSystemMutation.isLoading}
        />
      </Stack>
    </Container>
    </React.Fragment>
  );
} 