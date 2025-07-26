import React from 'react';
import { Group, Select, ActionIcon, Modal, Loader } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import DynamicForm from './DynamicForm';
import { UIFieldOption } from './DynamicForm';
import { useQuickCreate } from '@/mutations';

interface QuickCreateSelectProps {
  label: string;
  placeholder?: string;
  description?: string;
  data: { value: string; label: string }[];
  value: string | null;
  onChange: (val: string | null) => void;
  resourceType: string; // resource type for quick create form (e.g., 'manufacturer', 'group')
  onCreated: () => void; // called after a new item is created to refresh parent options
  loading?: boolean;
  readOnly?: boolean;
}

const QuickCreateSelect: React.FC<QuickCreateSelectProps> = ({
  label,
  placeholder,
  description,
  data,
  value,
  onChange,
  resourceType,
  onCreated,
  loading,
  readOnly,
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  const quickCreateMutation = useQuickCreate(resourceType, {
    onSuccess: (createdResource) => {
      console.log(`${resourceType} created successfully:`, createdResource);
      
      // Auto-select the newly created item
      if (createdResource && createdResource.id) {
        onChange(String(createdResource.id));
      }
      
      onCreated();
      close();
    },
    onError: (error) => {
      console.error(`Error creating ${resourceType}:`, error);
      alert(`Failed to create ${resourceType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleModalSubmit = async (values: Record<string, any>) => {
    console.log('Quick create submitted with values:', values);
    
    // Clean up form values - convert empty strings to null for optional fields
    const cleanValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key, 
        value === '' ? null : value
      ])
    );
    
    console.log('Clean values:', cleanValues);
    await quickCreateMutation.mutate(cleanValues);
  };

  return (
    <>
      <Group gap="xs" align="flex-end">
        <Select
          label={label}
          placeholder={placeholder}
          description={description}
          data={data}
          value={value}
          onChange={onChange}
          style={{ flex: 1 }}
          rightSection={loading ? <Loader size="xs" /> : undefined}
          allowDeselect
          readOnly={readOnly}
        />
        <ActionIcon 
          variant="light" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            open();
          }} 
          mt={loading ? 28 : 22} 
          aria-label="Quick create"
          disabled={readOnly}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Group>

      <Modal 
        opened={opened} 
        onClose={close} 
        title={`Create new ${resourceType}`} 
        size="xl"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <DynamicForm 
            resourceType={resourceType} 
            onSubmit={handleModalSubmit} 
            isSubmitting={quickCreateMutation.isLoading} 
          />
        </div>
      </Modal>
    </>
  );
};

export default QuickCreateSelect; 