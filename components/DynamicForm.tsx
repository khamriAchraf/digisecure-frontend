import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Stack,
  Group,
  Title,
  Loader,
  MultiSelect,
  SimpleGrid,
} from '@mantine/core';
import QuickCreateSelect from './QuickCreateSelect';
import { useForm } from '@mantine/form';
import { useResourceSchema } from '@/fetchers';
import { useTranslation } from '@/hooks/useTranslation';
import { useDynamicOptions } from '@/hooks/useDynamicOptions';
import { useRoles } from '@/fetchers';
import { useSession } from 'next-auth/react';
import { DatePickerInput } from '@mantine/dates';

// Helper types mirroring the backend UI schema
interface UIFieldOption {
  value: string | number | boolean | null;
  label_key: string;
  label_params?: Record<string, any>;
}

export type { UIFieldOption };

interface UIFieldValidation {
  required?: boolean;
  min_length?: number;
  max_length?: number;
  default?: any;
  error_messages?: {
    required?: string;
    min_length?: string;
    max_length?: string;
    invalid?: string;
  };
}

interface UIField {
  widget: string;
  placeholder_key?: string;
  help_text_key?: string;
  order: number;
  options?: UIFieldOption[];
  label_key?: string;
  validation?: UIFieldValidation;
  quick_create_resource?: string; // if present, enable quick create modal for this select, value is resource type
}

interface UI {
  title_key?: string;
  description_key?: string;
  fields: Record<string, UIField>;
}

