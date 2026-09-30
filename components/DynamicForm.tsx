import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Stack,
  Group,
  Loader,
  MultiSelect,
  SimpleGrid,
} from '@mantine/core';
import QuickCreateSelect from './QuickCreateSelect';
import { useForm } from '@mantine/form';
import { useResourceSchema, useRoles } from '@/fetchers';
import { useTranslation } from '@/hooks/useTranslation';
import { useDynamicOptions } from '@/hooks/useDynamicOptions';
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
  quick_create_resource?: string;
}

interface UI {
  title_key?: string;
  description_key?: string;
  fields: Record<string, UIField>;
}

interface DynamicFormProps {
  resourceType: string;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  className?: string;
  isSubmitting?: boolean;
  onRefreshOptions?: (fieldName: string) => Promise<UIFieldOption[]>;
}

// ----------------------------
// Memoized field components
// ----------------------------
const MemoSelectField = React.memo(
  ({ name, field, form, t, refreshFieldOptions, legacyRefreshing }: any) => {
    const { options: srcOptions, isLoading: srcLoading, refresh: srcRefresh } = useDynamicOptions(name);
    const { data: session } = useSession();
    const { data: rolesResp, isLoading: rolesLoading } = useRoles({ per_page: 9999 } as any);

    const isRoleField = name === 'role_id';
    const roles: any[] = rolesResp?.data ?? [];
    const currentUserRoleId: number | null = session?.user?.role_id ?? null;

    let options = srcOptions ?? field.options ?? [];
    if (isRoleField && roles.length > 0 && currentUserRoleId !== null) {
      const currentUserRole = roles.find((r) => r.id === currentUserRoleId);
      const currentRank: number | undefined = currentUserRole?.rank;
      if (typeof currentRank === 'number') {
        const allowedRoleIds = new Set(
          roles.filter((r) => typeof r.rank === 'number' && r.rank > currentRank).map((r) => Number(r.id))
        );
        options = options.filter((o) => o.value === '' || allowedRoleIds.has(Number(o.value)));
      }
    }

    const isRefreshing = srcLoading || legacyRefreshing[name] || (isRoleField && rolesLoading);
    const currentValue = form.values[name];
    const refreshFn = srcOptions ? srcRefresh : () => refreshFieldOptions(name);

    const handleChange = useCallback((val: string | null) => form.setFieldValue(name, val), [form, name]);

    const mappedOptions = useMemo(() => {
      return options.map((o: any) => {
        const isOsField = name === 'operating_system_id' || name === 'operating_system';
        if (isOsField) {
          const p: any = (o as any).label_params || {};
          if (p.name || p.version || p.vendor || p.architecture) {
            const label = `${p.name ?? ''}${p.version ? ` ${p.version}` : ''}${p.vendor ? ` - ${p.vendor}` : ''}${
              p.architecture ? ` (${p.architecture})` : ''
            }`.trim();
            return { value: String(o.value), label };
          }
        }
        return {
          value: String(o.value),
          label: o.label_params ? t(o.label_key, o.label_params) : t(o.label_key),
        };
      });
    }, [options, t, name]);

    if (field.quick_create_resource) {
      return (
        <QuickCreateSelect
          label={t(field.label_key ?? name)}
          placeholder={t(field.placeholder_key ?? '')}
          description={t(field.help_text_key ?? '')}
          data={mappedOptions}
          value={form.values[name] as string | null}
          onChange={handleChange}
          resourceType={field.quick_create_resource!}
          onCreated={refreshFn}
          loading={isRefreshing}
        />
      );
    }

    return (
      <Select
        key={name}
        label={t(field.label_key ?? name)}
        placeholder={t(field.placeholder_key ?? '')}
        description={t(field.help_text_key ?? '')}
        data={mappedOptions}
        value={currentValue == null || currentValue === '' ? null : String(currentValue)}
        onChange={handleChange}
        allowDeselect
        rightSection={isRefreshing ? <Loader size="xs" /> : undefined}
      />
    );
  }
);

const MemoMultiSelectField = React.memo(({ name, field, form, t, legacyRefreshing }: any) => {
  const { options: srcOptions, isLoading: srcLoading } = useDynamicOptions(name);
  const options = srcOptions ?? field.options ?? [];
  const isRefreshing = srcLoading || legacyRefreshing[name];

  const mappedOptions = useMemo(
    () =>
      options.map((o: any) => ({
        value: String(o.value),
        label: o.label_params ? t(o.label_key, o.label_params) : t(o.label_key),
      })),
    [options, t]
  );

  const handleChange = useCallback((v: string[]) => form.setFieldValue(name, v), [form, name]);

  return (
    <MultiSelect
      key={name}
      label={t(field.label_key ?? name)}
      placeholder={t(field.placeholder_key ?? '')}
      description={t(field.help_text_key ?? '')}
      data={mappedOptions}
      value={Array.isArray(form.values[name]) ? (form.values[name] as string[]) : []}
      onChange={handleChange}
      searchable
      rightSection={isRefreshing ? <Loader size="xs" /> : undefined}
    />
  );
});

