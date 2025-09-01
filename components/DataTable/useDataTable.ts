import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePaginatedData, API_BASE } from '../../src/fetchers';
import { DataType, getDataTableConfig } from './config';
import { PaginatedResponse } from '../../types/models';
import { t } from '../../i18n';

// Hook parameters interface
export interface UseDataTableParams<T> {
  dataType: DataType;
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  initialSearch?: string;
  initialFilters?: Record<string, any>;
}

// Hook return interface
export interface UseDataTableReturn<T> {
  // Data
  data: T[];
  paginatedData?: PaginatedResponse<T>;
  isLoading: boolean;
  error: any;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Sorting
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  
  // Search and filters
  searchQuery: string;
  filters: Record<string, any>;
  
  // Actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (field: string, order: 'asc' | 'desc') => void;
  setSearch: (query: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  refresh: () => void;
  // Recycle bin
  isRecycleBin: boolean;
  setRecycleBin: (enabled: boolean) => void;
  
  // Selection
  selectedItems: T[];
  setSelectedItems: (items: T[]) => void;
  
  // Utility
  hasData: boolean;
  isEmpty: boolean;
}

// Hook implementation
export function useDataTable<T extends { id: number | string }>({
  dataType,
  initialPage = 1,
  initialPageSize,
  initialSortBy,
  initialSortOrder = 'asc',
  initialSearch = '',
  initialFilters = {},
}: UseDataTableParams<T>): UseDataTableReturn<T> {
  // Get configuration for the data type
  const config = getDataTableConfig<T>(dataType, t);
  
  // Initialize state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize || config.defaultPageSize);
  const [sortBy, setSortBy] = useState(initialSortBy || config.defaultSort?.field);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFiltersState] = useState(initialFilters);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [isRecycleBin, setRecycleBin] = useState(false);
  const [, forceUpdate] = useState({});

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    window.addEventListener('storage', handleLanguageChange);
    return () => {
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);
  
  // Build query parameters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      per_page: pageSize,
    };
    
    if (sortBy) {
      // When recycle bin is enabled, map updated_at to deleted_at for server-side sorting
      const serverSortBy = (isRecycleBin && String(sortBy) === 'updated_at') ? 'deleted_at' : sortBy;
      params.sort_by = serverSortBy;
      params.sort_order = sortOrder;
    }
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[`filter_${key}`] = value;
      }
    });
    
    return params;
  }, [currentPage, pageSize, sortBy, sortOrder, searchQuery, filters]);
  
  // Compute endpoint from data type and recycle bin mode
  const API_BASE = process.env.NEXT_PUBLIC_API_URL
  const basePathMap: Record<DataType, string> = {
    users: `${API_BASE}/users`,
    roles: `${API_BASE}/roles`,
    groups: `${API_BASE}/groups`,
    computers: `${API_BASE}/assets/computers`,
    network_devices: `${API_BASE}/assets/network_devices`,
    virtual_machines: `${API_BASE}/assets/virtual_machines`,
    software: `${API_BASE}/assets/software`,
    certificate_keys: `${API_BASE}/assets/certificate_keys`,
    asset_types: `${API_BASE}/asset-types`,
    manufacturers: `${API_BASE}/reference_data/manufacturers`,
    locations: `${API_BASE}/reference_data/locations`,
  };

  const recyclePathMap: Partial<Record<DataType, string>> = {
    users: `${API_BASE}/recycle_bin/users`,
    groups: `${API_BASE}/recycle_bin/groups`,
    computers: `${API_BASE}/recycle_bin/assets/computers`,
    network_devices: `${API_BASE}/recycle_bin/assets/network_devices`,
    virtual_machines: `${API_BASE}/recycle_bin/assets/virtual_machines`,
    software: `${API_BASE}/recycle_bin/assets/software`,
    certificate_keys: `${API_BASE}/recycle_bin/assets/certificate_keys`,
  };

  const endpointPath = isRecycleBin
    ? (recyclePathMap[dataType] ?? basePathMap[dataType])
    : basePathMap[dataType];

  const endpoint = `${API_BASE}${endpointPath}`;

  const { data: paginatedData, isLoading, isError, mutate } = usePaginatedData<T>(endpoint, queryParams);
  
  // Extract data and metadata
  const data = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = paginatedData?.total_pages || 0;
  
  // Action handlers
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
    // The useEffect or SWR should re-fetch with new params
  }, []);
  
  const setSort = useCallback((field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  }, []);
  
  const setSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);
  
  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);
  
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setCurrentPage(1);
  }, []);
  
  const refresh = useCallback(() => {
    mutate(undefined, { revalidate: true });
  }, [mutate]);
  
  // Computed values
  const hasData = data.length > 0;
  const isEmpty = !isLoading && data.length === 0;
  
  return {
    // Data
    data: data as unknown as T[],
    paginatedData: paginatedData as unknown as PaginatedResponse<T> | undefined,
    isLoading,
    error: isError,
    
    // Pagination
    currentPage,
    // @ts-ignore
    pageSize,
    totalItems,
    totalPages,
    
    // Sorting
    sortBy: sortBy ? String(sortBy) : undefined,
    sortOrder,
    
    // Search and filters
    searchQuery,
    filters,
    
    // Actions
    setPage,
    setPageSize: handlePageSizeChange,
    setSort,
    setSearch,
    setFilters,
    clearFilters,
    refresh,
    // Recycle bin
    isRecycleBin,
    setRecycleBin,
    
    // Selection
    selectedItems,
    setSelectedItems,
    
    // Utility
    hasData,
    isEmpty,
  };
} 