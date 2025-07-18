import { Container, Title, Stack, Button, Group } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumbs } from '../../../../components/Breadcrumbs';
import { useTranslation } from '../../../hooks/useTranslation';
import DynamicForm from '../../../../components/DynamicForm';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE } from '../../../../src/fetchers';
import { useCreateUser } from '../../../../src/mutations';

export default function CreateUserPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();
  
  const createUserMutation = useCreateUser({
    onSuccess: (user) => {
      console.log('User created successfully:', user);
      router.push('/admin/users');
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/admin/users');
  };

  // Function to refresh dynamic options for form fields
  const handleRefreshOptions = useCallback(async (fieldName: string) => {
    if (fieldName === 'roles') {
      try {
        // Fetch fresh list of roles for role selection
        const response = await fetch(`${API_BASE}/roles/`, {
          headers: {
            ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rolesData = await response.json();
        
        // Transform roles data to UIFieldOption format
        const options: Array<{
          value: string;
          label_key: string;
          label_params?: Record<string, any>;
        }> = [];

        // Add existing roles as options
        if (rolesData.data && Array.isArray(rolesData.data)) {
          rolesData.data.forEach((role: any) => {
            options.push({
              value: String(role.id),
              label_key: 'forms.user.fields.roles.options.role_name',
              label_params: { 
                name: role.name, 
                description: role.description || 'No description available' 
              }
            });
          });
        }

        return options;
      } catch (error) {
        console.error('Failed to fetch roles for role selection:', error);
        // Return fallback options
        return [];
      }
    }

    // Return empty array for unknown fields
    return [];
  }, [session?.accessToken]);

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
      email: cleanValues.email,
      username: cleanValues.username,
      password: cleanValues.password,
      full_name: cleanValues.full_name || null,
      status: cleanValues.status || 'active',
      language: cleanValues.language || 'en',
      theme: cleanValues.theme || 'light',
      location: cleanValues.location || null,
      phone: cleanValues.phone || null,
      secondary_phone: cleanValues.secondary_phone || null,
      timezone: cleanValues.timezone || null,
      valid_from: cleanValues.valid_from || null,
      valid_until: cleanValues.valid_until || null,
      administartive_number: cleanValues.administartive_number || null,
      roles: cleanValues.roles ? cleanValues.roles.map((id: string) => parseInt(id)) : null,
    } as const;
    
    console.log('Request body:', requestBody);
    
    // Use the mutation hook
    await createUserMutation.mutate(requestBody);
  };

  return (
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={2}>{t("forms.user.create.title")}</Title>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
        </Group>

        {/* Dynamic Form */}
        <DynamicForm 
          resourceType="user" 
          onSubmit={handleSubmit}
          isSubmitting={createUserMutation.isLoading}
          onRefreshOptions={handleRefreshOptions}
        />
      </Stack>
    </Container>
  );
} 