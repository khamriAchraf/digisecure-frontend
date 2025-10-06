import { Container, Title, Stack, Group, ActionIcon, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
// Breadcrumbs import removed as currently unused
import { useTranslation } from '../../../../hooks/useTranslation';
import DynamicForm from '../../../../../components/DynamicForm';
import { useCreateLocation } from '../../../../../src/mutations';
import { useResourceSchema } from '../../../../../src/fetchers';
import React from 'react';
import Head from 'next/head';

export default function CreateLocationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: schemaResp } = useResourceSchema('location');
  const pageTitle = schemaResp?.ui?.title_key ? t(schemaResp.ui.title_key) : t('forms.certificate_key.create.title');
  const pageDescription = schemaResp?.ui?.description_key ? t(schemaResp.ui.description_key) : undefined;

  const createLocationMutation = useCreateLocation({
    onSuccess: (location) => {
      console.log('Location created successfully:', location);
      router.push('/admin/reference_data/locations');
    },
    onError: (error) => {
      console.error('Error creating location:', error);
      alert(`Failed to create certificate key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/admin/reference_data/locations');
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const toDateOnly = (val: any) => {
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      return val || null;
    };

    // Map only fields defined by the create schema
    const requestBody = {
      name: values.name,
      address: values.address || null,
      postal_code: values.postal_code || null,
      town: values.town || null,
      state: values.state || null,
      country: values.country || null,
      building_number: values.building_number || null,
      floor_number: values.floor_number || null,
      room_number: values.room_number || null,
      longitude: values.longitude || null,
      latitude: values.latitude || null,
      altitude: values.altitude || null,
      comment: values.comment || null,
    };

    await createLocationMutation.mutate(requestBody);
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t("forms.location.create.title")} - Digi Secure</title>
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
          <Title order={2}>{t("forms.location.create.title")}</Title>
        </Group>

        {/* Dynamic Form */}
        <DynamicForm
          resourceType="location"
          onSubmit={handleSubmit}
          isSubmitting={createLocationMutation.isLoading}
        />
      </Stack>
    </Container>
    </React.Fragment>
  );
} 