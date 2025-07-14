# DataTable Component

A flexible, performant, and feature-rich data table component built with Mantine for the GLPI clone application. This component supports multiple data types, advanced search, sorting, filtering, pagination, and is easily extensible.

## Features

- **Multi-data type support**: Users, Roles, Groups, Assets, Asset Types, Manufacturers, Locations
- **Advanced search**: Global search across configured searchable fields
- **Sorting**: Sortable columns with visual indicators
- **Filtering**: Column-specific filters with modal interface
- **Pagination**: Server-side pagination with configurable page sizes
- **Row selection**: Single and multi-row selection
- **Actions**: View, Edit, Delete, Create, Export actions
- **Responsive**: Mobile-friendly design
- **Customizable**: Extensive configuration options
- **Type-safe**: Full TypeScript support
- **Performance**: Optimized rendering with React.memo and useMemo
- **Multilingual support**: Full internationalization support for English and French

## Quick Start

### Basic Usage

```tsx
import { DataTable, useDataTable } from '../components/DataTable';

function UsersPage() {
  const {
    data,
    paginatedData,
    isLoading,
    error,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilters,
    refresh,
  } = useDataTable<User>({
    dataType: 'users',
  });

  return (
    <DataTable<User>
      dataType="users"
      data={data}
      paginatedData={paginatedData}
      isLoading={isLoading}
      error={error?.message}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortChange={setSort}
      onSearchChange={setSearch}
      onFilterChange={setFilters}
      onRefresh={refresh}
      title="Users Management"
    />
  );
}
```

### With Actions

```tsx
function UsersPage() {
  const dataTable = useDataTable<User>({ dataType: 'users' });

  const handleView = (user: User) => {
    // Open user details modal
  };

  const handleEdit = (user: User) => {
    // Navigate to edit page
  };

  const handleDelete = (user: User) => {
    // Show delete confirmation
  };

  const handleCreate = () => {
    // Navigate to create page
  };

  return (
    <DataTable<User>
      dataType="users"
      data={dataTable.data}
      paginatedData={dataTable.paginatedData}
      isLoading={dataTable.isLoading}
      error={dataTable.error?.message}
      onPageChange={dataTable.setPage}
      onPageSizeChange={dataTable.setPageSize}
      onSortChange={dataTable.setSort}
      onSearchChange={dataTable.setSearch}
      onFilterChange={dataTable.setFilters}
      onRefresh={dataTable.refresh}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      selectable={true}
      selectedItems={dataTable.selectedItems}
      onSelectionChange={dataTable.setSelectedItems}
      title="Users Management"
    />
  );
}
```

## Multilingual Support

The DataTable component fully supports internationalization with English and French translations. All UI text, column labels, and messages are automatically translated based on the current locale.

### Translation Keys

The component uses the following translation key patterns:
- `datatable.*` - DataTable-specific translations
- `common.*` - Common UI elements (shared across the app)

### Reactive Translation System

The DataTable component automatically updates when the language changes without requiring a page refresh. The configuration system uses factory functions that receive the current translation function, ensuring all labels and messages are always up-to-date with the selected language.

### Supported Languages

- **English (en)**: Default language
- **French (fr)**: Full translation support

### Adding New Languages

To add support for additional languages:

1. Add the new locale to `i18n.ts`:
```tsx
export const locales = ['en', 'fr', 'es'] as const;
```

2. Create translation files in `messages/`:
```json
// messages/es.json
{
  "datatable": {
    "searchPlaceholder": "Buscar...",
    "filters": "Filtros",
    // ... other translations
  }
}
```

3. Import and add to the messages object in `i18n.ts`:
```tsx
import esMessages from './messages/es.json';

const messages = {
  en: enMessages,
  fr: frMessages,
  es: esMessages,
};
```

## Configuration

The DataTable uses a configuration system to define how different data types should be displayed. Each data type has its own configuration that specifies:

- **Columns**: Which fields to display and how to render them (with automatic translation)
- **Searchable fields**: Which fields to include in global search
- **Sortable fields**: Which fields can be sorted
- **Default settings**: Default sort, page size, etc.

### Supported Data Types

- `users` - User management
- `roles` - Role management  
- `groups` - Group management
- `assets` - Asset management
- `asset_types` - Asset type management
- `manufacturers` - Manufacturer management
- `locations` - Location management

### Custom Configuration

You can override the default configuration for any data type. Note that custom configurations should use translation keys for labels to maintain multilingual support:

```tsx
import { t } from '../../i18n';

const customConfig = {
  columns: [
    {
      key: 'id',
      label: t('datatable.id'),
      sortable: true,
      width: 80,
    },
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <Text fw={500} c="blue">
          {value}
        </Text>
      ),
    },
  ],
  searchableFields: ['name', 'description'],
  sortableFields: ['id', 'name'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 25,
  pageSizeOptions: [5, 10, 25, 50, 100],
};

<DataTable<User>
  dataType="users"
  config={customConfig}
  // ... other props
/>
```

## API Reference

### DataTable Props

