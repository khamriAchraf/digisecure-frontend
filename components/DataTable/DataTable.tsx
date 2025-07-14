import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TextInput,
  Select,
  Button,
  Group,
  Paper,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Checkbox,
  Pagination,
  Stack,
  Flex,
  Box,
  LoadingOverlay,
  Alert,
  Modal,
  Textarea,
  Divider,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconDownload,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DataTableConfig, getDataTableConfig, DataType } from './config';
import { PaginatedResponse } from '../../types/models';
import { TableColumn } from '../../types/utils';

// Props interface for the DataTable component
export interface DataTableProps<T> {
  // Data and configuration
  dataType: DataType;
  data?: T[];
  paginatedData?: PaginatedResponse<T>;
  isLoading?: boolean;
  error?: string | null;
  
  // Custom configuration (optional, will use default if not provided)
  config?: Partial<DataTableConfig<T>>;
  
  // Callbacks
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (field: keyof T, order: 'asc' | 'desc') => void;
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onRefresh?: () => void;
  
  // Action callbacks
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onCreate?: () => void;
  onExport?: () => void;
  
  // Selection
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  
  // Customization
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  showPagination?: boolean;
  showPageSizeSelector?: boolean;
  showRefreshButton?: boolean;
  showCreateButton?: boolean;
  showExportButton?: boolean;
  
  // Styling
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  className?: string;
}

// Internal state interface
interface DataTableState<T> {
  searchQuery: string;
  filters: Record<string, any>;
  sortBy?: keyof T;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  selectedRows: T[];
}

