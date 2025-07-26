import { Container, Title, Stack, Button, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumbs } from '../../../../components/Breadcrumbs';
import { useTranslation } from '../../../hooks/useTranslation';
import DynamicForm from '../../../../components/DynamicForm';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE } from '../../../../src/fetchers';
import { useCreateGroup } from '../../../../src/mutations';

export default function CreateGroupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();

  const createGroupMutation = useCreateGroup({
    onSuccess: (group) => {
      console.log('Group created successfully:', group);
      router.push('/admin/groups');
    },
    onError: (error) => {
      console.error('Error creating group:', error);
      alert(`Failed to create group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/admin/groups');
  };

  // Function to refresh dynamic options for form fields
  const handleRefreshOptions = useCallback(async (fieldName: string) => {
    if (fieldName === 'parent_id') {
      try {
        // Fetch fresh list of groups for parent selection
        const response = await fetch(`${API_BASE}/groups/`, {
          headers: {
            ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const groupsData = await response.json();

        // Transform groups data to UIFieldOption format
        const options: Array<{
          value: string;
          label_key: string;
          label_params?: Record<string, any>;
        }> = [
            { value: '', label_key: 'forms.group.fields.parent_id.options.no_parent' }
          ];

        // Add existing groups as options
        if (groupsData.data && Array.isArray(groupsData.data)) {
          groupsData.data.forEach((group: any) => {
            options.push({
              value: String(group.id),
              label_key: 'forms.group.fields.parent_id.options.group_with_type',
              label_params: { name: group.name, type: group.type || 'group' }
            });
          });
        }

        return options;
      } catch (error) {
        console.error('Failed to fetch groups for parent selection:', error);
        // Return fallback options
        return [
          { value: '', label_key: 'forms.group.fields.parent_id.options.no_parent' }
        ] as Array<{
          value: string;
          label_key: string;
          label_params?: Record<string, any>;
        }>;
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
      name: cleanValues.name,
      description: cleanValues.description || null,
      type: cleanValues.type || null,
      contain_users: cleanValues.contain_users ?? true,
      contain_items: cleanValues.contain_items ?? true,
      comment: cleanValues.comment || null,
      parent_id: cleanValues.parent_id ? parseInt(cleanValues.parent_id) : null,
    };

    console.log('Request body:', requestBody);

    // Use the mutation hook
    await createGroupMutation.mutate(requestBody);
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
          <Title order={2}>{t("forms.group.create.title")}</Title>
        </Group>

        {/* Dynamic Form */}
        <DynamicForm
          resourceType="group"
          onSubmit={handleSubmit}
          isSubmitting={createGroupMutation.isLoading}
          onRefreshOptions={handleRefreshOptions}
        />
      </Stack>
    </Container>
  );
} 