const DynamicField = React.memo(({ name, field, form, t, refreshFieldOptions, legacyRefreshing }: any) => {
  const inputProps = form.getInputProps(name as any);
  const label = t(field.label_key ?? name);
  const placeholder = t(field.placeholder_key ?? '');
  const description = t(field.help_text_key ?? '');

  switch (field.widget) {
    case 'text':
      return <TextInput key={name} label={label} placeholder={placeholder} description={description} {...inputProps} />;
    case 'email':
      return <TextInput key={name} type="email" label={label} placeholder={placeholder} description={description} {...inputProps} />;
    case 'password':
      return <TextInput key={name} type="password" label={label} placeholder={placeholder} description={description} {...inputProps} />;
    case 'tel':
      return <TextInput key={name} type="tel" label={label} placeholder={placeholder} description={description} {...inputProps} />;
    case 'textarea':
      return <Textarea key={name} label={label} placeholder={placeholder} description={description} minRows={3} {...inputProps} />;
    case 'select':
      return (
        <MemoSelectField
          key={name}
          name={name}
          field={field}
          form={form}
          t={t}
          refreshFieldOptions={refreshFieldOptions}
          legacyRefreshing={legacyRefreshing}
        />
      );
    case 'multi-select':
      return (
        <MemoMultiSelectField
          key={name}
          name={name}
          field={field}
          form={form}
          t={t}
          legacyRefreshing={legacyRefreshing}
        />
      );
    case 'date':
      return <DatePickerInput key={name} label={label} placeholder={placeholder} description={description} {...inputProps} />;
    case 'checkbox':
      return (
        <Checkbox
          key={name}
          label={label}
          description={description}
          {...form.getInputProps(name as any, { type: 'checkbox' })}
        />
      );
    default:
      return <TextInput key={name} label={label} placeholder={placeholder} description={description} {...inputProps} />;
  }
});

// ----------------------------
// Main DynamicForm component
// ----------------------------
export const DynamicForm: React.FC<DynamicFormProps> = ({
  resourceType,
  onSubmit,
  className,
  isSubmitting = false,
  onRefreshOptions,
}) => {
  const { data: schemaResp, isLoading, isError } = useResourceSchema(resourceType);
  const { t } = useTranslation();
  const [legacyOptions, setLegacyOptions] = useState<Record<string, UIFieldOption[]>>({});
  const [legacyRefreshing, setLegacyRefreshing] = useState<Record<string, boolean>>({});

  const initialValues: Record<string, any> = {};
  const validate: Record<string, (value: any) => string | null> = {};

  if (schemaResp) {
    const ui: UI = schemaResp.ui;
    const fields: Record<string, UIField> = ui.fields || {};
    Object.entries(fields).forEach(([key, field]) => {
      const validation = field.validation || {};
      const defaultValue =
        validation.default ??
        schemaResp.schema?.properties?.[key]?.default ??
        (field.widget === 'checkbox'
          ? false
          : field.widget === 'multi-select'
          ? []
          : field.widget === 'select' || field.widget === 'date'
          ? null
          : '');
      initialValues[key] = defaultValue;
      validate[key] = (value: any) => {
        if (validation.required && (value === undefined || value === null || value === '')) {
          return validation.error_messages?.required
            ? t(validation.error_messages.required)
            : t('forms.errors.required');
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
          if (field.widget === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return validation.error_messages?.invalid
              ? t(validation.error_messages.invalid)
              : t('forms.errors.invalid');
          }
        }
        return null;
      };
    });
  }

  const form = useForm({ initialValues, validate });

  const refreshFieldOptions = useCallback(
    async (fieldName: string) => {
      if (!onRefreshOptions) return;
      setLegacyRefreshing((prev) => ({ ...prev, [fieldName]: true }));
      try {
        const newOptions = await onRefreshOptions(fieldName);
        setLegacyOptions((prev) => ({ ...prev, [fieldName]: newOptions }));
      } catch (error) {
        console.error(`Failed to refresh options for field ${fieldName}:`, error);
      } finally {
        setLegacyRefreshing((prev) => ({ ...prev, [fieldName]: false }));
      }
    },
    [onRefreshOptions]
  );

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
      form.setValues(newInitialValues);
      form.setInitialValues(newInitialValues);
    }
  }, [schemaResp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isSubmitting && schemaResp) {
      const fields: Record<string, UIField> = schemaResp.ui.fields || {};
      Object.entries(fields).forEach(([key, field]) => {
        if (field.widget === 'select' && onRefreshOptions) refreshFieldOptions(key);
      });
    }
  }, [isSubmitting, schemaResp, onRefreshOptions, refreshFieldOptions]);

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

  const orderedFields = useMemo(() => {
    return Object.entries(schemaResp.ui.fields || {}).sort((a, b) => a[1].order - b[1].order);
  }, [schemaResp]);

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
          {orderedFields.map(([name, field]) => (
            <DynamicField
              key={name}
              name={name}
              field={field}
              form={form}
              t={t}
              refreshFieldOptions={refreshFieldOptions}
              legacyRefreshing={legacyRefreshing}
            />
          ))}
        </SimpleGrid>
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? t('common.submitting') : t('common.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default DynamicForm;
