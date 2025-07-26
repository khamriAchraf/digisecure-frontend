import { useMemo } from 'react';
import { optionSources, UIFieldOption } from '@/optionSources';

interface DynamicOptionsHookResult {
  options?: UIFieldOption[];
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Provides dynamic select/multi-select options for the given field name.
 * Falls back to `undefined` if no option source exists so the caller can
 * gracefully revert to the static options present in the JSON schema.
 */
export const useDynamicOptions = (fieldName: string): DynamicOptionsHookResult => {
  const source = optionSources[fieldName];

  // No dynamic source registered → let the form use static options.
  if (!source) {
    return {
      options: undefined,
      isLoading: false,
      refresh: () => {},
    };
  }

  const { data, isLoading, mutate } = source.hook();
  // Allow both paginated and raw-array responses
  const list: any[] = Array.isArray(data)
    ? (data as any[])
    : (data?.data ?? []);

  const options = useMemo<UIFieldOption[]>(() => {
    // Always include the empty option
    return [
      source.emptyOption,
      ...list.map(source.buildOption),
    ];
  }, [list, source]);

  return {
    options,
    isLoading,
    refresh: mutate,
  };
}; 