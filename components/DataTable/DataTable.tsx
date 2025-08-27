import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  Title,
  Switch,
  Center,
  Skeleton,
  Tooltip,
  Card,
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
  IconUpload,
  IconRecycle,
  IconChevronDown,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DataTableConfig, getDataTableConfig, DataType } from './config';
import { PaginatedResponse } from '../../types/models';
import { TableColumn } from '../../types/utils';
import { t } from '../../i18n';
import { useVisibleColumns } from './useVisibleColumns';
import { useHasPermission, PERMISSIONS } from '../../src/hooks/usePermissions';
import { useConfirmMessages } from './useConfirmMessages';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

// Helper function to get create permission for a data type
const getCreatePermission = (dataType: DataType): string => {
  switch (dataType) {
    case 'users':
      return PERMISSIONS.USER_CREATE;
    case 'roles':
      return PERMISSIONS.ROLE_CREATE;
    case 'groups':
      return PERMISSIONS.GROUP_CREATE;
    case 'network_devices':
      return PERMISSIONS.NETWORK_DEVICE_CREATE;
    case 'computers':
      return PERMISSIONS.COMPUTER_CREATE;
    case 'software':
      return PERMISSIONS.SOFTWARE_CREATE;
    case 'virtual_machines':
      return PERMISSIONS.VIRTUAL_MACHINE_CREATE;
    case 'asset_types':
    case 'manufacturers':
    case 'locations':
      // These reference data types use reference data permissions
      return PERMISSIONS.REFERENCE_DATA_CREATE;
    case 'certificate_keys':
      return PERMISSIONS.CERTIFICATE_KEY_CREATE;
    default:
      console.warn(`No permission mapping found for data type: "${dataType}"`);
      return '';
  }
};

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
  onImport?: () => void;
  onBulkDelete?: (items: T[]) => void;
  onBulkRestore?: (items: T[]) => void;
  onBulkPurge?: (items: T[]) => void;

  // Optional handler triggered when a table row is clicked
  onRowClick?: (item: T) => void;

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

  // Recycle bin mode
  recycleBin?: boolean;
  onRecycleBinChange?: (enabled: boolean) => void;
  onRestore?: (item: T) => void;
  onPurge?: (item: T) => void;

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
  onImport,
  onBulkDelete,
  onBulkRestore,
  onBulkPurge,
  onRowClick,
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
  recycleBin,
  onRecycleBinChange,
  onRestore,
  onPurge,
  height,
  minHeight,
  maxHeight,
  className,
}: DataTableProps<T>) {
  // Get configuration for the data type
  const defaultConfig = getDataTableConfig<T>(dataType, t);
  const config = { ...defaultConfig, ...customConfig };

  // Get visible columns from user preferences
  const {
    visibleColumns,
    visibleKeys,
    saveVisibility,
    resetVisibility,
    hasCustomConfig,
  } = useVisibleColumns(dataType, config.columns);

  // Check if user has create permission for this data type
  const createPermission = getCreatePermission(dataType);
  const hasCreatePermission = useHasPermission(createPermission);

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
  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<T | null>(null);
  const [confirmPurgeOpened, { open: openPurgeModal, close: closePurgeModal }] = useDisclosure(false);
  const [confirmPurgeItem, setConfirmPurgeItem] = useState<T | null>(null);
  const [confirmBulkOpened, { open: openConfirmBulk, close: closeConfirmBulk }] = useDisclosure(false);
  const [confirmBulkPurgeOpened, { open: openConfirmBulkPurge, close: closeConfirmBulkPurge }] = useDisclosure(false);

  // Clear error when settings modal is closed
  const handleCloseSettingsModal = useCallback(() => {
    setSettingsError(null);
    closeSettingsModal();
  }, [closeSettingsModal]);
  const [columnDraft, setColumnDraft] = useState<Set<string>>(new Set());
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const prevVisibleKeysRef = useRef<string[]>([]);
  const [internalRecycleBin, setInternalRecycleBin] = useState(false);
  const effectiveRecycleBin = typeof recycleBin === 'boolean' ? recycleBin : internalRecycleBin;

  // When recycle bin is ON, we still keep the same column key (updated_at) for persistence,
  // but display label/value from deleted_at.
  const displayColumns = useMemo(() => {
    return visibleColumns.map((c) => {
      if (effectiveRecycleBin && String(c.key) === 'updated_at') {
        return { ...c, label: t('datatable.deletedAt') } as typeof c;
      }
      return c;
    });
  }, [visibleColumns, effectiveRecycleBin]);

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
        const sortField = (effectiveRecycleBin && state.sortBy === 'updated_at')
          ? 'deleted_at'
          : String(state.sortBy);
        const aValue = (a as any)[sortField];
        const bValue = (b as any)[sortField];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = String(aValue).localeCompare(String(bValue));
        return state.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return dataCopy;
  }, [tableData, state.sortBy, state.sortOrder, config, effectiveRecycleBin]);

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, searchQuery: value, currentPage: 1 }));
    onSearchChange?.(value);
  }, [onSearchChange]);

  const handleSortChange = useCallback((field: keyof T) => {
    const newOrder = state.sortBy === field && state.sortOrder === 'asc' ? 'desc' : 'asc';
    setState(prev => ({ ...prev, sortBy: field, sortOrder: newOrder }));
    const apiField = (effectiveRecycleBin && String(field) === 'updated_at')
      ? ('deleted_at' as unknown as keyof T)
      : field;
    onSortChange?.(apiField, newOrder);
  }, [state.sortBy, state.sortOrder, onSortChange, effectiveRecycleBin]);

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

  const getItemLabel = useCallback((item: any) => {
    const candidateKeys = ['username', 'full_name', 'name', 'email', 'serial_number'];
    for (const key of candidateKeys) {
      if (item && item[key]) return String(item[key]);
    }
    return `#${String(item?.id)}`;
  }, []);

  // Column visibility handlers
  const handleColumnToggle = useCallback((columnKey: string, checked: boolean) => {
    setColumnDraft(prevDraft => {
      const newDraft = new Set(prevDraft);
      if (checked) {
        newDraft.add(columnKey);
      } else {
        newDraft.delete(columnKey);
      }
      return newDraft;
    });
  }, []);

  const handleSaveSettings = useCallback(async () => {
    setIsSavingSettings(true);
    setSettingsError(null);
    try {
      const currentDraft = Array.from(columnDraft);
      if (currentDraft.length === 0) return; // Must have at least one column

      await saveVisibility(currentDraft);
      handleCloseSettingsModal();
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettingsError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  }, [columnDraft, saveVisibility, handleCloseSettingsModal]);

  const handleResetSettings = useCallback(async () => {
    setIsSavingSettings(true);
    setSettingsError(null);
    try {
      await resetVisibility();
      setColumnDraft(new Set(config.columns.map(c => String(c.key))));
      handleCloseSettingsModal();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setSettingsError(error instanceof Error ? error.message : 'Failed to reset settings');
    } finally {
      setIsSavingSettings(false);
    }
  }, [resetVisibility, config.columns, handleCloseSettingsModal]);

  // Update draft when visibleKeys change
  useEffect(() => {
    if (visibleKeys.length === 0) return; // Don't update if visibleKeys is empty

    const currentKeys = Array.from(visibleKeys).sort();
    const prevKeys = prevVisibleKeysRef.current;

    // Only update if the keys are actually different
    if (JSON.stringify(currentKeys) !== JSON.stringify(prevKeys)) {
      setColumnDraft(new Set(visibleKeys));
      prevVisibleKeysRef.current = currentKeys;
    }
  }, [visibleKeys]);

  // Render functions
  const renderCell = (column: TableColumn<T>, item: T) => {
    const isUpdatedAt = String(column.key) === 'updated_at';
    const value = (effectiveRecycleBin && isUpdatedAt)
      ? (item as any)['deleted_at']
      : (item as any)[column.key as any];

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
        {config.icon && <config.icon size={28} />}
        <Title order={2} c={effectiveRecycleBin ? 'red' : 'inherit'}>
          {title || `${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`}
        </Title>
        {totalItems > 0 && !effectiveRecycleBin && (
          <Badge variant="light">
            {totalItems} {totalItems === 1 ? t('datatable.item') : t('datatable.items')}
          </Badge>
        )}
      </Group>

      <Card p="xs" withBorder>
        <Group gap='sm'>

          {selectable && state.selectedRows.length > 1 && (
            <Group>
              <Menu>
                <Menu.Target>
                  <Button variant="outline" size="sm" rightSection={<IconChevronDown size={16} />}>
                    {t('datatable.bulkActions')} ({state.selectedRows.length})
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {!effectiveRecycleBin && (
                    <Menu.Item
                      leftSection={<IconTrash size={16} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmBulk();
                      }}
                    >
                      {t('datatable.deleteAll')}
                    </Menu.Item>
                  )}
                  {effectiveRecycleBin && (
                    <Menu.Item
                      leftSection={<IconRecycle size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onBulkRestore) {
                          onBulkRestore(state.selectedRows);
                        } else if (onRestore) {
                          state.selectedRows.forEach((item) => onRestore(item));
                        }
                        setState(prev => ({ ...prev, selectedRows: [] }));
                      }}
                    >
                      {t('common.restore')}
                    </Menu.Item>
                  )}
                  {effectiveRecycleBin && (
                    <Menu.Item
                      leftSection={<IconTrash size={16} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmBulkPurge();
                      }}
                    >
                      {t('common.purge')}
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
              <Divider orientation="vertical" />
            </Group>
          )}

          {(!effectiveRecycleBin) && showCreateButton && onCreate && hasCreatePermission && (
            <React.Fragment>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onCreate}
                size="sm"
              >
                {t('common.create')}
              </Button>
              <Tooltip label={t('datatable.import')}>
                <ActionIcon variant="light" size="lg" onClick={onImport} loading={isLoading}>
                  <IconDownload size={16} />
                </ActionIcon>
              </Tooltip>
              <Divider orientation="vertical" />

            </React.Fragment>
          )}

          {(!effectiveRecycleBin) && showExportButton && onExport && (
            <Tooltip label={t('datatable.export')}>
              <ActionIcon variant="light" size="lg" onClick={onExport} loading={isLoading}>
                <IconUpload size={16} />
              </ActionIcon>
            </Tooltip>
          )}



          {showRefreshButton && (
            <Tooltip label={t('datatable.refresh')}>
              <ActionIcon variant="light" size="lg" onClick={onRefresh} loading={isLoading}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          )}



          <Menu>
            <Menu.Target>
              <Tooltip label={t('datatable.tableSettings')}>
                <ActionIcon size="lg" variant="light">
                  <IconSettings size={16} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => {
                setSettingsError(null);
                openSettingsModal();
              }}>
                <IconSettings size={16} />
                {t('datatable.tableSettings')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card>
    </Group>
  );

  // Search and filters
  const searchAndFilters = (
    <Group mb="md" gap="sm">
      {showSearch && (
        <TextInput
          placeholder={t('datatable.searchPlaceholder')}
          value={state.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftSection={<IconSearch size={16} />}
          style={{ width: 400 }}
          size="sm"
        />
      )}

      {Object.keys(state.filters).length > 0 && (
        <Button
          variant="subtle"
          onClick={clearFilters}
          size="sm"
        >
          {t('datatable.clearFilters')}
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
                style={{ cursor: 'pointer' }}
              />
            </Table.Th>
          )}

          {displayColumns.map((column) => (
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

          {showActions && (effectiveRecycleBin || (onView || onEdit || onDelete)) && (
            <Table.Th style={{ width: 50 }}>{t('datatable.actions')}</Table.Th>
          )}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {processedData.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={displayColumns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)}>
              <Text ta="center" c="dimmed" py="xl">
                {isLoading ? t('common.loading') : t('datatable.noDataFound')}
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          processedData.map((item) => (
            <Table.Tr
              key={item.id}
              onClick={() => !effectiveRecycleBin && onRowClick?.(item)}
              style={onRowClick && !effectiveRecycleBin ? { cursor: 'pointer' } : undefined}
            >
              {selectable && (
                <Table.Td>
                  <Checkbox
                    checked={state.selectedRows.some(row => row.id === item.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                    onChange={(e) => {
                      handleSelectionChange(item, e.target.checked);
                    }}
                  />
                </Table.Td>
              )}

              {displayColumns.map((column) => (
                <Table.Td key={String(column.key)}>
                  {renderCell(column, item)}
                </Table.Td>
              ))}

              {showActions && (effectiveRecycleBin || (onView || onEdit || onDelete)) && (
                <Table.Td>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant="light" size="sm" onClick={(e) => e.stopPropagation()}>
                        <IconDotsVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {!effectiveRecycleBin && onEdit && (
                        <Menu.Item onClick={(e) => { e.stopPropagation(); onEdit(item); }} leftSection={<IconEdit size={16} />}>
                          {t('common.edit')}
                        </Menu.Item>
                      )}
                      {!effectiveRecycleBin && onDelete && (
                        <Menu.Item
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteItem(item);
                            openConfirmModal();
                          }}
                          color="red"
                          leftSection={<IconTrash size={16} />}
                        >
                          {t('common.delete')}
                        </Menu.Item>
                      )}
                      {effectiveRecycleBin && (
                        <Menu.Item onClick={(e) => { e.stopPropagation(); onRestore?.(item); }} leftSection={<IconRecycle size={16} />}>
                          {t('common.restore')}
                        </Menu.Item>
                      )}
                      {effectiveRecycleBin && (
                        <Menu.Item onClick={(e) => { e.stopPropagation(); setConfirmPurgeItem(item); openPurgeModal(); }} color="red" leftSection={<IconTrash size={16} />}>
                          {t('common.purge')}
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
            label={t('datatable.itemsPerPage')}
            searchable={false}
            value={String(state.pageSize)}
            onChange={handlePageSizeChange}
            data={config.pageSizeOptions.map(size => ({ value: String(size), label: String(size) }))}
            size="sm"
            checkIconPosition="right"
            style={{ width: 120 }}
            allowDeselect={false}
          />
        )}

        <Text size="sm" c="dimmed">
          {t('datatable.showing')} {((state.currentPage - 1) * state.pageSize) + 1} {t('datatable.to')}{' '}
          {Math.min(state.currentPage * state.pageSize, totalItems)} {t('datatable.of')} {totalItems} {t('datatable.items')}
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
      <Switch
        size="md"
        color="red"
        checked={!!effectiveRecycleBin}
        onChange={(e) => {
          const checked = e.currentTarget.checked;
          if (onRecycleBinChange) {
            onRecycleBinChange(checked);
          } else {
            setInternalRecycleBin(checked);
          }
        }}
        offLabel={<IconTrash size={12} />}
        onLabel={<IconTrash size={12} />}

      />
    </Group>
  );

  // Filter modal
  const filterModal = (
    <Modal opened={filterModalOpened} onClose={closeFilterModal} title={t('datatable.filters')} size="md">
      <Stack>
        {config.columns
          .filter(column => column.filterable)
          .map((column) => (
            <TextInput
              key={String(column.key)}
              label={column.label}
              value={state.filters[String(column.key)] || ''}
              onChange={(e) => handleFilterChange(String(column.key), e.target.value)}
              placeholder={`${t('datatable.filterBy')} ${column.label.toLowerCase()}...`}
            />
          ))}

        <Group justify="flex-end">
          <Button variant="light" onClick={clearFilters}>
            {t('datatable.clearAll')}
          </Button>
          <Button onClick={closeFilterModal}>
            {t('datatable.applyFilters')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  // Settings modal
  const settingsModal = (
    <Modal opened={settingsModalOpened} onClose={handleCloseSettingsModal} title={t('datatable.tableSettings')} size="md">
      <Stack>
        <Text size="sm" c="dimmed">
          {t('datatable.configureTable')}
        </Text>

        <Divider />

        <Text fw={500}>{t('datatable.columnVisibility')}</Text>
        <Text size="sm" c="dimmed" mb="md">
          {t('datatable.columnVisibilityHelp')}
        </Text>

        {config.columns.map((column) => (
          <Checkbox
            key={String(column.key)}
            label={column.label}
            checked={columnDraft.has(String(column.key))}
            onChange={(e) => handleColumnToggle(String(column.key), e.target.checked)}
            disabled={columnDraft.size === 1 && columnDraft.has(String(column.key))}
            style={{ cursor: 'pointer' }}
          />
        ))}

        {settingsError && (
          <Alert color="red">
            {settingsError}
          </Alert>
        )}

        <Divider />

        <Group justify="space-between">
          <Button
            variant="light"
            onClick={handleResetSettings}
            loading={isSavingSettings}
            disabled={columnDraft.size === 0 || !hasCustomConfig}
            title={!hasCustomConfig ? t('datatable.noCustomConfig') : undefined}
          >
            {t('datatable.resetToDefaults')}
          </Button>
          <Button
            onClick={handleSaveSettings}
            loading={isSavingSettings}
            disabled={columnDraft.size === 0}
          >
            {t('datatable.saveSettings')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  // Delete confirmation modal
  const { deleteTitleKey, deleteMessageKey, confirmKey, cancelKey, purgeTitleKey, purgeMessageKey } = useConfirmMessages(dataType);
  const confirmModal = (
    <ConfirmModal
      opened={confirmModalOpened}
      title={t(deleteTitleKey)}
      message={t(deleteMessageKey)}
      confirmLabel={t(confirmKey)}
      cancelLabel={t(cancelKey)}
      confirmColor="red"
      onCancel={() => { setConfirmDeleteItem(null); closeConfirmModal(); }}
      onConfirm={() => {
        if (confirmDeleteItem && onDelete) {
          onDelete(confirmDeleteItem);
        }
        setConfirmDeleteItem(null);
        closeConfirmModal();
      }}
    />
  );

  const confirmPurgeModal = (
    <ConfirmModal
      opened={confirmPurgeOpened}
      title={t(purgeTitleKey || 'confirm.purge.default.title')}
      message={t(purgeMessageKey || 'confirm.purge.default.message')}
      confirmLabel={t('common.purge')}
      cancelLabel={t(cancelKey)}
      confirmColor="red"
      onCancel={() => { setConfirmPurgeItem(null); closePurgeModal(); }}
      onConfirm={() => {
        if (confirmPurgeItem && onPurge) {
          onPurge(confirmPurgeItem);
        }
        setConfirmPurgeItem(null);
        closePurgeModal();
      }}
    />
  );

  const confirmBulkDeleteModal = (
    <ConfirmModal
      opened={confirmBulkOpened}
      title={t('confirm.delete.bulk.title')}
      message={
        <Stack>
          <Text>{t('confirm.delete.bulk.message', { count: state.selectedRows.length })}</Text>
          <Divider />
          <Stack gap={4}>
            {state.selectedRows.slice(0, 10).map((item) => (
              <Text key={String((item as any).id)}>- {getItemLabel(item)}</Text>
            ))}
            {state.selectedRows.length > 10 && (
              <Text c="dimmed">{t('confirm.delete.bulk.more', { extra: state.selectedRows.length - 10 })}</Text>
            )}
          </Stack>
        </Stack>
      }
      confirmLabel={t('common.delete')}
      cancelLabel={t('common.cancel')}
      confirmColor="red"
      onCancel={() => {
        closeConfirmBulk();
      }}
      onConfirm={() => {
        if (onBulkDelete) {
          onBulkDelete(state.selectedRows);
        } else if (onDelete) {
          state.selectedRows.forEach((item) => onDelete(item));
        }
        setState(prev => ({ ...prev, selectedRows: [] }));
        closeConfirmBulk();
      }}
    />
  );

  const confirmBulkPurgeModal = (
    <ConfirmModal
      opened={confirmBulkPurgeOpened}
      title={t('confirm.purge.bulk.title')}
      message={
        <Stack>
          <Text>{t('confirm.purge.bulk.message', { count: state.selectedRows.length })}</Text>
          <Divider />
          <Stack gap={4}>
            {state.selectedRows.slice(0, 10).map((item) => (
              <Text key={String((item as any).id)}>- {getItemLabel(item)}</Text>
            ))}
            {state.selectedRows.length > 10 && (
              <Text c="dimmed">{t('confirm.purge.bulk.more', { extra: state.selectedRows.length - 10 })}</Text>
            )}
          </Stack>
        </Stack>
      }
      confirmLabel={t('common.purge')}
      cancelLabel={t('common.cancel')}
      confirmColor="red"
      onCancel={() => {
        closeConfirmBulkPurge();
      }}
      onConfirm={() => {
        if (onBulkPurge) {
          onBulkPurge(state.selectedRows);
        } else if (onPurge) {
          state.selectedRows.forEach((item) => onPurge(item));
        }
        setState(prev => ({ ...prev, selectedRows: [] }));
        closeConfirmBulkPurge();
      }}
    />
  );

  return (
    <Paper p="0" className={className} style={{ height, minHeight, maxHeight }}>



      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {tableHeader}
      {searchAndFilters}
      {isLoading && (
        <Box mb="md" style={{ position: 'relative', zIndex: 1 }}>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                {selectable && (
                  <Table.Th style={{ width: 40 }}>
                    <Skeleton height={24} width={24} radius="sm" />
                  </Table.Th>
                )}
                {visibleColumns.map((column, idx) => (
                  <Table.Th key={String(column.key)}>
                    <Skeleton height={20} width={80} radius="sm" />
                  </Table.Th>
                ))}
                {showActions && (
                  <Table.Th style={{ width: 50 }}>
                    <Skeleton height={20} width={40} radius="sm" />
                  </Table.Th>
                )}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[...Array(5)].map((_, rowIdx) => (
                <Table.Tr key={rowIdx}>
                  {selectable && (
                    <Table.Td>
                      <Skeleton height={20} width={20} radius="sm" />
                    </Table.Td>
                  )}
                  {visibleColumns.map((column, colIdx) => (
                    <Table.Td key={String(column.key)}>
                      <Skeleton height={16} width="80%" radius="sm" />
                    </Table.Td>
                  ))}
                  {showActions && (
                    <Table.Td>
                      <Skeleton height={20} width={30} radius="sm" />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}
      {!isLoading && !error && (
        <Box style={{ overflow: 'auto' }}>
          <div key={visibleColumns.length + '-' + visibleColumns.map(c => c.key).join(',')}>
            {tableContent}
          </div>
        </Box>
      )}
      {pagination}


      {filterModal}
      {settingsModal}
      {confirmModal}
      {confirmPurgeModal}
      {confirmBulkDeleteModal}
      {confirmBulkPurgeModal}
    </Paper>
  );
} 