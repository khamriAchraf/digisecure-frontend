import { useMemo } from 'react';
import { useTableConfig, upsertTableConfig, deleteTableConfig } from '../../src/fetchers';
import { DataType } from './config';
import { TableColumn } from '../../types/utils';

export function useVisibleColumns<T>(dataType: DataType, allColumns: TableColumn<T>[]) {
  const { data: persisted, mutate } = useTableConfig(dataType);
  
  // Memoize the default column keys to prevent recreation on every render
  const defaultColumnKeys = useMemo(
    () => allColumns.map(c => String(c.key)),
    [allColumns]
  );
  
  // Use persisted columns if available, otherwise use all columns
  const visibleKeys = useMemo(
    () => persisted?.columns ?? defaultColumnKeys,
    [persisted?.columns, defaultColumnKeys]
  );
  
  // Filter columns based on visible keys
  const visibleColumns = useMemo(
    () => allColumns.filter(c => visibleKeys.includes(String(c.key))),
    [allColumns, visibleKeys]
  );

  // Save visibility configuration
  const saveVisibility = async (keys: string[]) => {
    try {
      await upsertTableConfig(dataType, keys);
      await mutate();
    } catch (error) {
      console.error('Failed to save table configuration:', error);
      throw error;
    }
  };

  // Reset to default visibility
  const resetVisibility = async () => {
    try {
      // If no custom config exists, just set cache to null (no need to delete)
      if (persisted === null) {
        await mutate(null, { revalidate: false });
        return;
      }
      await deleteTableConfig(dataType);
      // Set cache to null to indicate no persisted config exists
      await mutate(null, { revalidate: false });
    } catch (error: any) {
      console.error('Failed to reset table configuration:', error);
      throw error;
    }
  };

  return { 
    visibleColumns, 
    visibleKeys, 
    saveVisibility, 
    resetVisibility,
    isLoading: false, // Could be enhanced to track loading state
    hasCustomConfig: persisted !== null, // Whether user has a custom config saved
  };
} 