| Prop | Type | Description |
|------|------|-------------|
| `dataType` | `DataType` | The type of data to display |
| `data` | `T[]` | Array of data items |
| `paginatedData` | `PaginatedResponse<T>` | Paginated response from API |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `config` | `Partial<DataTableConfig<T>>` | Custom configuration |
| `onPageChange` | `(page: number) => void` | Page change callback |
| `onPageSizeChange` | `(pageSize: number) => void` | Page size change callback |
| `onSortChange` | `(field: keyof T, order: 'asc' \| 'desc') => void` | Sort change callback |
| `onSearchChange` | `(query: string) => void` | Search change callback |
| `onFilterChange` | `(filters: Record<string, any>) => void` | Filter change callback |
| `onRefresh` | `() => void` | Refresh callback |
| `onView` | `(item: T) => void` | View item callback |
| `onEdit` | `(item: T) => void` | Edit item callback |
| `onDelete` | `(item: T) => void` | Delete item callback |
| `onCreate` | `() => void` | Create item callback |
| `onExport` | `() => void` | Export callback |
| `selectable` | `boolean` | Enable row selection |
| `selectedItems` | `T[]` | Selected items |
| `onSelectionChange` | `(items: T[]) => void` | Selection change callback |
| `title` | `string` | Table title |
| `showSearch` | `boolean` | Show search input |
| `showFilters` | `boolean` | Show filter button |
| `showActions` | `boolean` | Show action buttons |
| `showPagination` | `boolean` | Show pagination |
| `showPageSizeSelector` | `boolean` | Show page size selector |
| `showRefreshButton` | `boolean` | Show refresh button |
| `showCreateButton` | `boolean` | Show create button |
| `showExportButton` | `boolean` | Show export button |

### useDataTable Hook

The `useDataTable` hook provides a complete data management solution:

```tsx
const dataTable = useDataTable<User>({
  dataType: 'users',
  initialPage: 1,
  initialPageSize: 20,
  initialSortBy: 'name',
  initialSortOrder: 'asc',
  initialSearch: '',
  initialFilters: {},
});
```

#### Hook Return Value

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T[]` | Current page data |
| `paginatedData` | `PaginatedResponse<T>` | Full paginated response |
| `isLoading` | `boolean` | Loading state |
| `error` | `any` | Error object |
| `currentPage` | `number` | Current page number |
| `pageSize` | `number` | Items per page |
| `totalItems` | `number` | Total number of items |
| `totalPages` | `number` | Total number of pages |
| `sortBy` | `string` | Current sort field |
| `sortOrder` | `'asc' \| 'desc'` | Current sort order |
| `searchQuery` | `string` | Current search query |
| `filters` | `Record<string, any>` | Current filters |
| `selectedItems` | `T[]` | Selected items |
| `setPage` | `(page: number) => void` | Set current page |
| `setPageSize` | `(pageSize: number) => void` | Set page size |
| `setSort` | `(field: string, order: 'asc' \| 'desc') => void` | Set sort |
| `setSearch` | `(query: string) => void` | Set search query |
| `setFilters` | `(filters: Record<string, any>) => void` | Set filters |
| `clearFilters` | `() => void` | Clear all filters |
| `refresh` | `() => void` | Refresh data |
| `setSelectedItems` | `(items: T[]) => void` | Set selected items |
| `hasData` | `boolean` | Whether data exists |
| `isEmpty` | `boolean` | Whether data is empty |

## Adding New Data Types

To add support for a new data type:

1. **Add the model type** in `types/models.ts`
2. **Create configuration** in `components/DataTable/config.ts`:

```tsx
export const newDataTypeConfig: DataTableConfig<NewDataType> = {
  type: 'new_data_type',
  icon: IconNewType,
  columns: [
    // Define columns
  ],
  searchableFields: ['field1', 'field2'],
  sortableFields: ['id', 'field1'],
  defaultSort: { field: 'id', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

// Add to registry
export const dataTableConfigs = {
  // ... existing configs
  new_data_type: newDataTypeConfig,
};
```

3. **Add fetcher** in `src/fetchers.ts`:

```tsx
export const useNewDataType = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<NewDataType>(`${API_BASE}/new-data-type`, params);
};
```

4. **Update useDataTable hook** to include the new fetcher in the `fetcherMap`.

## Styling

The DataTable uses Mantine's theming system. You can customize the appearance by:

- Overriding Mantine theme variables
- Using the `className` prop for custom CSS
- Using the `height`, `minHeight`, `maxHeight` props for sizing

## Performance Considerations

- The component uses `React.memo` and `useMemo` for optimal rendering
- Large datasets are handled efficiently with pagination
- Search and filtering are debounced to prevent excessive API calls
- Virtual scrolling can be added for very large datasets if needed

## Backend Requirements

The backend API should support:

- Pagination: `page`, `per_page` parameters
- Sorting: `sort_by`, `sort_order` parameters  
- Search: `search` parameter for global search
- Filtering: `filter_<field_name>` parameters for specific field filtering
- Response format: `PaginatedResponse<T>` structure

Example API endpoint: `GET /api/v1/users?page=1&per_page=20&sort_by=name&sort_order=asc&search=john` 