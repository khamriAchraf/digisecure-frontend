# Frontend TypeScript Types

This directory contains TypeScript type definitions for the frontend application, generated from the backend Python models.

## Files

### `models.ts`
Contains all the core data model types that mirror the backend Python models:

- **User**: User account information with roles, groups, and authentication
- **Role & Permission**: Role-based access control system
- **Group**: Organizational grouping system
- **Asset**: Asset management system
- **AssetType**: Asset categorization
- **Manufacturer**: Asset manufacturer information
- **Location**: Physical location data
- **RefreshToken**: Authentication token management

### `utils.ts`
Contains utility types for common frontend patterns:

- **Form handling**: FormField, FormState, ValidationRule, ValidationSchema
- **Loading states**: LoadingState, AsyncState
- **Pagination**: PaginationParams, SearchParams
- **UI components**: TableColumn, TableState, ModalState, Notification
- **Navigation**: Route, Breadcrumb, MenuItem
- **Data structures**: SelectOption, TreeNode, ChartData

### `index.ts`
Main export file that re-exports all types for easy importing.

### `i18n.d.ts`
Internationalization type declarations.

## Usage

### Basic Import
```typescript
import { User, Asset, UserStatus } from '@/types';
```

### Using Enums
```typescript
import { UserStatus, UserRole } from '@/types';

const user: User = {
  id: 1,
  email: 'user@example.com',
  username: 'user',
  hashed_password: 'hashed',
  status: UserStatus.ACTIVE,
  // ... other fields
};
```

### Form Handling
```typescript
import { FormState, ValidationSchema } from '@/types';

interface LoginForm {
  email: string;
  password: string;
}

const formState: FormState<LoginForm> = {
  email: { value: '', error: undefined, touched: false, required: true },
  password: { value: '', error: undefined, touched: false, required: true }
};

const validationSchema: ValidationSchema<LoginForm> = {
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, minLength: 8 }
};
```

### API Responses
```typescript
import { ApiResponse, PaginatedResponse } from '@/types';

// Single item response
const userResponse: ApiResponse<User> = {
  data: user,
  message: 'User retrieved successfully',
  success: true
};

// Paginated response
const assetsResponse: PaginatedResponse<Asset> = {
  data: assets,
  total: 100,
  page: 1,
  per_page: 20,
  total_pages: 5
};
```

### Table Configuration
```typescript
import { TableColumn, Asset } from '@/types';

const assetColumns: TableColumn<Asset>[] = [
  {
    key: 'name',
    label: 'Asset Name',
    sortable: true,
    filterable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value} />
  }
];
```

## Type Relationships

The types maintain the same relationships as the backend models:

- **User** → **Role** (foreign key `role_id`)
- **User** ↔ **Group** (many-to-many via user_groups)
- **Role** ↔ **Permission** (many-to-many via role_permissions)
- **Asset** → **AssetType** (foreign key)
- **Asset** → **Manufacturer** (foreign key)
- **Asset** → **Location** (foreign key)
- **Asset** → **Group** (foreign key)
- **Asset** → **User** (assigned_to foreign key)
- **Group** → **Group** (self-referencing for hierarchy)

## Date Handling

All date fields are represented as ISO date strings in TypeScript:
- `created_at: string` (ISO datetime)
- `updated_at: string` (ISO datetime)
- `valid_until: string` (ISO date)
- `purchase_date: string` (ISO date)

## Notes

- All optional fields in the backend are marked with `?` in TypeScript
- Foreign key relationships are represented as `number` IDs
- Related objects are included as optional properties for convenience
- Enums maintain the same values as the backend Python enums
- The types are designed to work with typical REST API patterns 