interface DynamicFormProps {
  /**
   * Resource type to fetch schema for, e.g. "group", "user" …
   */
  resourceType: string;
  /**
   * Called with validated form values.
   */
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  /**
   * Optional extra class name for the form wrapper.
   */
  className?: string;
  /**
   * Whether the form is currently submitting.
   */
  isSubmitting?: boolean;
  /**
   * Optional function to refresh dynamic options for specific fields.
   * Called when the form needs to update dropdown options.
   */
  onRefreshOptions?: (fieldName: string) => Promise<UIFieldOption[]>;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ 
  resourceType, 
  onSubmit, 
  className, 
  isSubmitting = false,
  onRefreshOptions 
}) => {
  const { data: schemaResp, isLoading, isError } = useResourceSchema(resourceType);
  const { t } = useTranslation();
  // Fallback store for legacy onRefreshOptions prop (kept for backward-compat)
  const [legacyOptions, setLegacyOptions] = useState<Record<string, UIFieldOption[]>>({});
  const [legacyRefreshing, setLegacyRefreshing] = useState<Record<string, boolean>>({});

  // Build initial values & validation object (always do this, even if loading)
  const initialValues: Record<string, any> = {};
  const validate: Record<string, (value: any) => string | null> = {};

  // Build validation rules from schema if available
  if (schemaResp) {
    const ui: UI = schemaResp.ui;
    const fields: Record<string, UIField> = ui.fields || {};

    Object.entries(fields).forEach(([key, field]) => {
      const validation = field.validation || {};
      const defaultValue =
        validation.default ?? // explicit default in UI validation
        schemaResp.schema?.properties?.[key]?.default ?? // default from JSON schema
        (field.widget === 'checkbox'
          ? false
          : field.widget === 'multi-select'
          ? []
          : field.widget === 'select' || field.widget === 'date'
          ? null
          : ''); // sensible defaults

      initialValues[key] = defaultValue;

      // Build minimal validation function
      validate[key] = (value: any) => {
        if (validation.required && (value === undefined || value === null || value === '')) {
          return validation.error_messages?.required ? t(validation.error_messages.required) : t('forms.errors.required');
        }

        if (typeof value === 'string') {
          if (validation.min_length && value.length < validation.min_length) {
            const errorKey = validation.error_messages?.min_length || 'forms.errors.minLength';
            return t(errorKey, { count: validation.min_length });
          }
          if (validation.max_length && value.length > validation.max_length) {
            const errorKey = validation.error_messages?.max_length || 'forms.errors.maxLength';
            return t(errorKey, { count: validation.max_length });
          }
          
          // Email validation for email widget type
          if (field.widget === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return validation.error_messages?.invalid ? t(validation.error_messages.invalid) : t('forms.errors.invalid');
          }
        }
        return null;
      };
    });
  }

  // Always call useForm, even if we don't have schema data yet
  const form = useForm({
    initialValues,
    validate,
  });

  // Function to refresh options for a specific field
  const refreshFieldOptions = useCallback(async (fieldName: string) => {
    if (!onRefreshOptions) return;
    
    setLegacyRefreshing((prev: Record<string, boolean>) => ({ ...prev, [fieldName]: true }));
    try {
      const newOptions = await onRefreshOptions(fieldName);
      setLegacyOptions((prev: Record<string, UIFieldOption[]>) => ({ ...prev, [fieldName]: newOptions }));
    } catch (error) {
      console.error(`Failed to refresh options for field ${fieldName}:`, error);
    } finally {
      setLegacyRefreshing((prev: Record<string, boolean>) => ({ ...prev, [fieldName]: false }));
    }
  }, [onRefreshOptions]);

  // Synchronous update before paint to avoid first-click popover closing on fixed-option selects
  useLayoutEffect(() => {
    if (schemaResp) {
      const ui: UI = schemaResp.ui;
      const fields: Record<string, UIField> = ui.fields || {};

      const newInitialValues: Record<string, any> = {};

      Object.entries(fields).forEach(([key, field]) => {
        const validation = field.validation || {};
        const defaultValue =
          validation.default ??
          schemaResp.schema?.properties?.[key]?.default ??
          (field.widget === 'checkbox' ? false : field.widget === 'multi-select' ? [] : '');

        newInitialValues[key] = defaultValue;
      });

      // Set both values and initial values without calling reset (which can close newly opened popovers)
      form.setValues(newInitialValues);
      form.setInitialValues(newInitialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaResp]);

  // Effect to refresh options when form is submitted successfully
  useEffect(() => {
    if (!isSubmitting && schemaResp) {
      const ui: UI = schemaResp.ui;
      const fields: Record<string, UIField> = ui.fields || {};
      
      // Refresh options for fields that might have dynamic data
      Object.entries(fields).forEach(([key, field]) => {
        if (field.widget === 'select' && onRefreshOptions) {
          refreshFieldOptions(key);
        }
      });
    }
  }, [isSubmitting, schemaResp, onRefreshOptions, refreshFieldOptions]);

  // Display loading / error states after hooks
  if (isLoading) {
    return (
      <Group justify="center" mt="lg">
        <Loader />
      </Group>
    );
  }

  if (isError || !schemaResp) {
    return <p>{t('forms.errors.loadFailed')}</p>;
  }

  // Now we can safely access schemaResp
  const ui = schemaResp.ui;
  const fields: Record<string, UIField> = ui.fields || {};

  // Helper renderer based on widget type
  const renderField = (key: string, field: UIField) => {
    // Child components for dynamic selects so we can safely use hooks

    const SelectField: React.FC = () => {
      const { options: srcOptions, isLoading: srcLoading, refresh: srcRefresh } = useDynamicOptions(key);
      const { data: session } = useSession();
      const { data: rolesResp, isLoading: rolesLoading } = useRoles({ per_page: 9999 } as any);

      const isRoleField = key === 'role_id';
      const roles: any[] = rolesResp?.data ?? [];
      const currentUserRoleId: number | null = session?.user?.role_id ?? null;

      let options = srcOptions ?? legacyOptions[key] ?? field.options ?? [];

      if (isRoleField && roles.length > 0 && currentUserRoleId !== null) {
        const currentUserRole = roles.find((r) => r.id === currentUserRoleId);
        const currentRank: number | undefined = currentUserRole?.rank;
        if (typeof currentRank === 'number') {
          const allowedRoleIds = new Set(
            roles
              .filter((r) => typeof r.rank === 'number' && r.rank > currentRank)
              .map((r) => Number(r.id))
          );
          options = options.filter((o) => o.value === '' || allowedRoleIds.has(Number(o.value)));
        }
      }

      const isRefreshing = srcLoading || legacyRefreshing[key] || (isRoleField && rolesLoading);
      const currentValue = form.values[key];

      // Decide which refresh function to use when QuickCreate modal closes
      const refreshFn = srcOptions ? srcRefresh : () => refreshFieldOptions(key);

      if (field.quick_create_resource) {
        return (
          <QuickCreateSelect
            label={t(field.label_key ?? key)}
            placeholder={t(field.placeholder_key ?? '')}
            description={t(field.help_text_key ?? '')}
            data={options.map((o) => {
              const isOsField = key === 'operating_system_id' || key === 'operating_system';
              if (isOsField) {
                const p: any = (o as any).label_params || {};
                if (p.name || p.version || p.vendor || p.architecture) {
                  const label = `${p.name ?? ''}${p.version ? ` ${p.version}` : ''}${p.vendor ? ` - ${p.vendor}` : ''}${p.architecture ? ` (${p.architecture})` : ''}`.trim();
                  return { value: String((o as any).value), label };
                }
              }
              return {
                value: String((o as any).value),
                label: (o as any).label_params ? t((o as any).label_key, (o as any).label_params) : t((o as any).label_key),
              };
            })}
            value={form.values[key] as string | null}
            onChange={(val) => form.setFieldValue(key, val)}
            resourceType={field.quick_create_resource!}
            onCreated={refreshFn}
            loading={isRefreshing}
          />
        );
      }

      const inputProps = form.getInputProps(key as any);

      return (
        <Select
          key={key}
          label={t(field.label_key ?? key)}
          placeholder={t(field.placeholder_key ?? '')}
          description={t(field.help_text_key ?? '')}
          data={options.map((o) => {
            const isOsField = key === 'operating_system_id' || key === 'operating_system';
            if (isOsField) {
              const p: any = (o as any).label_params || {};
              if (p.name || p.version || p.vendor || p.architecture) {
                const label = `${p.name ?? ''}${p.version ? ` ${p.version}` : ''}${p.vendor ? ` - ${p.vendor}` : ''}${p.architecture ? ` (${p.architecture})` : ''}`.trim();
                return { value: String((o as any).value), label };
              }
            }
            return {
              value: String((o as any).value),
              label: (o as any).label_params ? t((o as any).label_key, (o as any).label_params) : t((o as any).label_key),
            };
          })}
          value={currentValue == null || currentValue === '' ? null : String(currentValue)}
          onChange={(val) => form.setFieldValue(key, val)}
          allowDeselect
          rightSection={isRefreshing ? <Loader size="xs" /> : undefined}
        />
      );
    };

    const MultiSelectField: React.FC = () => {
      const { options: srcOptions, isLoading: srcLoading } = useDynamicOptions(key);
      const options = srcOptions ?? legacyOptions[key] ?? field.options ?? [];
      const isRefreshing = srcLoading || legacyRefreshing[key];

      return (
        <MultiSelect
          key={key}
          label={t(field.label_key ?? key)}
          placeholder={t(field.placeholder_key ?? '')}
          description={t(field.help_text_key ?? '')}
          {...form.getInputProps(key as any)}
          value={Array.isArray(form.values[key]) ? (form.values[key] as string[]) : []}
          data={options.map((o) => ({
            value: String(o.value),
            label: o.label_params ? t(o.label_key, o.label_params) : t(o.label_key),
          }))}
          searchable
          rightSection={isRefreshing ? <Loader size="xs" /> : undefined}
        />
      );
    };
 
    const commonProps = {
      key,
      label: t(field.label_key ?? key),
      placeholder: t(field.placeholder_key ?? ''),
      description: t(field.help_text_key ?? ''),
      ...form.getInputProps(key as any),
    } as const;
 
    switch (field.widget) {
      case 'text':
        return <TextInput {...commonProps} />;
      case 'email':
        return <TextInput {...commonProps} type="email" />;
      case 'password':
        return <TextInput {...commonProps} type="password" />;
      case 'tel':
        return <TextInput {...commonProps} type="tel" />;
      case 'textarea':
        return <Textarea {...commonProps} minRows={3} />;
      case 'select':
        return <SelectField />;
      case 'multi-select':
        return <MultiSelectField />;
      case 'date':
        return <DatePickerInput {...commonProps} />;
      case 'checkbox':
        return (
          <Checkbox
            key={key}
            label={t(field.label_key ?? key)}
            description={t(field.help_text_key ?? '')}
            {...form.getInputProps(key as any, { type: 'checkbox' })}
          />
        );
      default:
        // Fallback to text input
        return <TextInput {...commonProps} />;
    }
  };

  // Order fields by `order`
  const orderedFields = Object.entries(fields).sort((a, b) => a[1].order - b[1].order);

  return (
    <form 
      onSubmit={(e) => {
        e.stopPropagation();
        form.onSubmit(onSubmit)(e);
      }} 
      className={className}
    >
      <Stack>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {orderedFields.map(([key, field]) => renderField(key, field))}
        </SimpleGrid>
        <Group justify="flex-end" mt="md">
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.submitting') : t('common.submit')}
          </Button> 
        </Group>
      </Stack>
    </form>
  );
};

export default DynamicForm;   