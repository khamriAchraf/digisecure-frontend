import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  Grid,
  Tabs,
  Card,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import QuickCreateSelect from './QuickCreateSelect';
import RelationshipWidget, { RelationshipWidgetProps } from './RelationshipWidget';
import AssetComplianceManager from './AssetComplianceManager';
import { useResourceEditSchema } from '@/fetchers';
import { useTranslation } from '@/hooks/useTranslation';
import { PERMISSIONS, useHasPermission } from '@/hooks/usePermissions';
import { useDynamicOptions } from '@/hooks/useDynamicOptions';
import SoftwareDocsManager from './SoftwareDocsManager';
import { DatePickerInput } from '@mantine/dates';
import SoftwareVersionsManager from './SoftwareVersionsManager/SoftwareVersionsManager';

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
  quick_create_resource?: string; // if present, enable quick create modal for this select
  tab_id?: string; // id of the tab this field belongs to
  multiple?: boolean; // for relationship widget
}

interface UITab {
  id: string;
  label_key: string;
}

interface UI {
  title_key?: string;
  description_key?: string;
  fields: Record<string, UIField>;
  tabs?: UITab[];
}

interface DynamicEditFormProps {
  /** Resource type to fetch edit schema for, e.g. "user" */
  resourceType: string;
  /** Called with validated form values. */
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  /** Current values of the resource being edited (pre-fill). */
  initialValues?: Record<string, any>;
  /** Optional wrapper className. */
  className?: string;
  /** Whether the form is currently submitting. */
  isSubmitting?: boolean;
  /** Optional function to refresh dynamic options for specific fields. */
  onRefreshOptions?: (fieldName: string) => Promise<UIFieldOption[]>;
  /**
   * Provide custom props for RelationshipWidget for each relationship field.
   * Keyed by field name, values are partial props (title will be injected).
   */
  relationshipOverrides?: Record<string, Partial<Omit<RelationshipWidgetProps, 'title'>>>;
}

const getUpdatePermission = (ressourceType: string): string => {
  switch (ressourceType) {
    case 'user':
    case 'users':
      return PERMISSIONS.USER_UPDATE;
    case 'role':
    case 'roles':
      return PERMISSIONS.ROLE_UPDATE;
    case 'group':
    case 'groups':
      return PERMISSIONS.GROUP_UPDATE;
    case 'computer':
    case 'network_device':
    case 'network_devices':
      return PERMISSIONS.NETWORK_DEVICE_UPDATE;
    case 'computers':
      return PERMISSIONS.COMPUTER_UPDATE;
    case 'software':
    case 'softwares':
      return PERMISSIONS.SOFTWARE_UPDATE;
    case 'virtual_machine':
    case 'virtual_machines':
      return PERMISSIONS.VIRTUAL_MACHINE_UPDATE;
    case 'asset_type':
    case 'asset_types':
    case 'manufacturer':
    case 'manufacturers':
    case 'location':
    case 'locations':
      return PERMISSIONS.REFERENCE_DATA_UPDATE;
    case 'certificate_key':
    case 'certificate_keys':
      return PERMISSIONS.CERTIFICATE_KEY_UPDATE;
    default:
      return '';
  }
};

