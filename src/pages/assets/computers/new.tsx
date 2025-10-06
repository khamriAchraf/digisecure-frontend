import { Container, Title, Stack, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
// Breadcrumbs import removed as currently unused
import { useTranslation } from '../../../hooks/useTranslation';
import DynamicForm from '../../../../components/DynamicForm';
import { useCreateComputer } from '../../../../src/mutations';
import React from 'react';
import Head from 'next/head';

export default function CreateComputerPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const createComputerMutation = useCreateComputer({
    onSuccess: (computer) => {
      console.log('Computer created successfully:', computer);
      router.push('/assets/computers');
    },
    onError: (error) => {
      console.error('Error creating computer:', error);
      alert(`Failed to create computer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/assets/computers');
  };

  const handleSubmit = async (values: Record<string, any>) => {
    // Clean up form values - convert empty strings to null for optional fields
    const cleanValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    // Prepare the request body according to the API specification
    const requestBody = {
      name: cleanValues.name,
      serial_number: cleanValues.serial_number || null,
      inventory_number: cleanValues.inventory_number || null,
      manufacturer_id: cleanValues.manufacturer_id ? parseInt(cleanValues.manufacturer_id) : null,
      operating_system_id: cleanValues.operating_system_id ? parseInt(cleanValues.operating_system_id) : null,
      status: cleanValues.status,
      purchase_date: cleanValues.purchase_date || null,
      warranty_expiry: cleanValues.warranty_expiry || null,
      location_id: cleanValues.location_id ? parseInt(cleanValues.location_id) : null,
      group_id: cleanValues.group_id ? parseInt(cleanValues.group_id) : null,
      assigned_to: cleanValues.assigned_to ? parseInt(cleanValues.assigned_to) : null,
      cpu: cleanValues.cpu || null,
      ram: cleanValues.ram || null,
      storage: cleanValues.storage || null,
      os: cleanValues.os || null,
      mac_address: cleanValues.mac_address || null,
      ip_address: cleanValues.ip_address || null,
      model: cleanValues.model || null,
      hostname: cleanValues.hostname || null,
    };

    // Use the mutation hook
    await createComputerMutation.mutate(requestBody);
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.computer.create.title')} - Digi Secure</title>
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
          <Title order={2}>{t("forms.computer.create.title")}</Title>
        </Group>

        {/* Dynamic Form */}
        <DynamicForm
          resourceType="computer"
          onSubmit={handleSubmit}
          isSubmitting={createComputerMutation.isLoading}
        />
      </Stack>
    </Container>
    </React.Fragment>
  );
} 