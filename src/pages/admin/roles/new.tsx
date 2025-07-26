import { Container, Title, Stack, Button, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumbs } from '../../../../components/Breadcrumbs';
import { useTranslation } from '../../../hooks/useTranslation';
import DynamicForm from '../../../../components/DynamicForm';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE } from '../../../../src/fetchers';
import { useCreateRole } from '../../../../src/mutations';

export default function CreateRolePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();

  const createRoleMutation = useCreateRole({
    onSuccess: (role) => {
      console.log('Role created successfully:', role);
      router.push('/admin/roles');
    },
    onError: (error) => {
      console.error('Error creating role:', error);
      alert(`Failed to create role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/admin/roles');
  };

  // Function to refresh dynamic options for form fields
  const handleRefreshOptions = useCallback(async (fieldName: string) => {
    // Roles don't have parent relationships, so no dynamic options needed
    return [];
  }, []);

  const handleSubmit = async (values: Record<string, any>) => {
    console.log('Form submitted with values:', values);

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
      description: cleanValues.description || null,
    };

    console.log('Request body:', requestBody);

    // Use the mutation hook
    await createRoleMutation.mutate(requestBody);
  };

  return (
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
          <Title order={2}>{t("forms.role.create.title")}</Title>
        </Group>

        {/* Dynamic Form */}
        <DynamicForm
          resourceType="role"
          onSubmit={handleSubmit}
          isSubmitting={createRoleMutation.isLoading}
          onRefreshOptions={handleRefreshOptions}
        />
      </Stack>
    </Container>
  );
} 