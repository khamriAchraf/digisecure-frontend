import { Container, Title, Stack, Group, ActionIcon, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
// Breadcrumbs import removed as currently unused
import { useTranslation } from '../../../hooks/useTranslation';
import DynamicForm from '../../../../components/DynamicForm';
import { useCreateCertificateKey } from '../../../../src/mutations';
import { useResourceSchema } from '../../../../src/fetchers';
import React from 'react';
import Head from 'next/head';

export default function CreateCertificateKeyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: schemaResp } = useResourceSchema('certificate_key');
  const pageTitle = schemaResp?.ui?.title_key ? t(schemaResp.ui.title_key) : t('forms.certificate_key.create.title');
  const pageDescription = schemaResp?.ui?.description_key ? t(schemaResp.ui.description_key) : undefined;

  const createCertificateKeyMutation = useCreateCertificateKey({
    onSuccess: (certificateKey) => {
      console.log('Certificate key created successfully:', certificateKey);
      router.push('/assets/certificates_keys');
    },
    onError: (error) => {
      console.error('Error creating certificate key:', error);
      alert(`Failed to create certificate key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/assets/certificates_keys');
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const toDateOnly = (val: any) => {
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      return val || null;
    };

    // Map only fields defined by the create schema
    const requestBody = {
      name: values.name,
      cert_type: values.cert_type || null,
      algorithm: values.algorithm || null,
      storage_location: values.storage_location || null,
      issuer: values.issuer || null,
      subject: values.subject || null,
      expiration_date: toDateOnly(values.expiration_date),
      cert_status: values.cert_status || null,
    };

    await createCertificateKeyMutation.mutate(requestBody);
  };

  return (
    <React.Fragment>
      <Head>
        <title>{pageTitle} - Digi Secure</title>
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
          <Title order={2}>{pageTitle}</Title>
        </Group>

        {pageDescription && (
          <Text c="dimmed">{pageDescription}</Text>
        )}

        {/* Dynamic Form */}
        <DynamicForm
          resourceType="certificate_key"
          onSubmit={handleSubmit}
          isSubmitting={createCertificateKeyMutation.isLoading}
        />
      </Stack>
    </Container>
    </React.Fragment>
  );
} 