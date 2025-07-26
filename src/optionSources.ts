import { useManufacturers, useLocations, useGroups, useUsers, useRoles } from '@/fetchers';

/**
 * Small helper type used by DynamicForm. Mirrors the one defined there but
 * duplicated here to avoid a circular dependency between components and hooks.
 */
export interface UIFieldOption {
  value: string | number | boolean | null;
  label_key: string;
  label_params?: Record<string, any>;
}

export interface OptionSourceHookResult<T = any> {
  data?: { data?: T[] };
  isLoading: boolean;
  mutate: () => any;
}

export interface OptionSource {
  /**
   * React hook returning a SWR response with `{ data?: {data: any[]} }` shape
   */
  hook: () => OptionSourceHookResult;
  /**
   * Converts an item returned by the API into a UIFieldOption used by DynamicForm
   */
  buildOption: (item: any) => UIFieldOption;
  /**
   * "No value" option that will always be inserted as the first element.
   */
  emptyOption: UIFieldOption;
}

/**
 * Central registry mapping form field names → option sources.
 *
 * Adding a new dynamic select is now as easy as inserting one more entry here.
 */
export const optionSources: Record<string, OptionSource> = {
  // -------------------------------------------------------------------------
  // Computers ▸ manufacturer_id
  // -------------------------------------------------------------------------
  manufacturer_id: {
    hook: () => useManufacturers({ per_page: 9999 }),
    buildOption: (item: any) => ({
      value: String(item.id),
      label_key:
        item.name,
      label_params: {
        name: item.name,
        description: item.comment ?? '',
      },
    }),
    emptyOption: {
      value: '',
      label_key: 'forms.computer.fields.manufacturer_id.options.no_manufacturer',
    },
  },

  // -------------------------------------------------------------------------
  // Computers ▸ location_id
  // -------------------------------------------------------------------------
  location_id: {
    hook: () => useLocations({ per_page: 9999 }),
    buildOption: (item: any) => ({
      value: String(item.id),
      label_key: item.name,
      label_params: {
        name: item.name,
        description: item.comment ?? '',
      },
    }),
    emptyOption: {
      value: '',
      label_key: 'forms.computer.fields.location_id.options.no_location',
    },
  },

  // -------------------------------------------------------------------------
  // Computers ▸ group_id
  // -------------------------------------------------------------------------
  group_id: {
    hook: () => useGroups({ per_page: 9999 }),
    buildOption: (item: any) => ({
      value: String(item.id),
      label_key: 'forms.computer.fields.group_id.options.group_name',
      label_params: {
        name: item.name,
        type: item.type ?? 'group',
      },
    }),
    emptyOption: {
      value: '',
      label_key: 'forms.computer.fields.group_id.options.no_group',
    },
  },

  // -------------------------------------------------------------------------
  // Computers ▸ assigned_to
  // -------------------------------------------------------------------------
  assigned_to: {
    hook: () => useUsers({ per_page: 9999 }),
    buildOption: (item: any) => ({
      value: String(item.id),
      label_key: 'forms.computer.fields.assigned_to.options.user_name',
      label_params: {
        name: item.full_name ?? item.username,
      },
    }),
    emptyOption: {
      value: '',
      label_key: 'forms.computer.fields.assigned_to.options.no_user',
    },
  },

  // -------------------------------------------------------------------------
  // Users ▸ role_id
  // -------------------------------------------------------------------------
  role_id: {
    hook: () => useRoles({ per_page: 9999 }),
    buildOption: (item: any) => ({
      value: String(item.id),
      label_key: 'forms.user.fields.role_id.options.role_name',
      label_params: {
        name: item.name,
        description: item.description ?? '',
      },
    }),
    emptyOption: {
      value: '',
      label_key: 'forms.user.fields.role_id.options.no_role',
    },
  },
}; 