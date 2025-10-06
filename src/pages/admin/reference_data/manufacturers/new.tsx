import { Container, Title, Stack, Group, ActionIcon, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
// Breadcrumbs import removed as currently unused
import { useTranslation } from '../../../../hooks/useTranslation';
import DynamicForm from '../../../../../components/DynamicForm';
import { useCreateManufacturer } from '../../../../../src/mutations';
import { useResourceSchema } from '../../../../../src/fetchers';
import React from 'react';
import Head from 'next/head';

export default function CreateLocationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: schemaResp } = useResourceSchema('manufacturer');
  const pageTitle = schemaResp?.ui?.title_key ? t(schemaResp.ui.title_key) : t('forms.certificate_key.create.title');
  const pageDescription = schemaResp?.ui?.description_key ? t(schemaResp.ui.description_key) : undefined;

  const createManufacturerMutation = useCreateManufacturer({
    onSuccess: (manufacturer) => {
      console.log('Manufacturer created successfully:', manufacturer);
      router.push('/admin/reference_data/manufacturers');
    },
    onError: (error) => {
      console.error('Error creating manufacturer:', error);
      alert(`Failed to create manufacturer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/admin/reference_data/manufacturers');
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const toDateOnly = (val: any) => {
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      return val || null;
    };

    // Map only fields defined by the create schema
    const requestBody = {
      name: values.name,
      comment: values.comment || null,
    };

    await createManufacturerMutation.mutate(requestBody);
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t("forms.manufacturer.create.title")} - Digi Secure</title>
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
          <Title order={2}>{t("forms.manufacturer.create.title")}</Title>
        </Group>

        <DynamicForm
          resourceType="manufacturer"
          onSubmit={handleSubmit}
          isSubmitting={createManufacturerMutation.isLoading}
        />
      </Stack>
    </Container>
    </React.Fragment>
  );
} 