export function DataTable<T extends { id: number | string }>({
  dataType,
  data = [],
  paginatedData,
  isLoading = false,
  error = null,
  config: customConfig,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearchChange,
  onFilterChange,
  onRefresh,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onExport,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  title,
  showSearch = true,
  showFilters = true,
  showActions = true,
  showPagination = true,
  showPageSizeSelector = true,
  showRefreshButton = true,
  showCreateButton = true,
  showExportButton = true,
  height,
  minHeight,
  maxHeight,
  className,
}: DataTableProps<T>) {
  // Get configuration for the data type
  const defaultConfig = getDataTableConfig<T>(dataType);
  const config = { ...defaultConfig, ...customConfig };
  
  // State management
  const [state, setState] = useState<DataTableState<T>>({
    searchQuery: '',
    filters: {},
    sortBy: config.defaultSort?.field,
    sortOrder: config.defaultSort?.order || 'asc',
    currentPage: 1,
    pageSize: config.defaultPageSize || 20,
    selectedRows: selectedItems,
  });
  
  const [filterModalOpened, { open: openFilterModal, close: closeFilterModal }] = useDisclosure(false);
  const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
  
  // Use paginated data if available, otherwise use regular data
  const tableData = paginatedData?.data || data;
  const totalItems = paginatedData?.total || data.length;
  const totalPages = paginatedData?.total_pages || Math.ceil(totalItems / state.pageSize);
  
  // Memoized data with optional client-side sorting only (filtering handled by backend)
  const processedData = useMemo(() => {
    const dataCopy = [...tableData];

    // Apply sorting (if enabled)
    if (state.sortBy && config.sortableFields.includes(state.sortBy)) {
      dataCopy.sort((a, b) => {
        const aValue = a[state.sortBy!];
        const bValue = b[state.sortBy!];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = String(aValue).localeCompare(String(bValue));
        return state.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return dataCopy;
  }, [tableData, state.sortBy, state.sortOrder, config]);
  
  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, searchQuery: value, currentPage: 1 }));
    onSearchChange?.(value);
  }, [onSearchChange]);
  
  const handleSortChange = useCallback((field: keyof T) => {
    const newOrder = state.sortBy === field && state.sortOrder === 'asc' ? 'desc' : 'asc';
    setState(prev => ({ ...prev, sortBy: field, sortOrder: newOrder }));
    onSortChange?.(field, newOrder);
  }, [state.sortBy, state.sortOrder, onSortChange]);
  
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
    onPageChange?.(page);
  }, [onPageChange]);
  
  const handlePageSizeChange = useCallback((pageSize: string | null) => {
    const newPageSize = parseInt(pageSize || '0');
    setState(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }));
    onPageSizeChange?.(newPageSize);
  }, [onPageSizeChange]);
  
  const handleSelectionChange = useCallback((item: T, checked: boolean) => {
    const newSelection = checked
      ? [...state.selectedRows, item]
      : state.selectedRows.filter(row => row.id !== item.id);
    
    setState(prev => ({ ...prev, selectedRows: newSelection }));
    onSelectionChange?.(newSelection);
  }, [state.selectedRows, onSelectionChange]);
  
  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? [...processedData] : [];
    setState(prev => ({ ...prev, selectedRows: newSelection }));
    onSelectionChange?.(newSelection);
  }, [processedData, onSelectionChange]);
  
  const handleFilterChange = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      currentPage: 1
    }));
    onFilterChange?.({ ...state.filters, [key]: value });
  }, [state.filters, onFilterChange]);
  
  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: {}, currentPage: 1 }));
    onFilterChange?.({});
  }, [onFilterChange]);
  
  // Render functions
  const renderCell = (column: TableColumn<T>, item: T) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    if (value === null || value === undefined) {
      return <Text c="dimmed">N/A</Text>;
    }
    
    return <Text>{String(value)}</Text>;
  };
  
  const renderSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable || !config.sortableFields.includes(column.key)) {
      return null;
    }
    
    if (state.sortBy === column.key) {
      return state.sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />;
    }
    
    return <IconSortAscending size={16} style={{ opacity: 0.3 }} />;
  };
  
  // Table header
  const tableHeader = (
    <Group justify="space-between" mb="md">
      <Group>
        {config.icon && <config.icon size={24} />}
        <Text fw={600} size="lg">
          {title || `${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`}
        </Text>
        {totalItems > 0 && (
          <Badge variant="light" color="blue">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Badge>
        )}
      </Group>
      
      <Group>
        {showRefreshButton && (
          <ActionIcon
            variant="light"
            onClick={onRefresh}
            loading={isLoading}
            title="Refresh"
          >
            <IconRefresh size={16} />
          </ActionIcon>
        )}
        
        {showCreateButton && onCreate && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onCreate}
            size="sm"
          >
            Create
          </Button>
        )}
        
        {showExportButton && onExport && (
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={onExport}
            variant="light"
            size="sm"
          >
            Export
          </Button>
        )}
        
        <Menu>
          <Menu.Target>
            <ActionIcon variant="light">
              <IconSettings size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={openSettingsModal}>
              <IconSettings size={16} />
              Table Settings
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
  
  // Search and filters
  const searchAndFilters = (
    <Group mb="md" gap="sm">
      {showSearch && (
        <TextInput
          placeholder="Search..."
          value={state.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
          size="sm"
        />
      )}
      
      {showFilters && (
        <Button
          variant="light"
          leftSection={<IconFilter size={16} />}
          onClick={openFilterModal}
          size="sm"
        >
          Filters
        </Button>
      )}
      
      {Object.keys(state.filters).length > 0 && (
        <Button
          variant="subtle"
          onClick={clearFilters}
          size="sm"
        >
          Clear Filters
        </Button>
      )}
    </Group>
  );
  
  // Table content
  const tableContent = (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          {selectable && (
            <Table.Th style={{ width: 40 }}>
              <Checkbox
                checked={processedData.length > 0 && state.selectedRows.length === processedData.length}
                indeterminate={state.selectedRows.length > 0 && state.selectedRows.length < processedData.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </Table.Th>
          )}
          
          {config.columns.map((column) => (
            <Table.Th
              key={String(column.key)}
              style={{ width: column.width, cursor: column.sortable ? 'pointer' : 'default' }}
              onClick={() => column.sortable && handleSortChange(column.key)}
            >
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" fw={500}>
                  {column.label}
                </Text>
                {renderSortIcon(column)}
              </Group>
            </Table.Th>
          ))}
          
          {showActions && (onView || onEdit || onDelete) && (
            <Table.Th style={{ width: 50 }}>Actions</Table.Th>
          )}
        </Table.Tr>
      </Table.Thead>
      
      <Table.Tbody>
        {processedData.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={config.columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)}>
              <Text ta="center" c="dimmed" py="xl">
                {isLoading ? 'Loading...' : 'No data found'}
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          processedData.map((item) => (
            <Table.Tr key={item.id}>
              {selectable && (
                <Table.Td>
                  <Checkbox
                    checked={state.selectedRows.some(row => row.id === item.id)}
                    onChange={(e) => handleSelectionChange(item, e.target.checked)}
                  />
                </Table.Td>
              )}
              
              {config.columns.map((column) => (
                <Table.Td key={String(column.key)}>
                  {renderCell(column, item)}
                </Table.Td>
              ))}
              
              {showActions && (onView || onEdit || onDelete) && (
                <Table.Td>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant="light" size="sm">
                        <IconDotsVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {onView && (
                        <Menu.Item onClick={() => onView(item)}>
                          <IconEye size={16} />
                          View
                        </Menu.Item>
                      )}
                      {onEdit && (
                        <Menu.Item onClick={() => onEdit(item)}>
                          <IconEdit size={16} />
                          Edit
                        </Menu.Item>
                      )}
                      {onDelete && (
                        <Menu.Item onClick={() => onDelete(item)} color="red">
                          <IconTrash size={16} />
                          Delete
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              )}
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );
  
  // Pagination
  const pagination = showPagination && (
    <Group justify="space-between" mt="md">
      {/* Left side: page-size selector + item range */}
      <Group>
        {showPageSizeSelector && config.pageSizeOptions && (
          <Select
            label="Items per page"
            value={String(state.pageSize)}
            onChange={handlePageSizeChange}
            data={config.pageSizeOptions.map(size => ({ value: String(size), label: String(size) }))}
            size="sm"
            style={{ width: 120 }}
          />
        )}

        <Text size="sm" c="dimmed">
          Showing {((state.currentPage - 1) * state.pageSize) + 1} to{' '}
          {Math.min(state.currentPage * state.pageSize, totalItems)} of {totalItems} items
        </Text>
      </Group>

      {/* Right side: pagination control only if more than one page */}
      {totalPages > 1 && (
        <Pagination
          value={state.currentPage}
          onChange={handlePageChange}
          total={totalPages}
          size="sm"
        />
      )}
    </Group>
  );
  
  // Filter modal
  const filterModal = (
    <Modal opened={filterModalOpened} onClose={closeFilterModal} title="Filters" size="md">
      <Stack>
        {config.columns
          .filter(column => column.filterable)
          .map((column) => (
            <TextInput
              key={String(column.key)}
              label={column.label}
              value={state.filters[String(column.key)] || ''}
              onChange={(e) => handleFilterChange(String(column.key), e.target.value)}
              placeholder={`Filter by ${column.label.toLowerCase()}...`}
            />
          ))}
        
        <Group justify="flex-end">
          <Button variant="light" onClick={clearFilters}>
            Clear All
          </Button>
          <Button onClick={closeFilterModal}>
            Apply Filters
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
  
  // Settings modal
  const settingsModal = (
    <Modal opened={settingsModalOpened} onClose={closeSettingsModal} title="Table Settings" size="md">
      <Stack>
        <Text size="sm" c="dimmed">
          Configure table display options and behavior.
        </Text>
        
        <Divider />
        
        <Text fw={500}>Visible Columns</Text>
        {config.columns.map((column) => (
          <Checkbox
            key={String(column.key)}
            label={column.label}
            defaultChecked={true}
            disabled
          />
        ))}
        
        <Text size="sm" c="dimmed">
          Column visibility can be configured in the table configuration file.
        </Text>
      </Stack>
    </Modal>
  );
  
  return (
    <Paper p="md" className={className} style={{ height, minHeight, maxHeight }}>
      <LoadingOverlay visible={isLoading} />
      
      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}
      
      {tableHeader}
      {searchAndFilters}
      
      <Box style={{ overflow: 'auto' }}>
        {tableContent}
      </Box>
      
      {pagination}
      {filterModal}
      {settingsModal}
    </Paper>
  );
} 