const DynamicEditForm: React.FC<DynamicEditFormProps> = ({
  resourceType,
  onSubmit,
  initialValues: externalInitialValues = {},
  className,
  isSubmitting = false,
  onRefreshOptions,
  relationshipOverrides,
}) => {
  const { data: schemaResp, isLoading, isError } = useResourceEditSchema(resourceType);
  const { t } = useTranslation();
  // Fallback store for legacy onRefreshOptions prop (kept for backward-compat)
  const [legacyOptions, setLegacyOptions] = useState<Record<string, UIFieldOption[]>>({});
  const [legacyRefreshing, setLegacyRefreshing] = useState<Record<string, boolean>>({});

  const updatePermission = getUpdatePermission(resourceType);
  
  // Debug logging
  console.log('DynamicEditForm - resourceType:', resourceType);
  console.log('DynamicEditForm - createPermission:', updatePermission);

  const hasUpdatePermission = useHasPermission(updatePermission);


  // ----- Build initial values & validation rules -----
  const baseInitialValues: Record<string, any> = { ...externalInitialValues };
  const validate: Record<string, (value: any) => string | null> = {};

  if (schemaResp) {
    const ui: UI = schemaResp.ui;
    const fields: Record<string, UIField> = ui.fields || {};

    Object.entries(fields).forEach(([key, field]) => {
      const validation = field.validation || {};
      // externalInitialValues take precedence
      const defaultValue = externalInitialValues[key] ??
        validation.default ??
        schemaResp.schema?.properties?.[key]?.default ??
        (field.widget === 'checkbox'
          ? false
          : field.widget === 'multi-select'
          ? []
          : field.widget === 'select' || field.widget === 'date'
          ? null
          : '');

      baseInitialValues[key] = defaultValue;

      // Basic validation fn
      validate[key] = (value: any) => {
        if (validation.required && (value === undefined || value === null || value === '')) {
          return validation.error_messages?.required ? t(validation.error_messages.required) : t('forms.errors.required');
        }
        if (typeof value === 'string') {
          if (validation.min_length && value.length < validation.min_length) {
            const errKey = validation.error_messages?.min_length || 'forms.errors.minLength';
            return t(errKey, { count: validation.min_length });
          }
          if (validation.max_length && value.length > validation.max_length) {
            const errKey = validation.error_messages?.max_length || 'forms.errors.maxLength';
            return t(errKey, { count: validation.max_length });
          }
          if (field.widget === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return validation.error_messages?.invalid ? t(validation.error_messages.invalid) : t('forms.errors.invalid');
          }
        }
        return null;
      };
    });
  }

  const form = useForm({ initialValues: baseInitialValues, validate });

  // Compute tabs early for consistent hook order
  const tabs: UITab[] | undefined = schemaResp?.ui?.tabs;

  // Track active tab to control submit button visibility
  const [activeTab, setActiveTab] = useState<string | null>("general");
  useEffect(() => {
    if (tabs && tabs.length > 0) {
      setActiveTab((prev) => prev ?? tabs[0].id);
    } else {
      setActiveTab('general');
    }
  }, [tabs]);

  // Function to refresh options for a specific field (legacy support)
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

  // Keep a baseline of initial values to only submit edited fields
  const baselineRef = useRef<Record<string, any>>({ ...baseInitialValues });

  // Update initial values when schema changes (sync before paint to avoid first-click popover closing)
  useLayoutEffect(() => {
    if (schemaResp) {
      const ui: UI = schemaResp.ui;
      const fields = ui.fields || {};
      const newVals: Record<string, any> = { ...externalInitialValues };
      Object.entries(fields).forEach(([key, field]) => {
        const validation = field.validation || {};
        newVals[key] = externalInitialValues[key] ??
          validation.default ??
          schemaResp.schema?.properties?.[key]?.default ??
          (field.widget === 'checkbox'
            ? false
            : field.widget === 'multi-select'
            ? []
            : field.widget === 'select' || field.widget === 'date'
            ? null
            : '');
      });
      form.setValues(newVals);
      form.setInitialValues(newVals);
      baselineRef.current = newVals;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaResp, externalInitialValues]);

  // Option refresh after submit success
  useEffect(() => {
    if (!isSubmitting && schemaResp) {
      const ui: UI = schemaResp.ui;
      Object.entries(ui.fields || {}).forEach(([key, field]) => {
        if (field.widget === 'select' && onRefreshOptions) {
          refreshFieldOptions(key);
        }
      });
    }
  }, [isSubmitting, schemaResp, onRefreshOptions, refreshFieldOptions]);

  // Compute relationship field names once we have the schema
  const relationshipFieldNames: string[] = useMemo(() => {
    if (!schemaResp) return [];
    const fields = schemaResp.ui.fields || {};
    return Object.keys(fields).filter(key => fields[key].widget === 'relationship');
  }, [schemaResp]);

  // ----- Loading / error states -----
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

  // After we have the schema
  const ui: UI = schemaResp.ui;
  const fields = ui.fields || {};
  // tabs computed earlier for hook order

  // Field renderer
  const renderField = (key: string, field: UIField) => {
    // Child components for dynamic selects so we can safely use hooks

    const SelectField: React.FC = () => {
      const { options: srcOptions, isLoading: srcLoading, refresh: srcRefresh } = useDynamicOptions(key);

      const options = srcOptions ?? legacyOptions[key] ?? field.options ?? [];
      const isRefreshing = srcLoading || legacyRefreshing[key];
      const currentValue = form.values[key];

      // If we have a current value but no options loaded yet, we need to preserve it
      // This can happen when the form loads with initial values but dynamic options are still loading
      const hasCurrentValue = currentValue != null && currentValue !== '';
      const currentValueExistsInOptions = options.some(opt => String(opt.value) === String(currentValue));
      
      // If we have a current value that's not in the options yet, we might need to wait for options to load
      const shouldWaitForOptions = hasCurrentValue && !currentValueExistsInOptions && srcLoading;

      // Decide which refresh function to use when QuickCreate modal closes
      const refreshFn = srcOptions ? srcRefresh : () => refreshFieldOptions(key);

      if (field.quick_create_resource) {
        return (
          <QuickCreateSelect
            label={t(field.label_key ?? key)}
            placeholder={t(field.placeholder_key ?? '')}
            description={t(field.help_text_key ?? '')}
            data={options.map((o) => ({
              value: String(o.value),
              label: o.label_params ? t(o.label_key, o.label_params) : t(o.label_key),
            }))}
            value={currentValue != null ? String(currentValue) : null}
            onChange={(val) => form.setFieldValue(key, val)}
            resourceType={field.quick_create_resource!}
            onCreated={refreshFn}
            loading={isRefreshing || shouldWaitForOptions}
            readOnly={!hasUpdatePermission}
          />
        );
      }

      return (
        <Select
          key={key}
          label={t(field.label_key ?? key)}
          placeholder={t(field.placeholder_key ?? '')}
          description={t(field.help_text_key ?? '')}
          data={options.map((o) => ({
            value: String(o.value),
            label: o.label_params ? t(o.label_key, o.label_params) : t(o.label_key),
          }))}
          value={currentValue == null || currentValue === '' ? null : String(currentValue)}
          onChange={(val) => form.setFieldValue(key, val)}
          allowDeselect
          rightSection={(isRefreshing || shouldWaitForOptions) ? <Loader size="xs" /> : undefined}
          disabled={!hasUpdatePermission}
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
          disabled={!hasUpdatePermission}
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
        return <TextInput {...commonProps} disabled={!hasUpdatePermission} />;
      case 'email':
        return <TextInput {...commonProps} type="email" disabled={!hasUpdatePermission} />;
      case 'password':
        return <TextInput {...commonProps} type="password" disabled={!hasUpdatePermission} />;
      case 'tel':
        return <TextInput {...commonProps} type="tel" disabled={!hasUpdatePermission} />;
      case 'textarea':
        return <Textarea {...commonProps} minRows={3} disabled={!hasUpdatePermission} />;
      case 'select':
        return <SelectField />;
      case 'multi-select':
        return <MultiSelectField />;
      case 'date':
        return <DatePickerInput {...commonProps} disabled={!hasUpdatePermission} />;
      case 'checkbox':
        return (
          <Checkbox
            key={key}
            label={t(field.label_key ?? key)}
            description={t(field.help_text_key ?? '')}
            {...form.getInputProps(key as any, { type: 'checkbox' })}
            disabled={!hasUpdatePermission}
          />
        );
      case 'relationship':
        const override = relationshipOverrides?.[key];
        return (
          <RelationshipWidget
            key={key}
            title={t(field.label_key ?? key)}
            currentItems={override?.currentItems ?? []}
            availableItems={override?.availableItems ?? []}
            onAdd={override?.onAdd ?? (() => Promise.resolve())}
            onRemove={override?.onRemove ?? (() => Promise.resolve())}
            loading={override?.loading}
            disableAdd={override?.disableAdd}
            searchValue={override?.searchValue}
            onSearchChange={override?.onSearchChange}
            optionsLoading={override?.optionsLoading}
            readOnly={!hasUpdatePermission}
          />
        );
      default:
        return <TextInput {...commonProps} disabled={!hasUpdatePermission} />;
    }
  };

  // Group fields by tab
  const fieldsByTab: Record<string, [string, UIField][]> = {};
  Object.entries(fields).forEach(([key, field]) => {
    const tabId = field.tab_id || 'default';
    if (!fieldsByTab[tabId]) fieldsByTab[tabId] = [];
    fieldsByTab[tabId].push([key, field]);
  });
  Object.values(fieldsByTab).forEach((arr) => arr.sort((a, b) => a[1].order - b[1].order));

  const hasTabs = tabs && tabs.length > 0;

  const formContent = hasTabs ? (
    <Tabs orientation="vertical" variant="pills" value={activeTab ?? (tabs && tabs[0] ? tabs[0].id : 'default')} onChange={setActiveTab} keepMounted={false}>
      <Tabs.List style={{ marginRight: '20px' }}>
      <Card withBorder>  
        {tabs!.map((tab) => (
          <Tabs.Tab key={tab.id} value={tab.id}>
            {t(tab.label_key)}
          </Tabs.Tab>
        ))}
        </Card>
      </Tabs.List>

      {tabs!.map((tab) => (
        <Tabs.Panel key={tab.id} value={tab.id}>
          
          {tab.id === 'compliance' && (
            <Stack mb="md">
              <AssetComplianceManager assetId={externalInitialValues?.id} assetType={resourceType} />
            </Stack>
          )}
          {tab.id === 'documents' && (
            <Stack mb="md">
              <SoftwareDocsManager assetId={externalInitialValues?.id} assetType={resourceType} />
            </Stack>
          )}
          {tab.id === 'software_versions' && (
            <Stack mb="md">
              <SoftwareVersionsManager softwareId={externalInitialValues?.id} />
            </Stack>
          )}
          <Grid align="center" gutter="md">
            {(fieldsByTab[tab.id] || []).map(([k, f]) => (
              <Grid.Col key={k} span={{ base: 12, md: 6 }}>
                {renderField(k, f)}
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>
      ))}

      {/* Fields without tab_id */}
      {fieldsByTab['default'] && (
        <Tabs.Panel key="default" value="default" pt="xs">
          <Grid align="center" gutter="md">
            {fieldsByTab['default'].map(([k, f]) => (
              <Grid.Col key={k} span={{ base: 12, md: 6 }}>
                {renderField(k, f)}
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>
      )}
    </Tabs>
  ) : (
    <Grid align="center" gutter="md">
      {Object.entries(fields).map(([k, f]) => (
        <Grid.Col key={k} span={{ base: 12, md: 6 }}>
          {renderField(k, f)}
        </Grid.Col>
      ))}
    </Grid>
  );

  const handleSubmit = (values: Record<string, any>) => {
    // remove relationship fields and only keep changed keys vs baseline
    const isEqual = (a: any, b: any) => {
      // Treat dates/strings equivalently when stringified
      const norm = (v: any) => {
        if (v instanceof Date) return v.toISOString();
        return v;
      };
      const va = norm(a);
      const vb = norm(b);
      if (Array.isArray(va) && Array.isArray(vb)) {
        if (va.length !== vb.length) return false;
        for (let i = 0; i < va.length; i++) {
          if (!isEqual(va[i], vb[i])) return false;
        }
        return true;
      }
      if (typeof va === 'object' && va !== null && typeof vb === 'object' && vb !== null) {
        try { return JSON.stringify(va) === JSON.stringify(vb); } catch { return false; }
      }
      return va === vb;
    };

    const baseline = baselineRef.current || {};
    const changed: Record<string, any> = {};
    Object.keys(values).forEach((key) => {
      if (relationshipFieldNames.includes(key)) return; // skip relationship fields
      const current = values[key];
      const initial = baseline[key];
      if (!isEqual(current, initial)) {
        changed[key] = current;
      }
    });
    onSubmit(changed);
  };

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        form.onSubmit(handleSubmit)(e);
      }}
      className={className}
    >
      <Stack>
        {formContent}
        <Group justify="flex-end" mt="md">
          {!(activeTab === "groups" || activeTab === "compliance" || activeTab === "documents" || activeTab === "software_versions") && (
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? t('common.submitting') : t('common.submit')}
            </Button>
          )}
        </Group>
      </Stack>
    </form>
  );
};

export default DynamicEditForm; 