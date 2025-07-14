import { useMemo } from 'react';
import { useTableConfig, upsertTableConfig, deleteTableConfig } from '../../src/fetchers';
import { DataType } from './config';
import { TableColumn } from '../../types/utils';
import { useSession } from 'next-auth/react';

export function useVisibleColumns<T>(dataType: DataType, allColumns: TableColumn<T>[]) {
  const { data: session } = useSession();
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
      if (!session?.accessToken) {
        throw new Error('No authentication token available');
      }
      
      await upsertTableConfig(dataType, keys, session.accessToken);
      await mutate();
    } catch (error) {
      console.error('Failed to save table configuration:', error);
      throw error;
    }
  };

  // Reset to default visibility
  const resetVisibility = async () => {
    try {
      if (!session?.accessToken) {
        throw new Error('No authentication token available');
      }
      
      // If no custom config exists, just set cache to null (no need to delete)
      if (persisted === null) {
        await mutate(null, { revalidate: false });
        return;
      }
      
      await deleteTableConfig(dataType, session.accessToken);
      // Set cache to null to indicate no persisted config exists
      await mutate(null, { revalidate: false });
    } catch (error: any) {
      // If it's a 404 error, it means the config doesn't exist, which is fine
      if (error.status === 404) {
        await mutate(null, { revalidate: false });
        return;
      }
      
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