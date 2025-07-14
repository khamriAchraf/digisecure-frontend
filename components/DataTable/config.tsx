import React from 'react';
import { TableColumn } from '../../types/utils';
import { User, Role, Group, Asset, AssetType, Manufacturer, Location } from '../../types/models';
import { IconUser, IconShield, IconUsers, IconDeviceDesktop, IconCategory, IconBuilding, IconMapPin } from '@tabler/icons-react';

// Base configuration interface
export interface DataTableConfig<T> {
  type: string;
  icon: React.ComponentType<any>;
  columns: TableColumn<T>[];
  searchableFields: (keyof T)[];
  sortableFields: (keyof T)[];
  defaultSort?: {
    field: keyof T;
    order: 'asc' | 'desc';
  };
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

// User configuration
export const userConfig: DataTableConfig<User> = {
  type: 'users',
  icon: IconUser,
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'full_name',
      label: 'Full Name',
      sortable: true,
      filterable: true,
      render: (value: any, row: User) => value || row.username || 'N/A',
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value === 'active' ? 'green' : value === 'inactive' ? 'orange' : 'red',
          fontWeight: 'bold'
        }}>
          {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
        </span>
      ),
    },
  ],
  searchableFields: ['full_name', 'email', 'username', 'phone', 'location'],
  sortableFields: ['id', 'full_name', 'email', 'phone', 'location', 'status'],
  defaultSort: { field: 'id', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000, 99999],
};

// Role configuration
export const roleConfig: DataTableConfig<Role> = {
  type: 'roles',
  icon: IconShield,
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'is_builtin',
      label: 'Built-in',
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value ? 'blue' : 'gray',
          fontWeight: 'bold'
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
  ],
  searchableFields: ['name', 'description'],
  sortableFields: ['id', 'name', 'is_builtin'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

// Group configuration
export const groupConfig: DataTableConfig<Group> = {
  type: 'groups',
  icon: IconUsers,
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'contain_users',
      label: 'Contains Users',
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value ? 'green' : 'gray',
          fontWeight: 'bold'
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'contain_items',
      label: 'Contains Items',
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value ? 'green' : 'gray',
          fontWeight: 'bold'
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ],
  searchableFields: ['name', 'description', 'type'],
  sortableFields: ['id', 'name', 'type', 'contain_users', 'contain_items'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

// Asset configuration
export const assetConfig: DataTableConfig<Asset> = {
  type: 'assets',
  icon: IconDeviceDesktop,
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'serial_number',
      label: 'Serial Number',
      sortable: true,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'inventory_number',
      label: 'Inventory #',
      sortable: true,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value === 'active' ? 'green' : value === 'maintenance' ? 'orange' : 'red',
          fontWeight: 'bold'
        }}>
          {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
        </span>
      ),
    },
    {
      key: 'asset_type_rel',
      label: 'Type',
      sortable: false,
      filterable: true,
      render: (value: any) => value?.name || 'N/A',
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      sortable: false,
      filterable: true,
      render: (value: any) => value?.name || 'N/A',
    },
  ],
  searchableFields: ['name', 'serial_number', 'inventory_number', 'status'],
  sortableFields: ['id', 'name', 'serial_number', 'inventory_number', 'status'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

// Asset Type configuration
export const assetTypeConfig: DataTableConfig<AssetType> = {
  type: 'asset_types',
  icon: IconCategory,
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'is_builtin',
      label: 'Built-in',
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value ? 'blue' : 'gray',
          fontWeight: 'bold'
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
  ],
  searchableFields: ['name', 'description'],
  sortableFields: ['id', 'name', 'is_builtin'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

// Manufacturer configuration
export const manufacturerConfig: DataTableConfig<Manufacturer> = {
  type: 'manufacturers',
  icon: IconBuilding,
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'comment',
      label: 'Comment',
      sortable: false,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
  ],
  searchableFields: ['name', 'comment'],
  sortableFields: ['id', 'name'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

// Location configuration
export const locationConfig: DataTableConfig<Location> = {
  type: 'locations',
  icon: IconMapPin,
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'town',
      label: 'Town',
      sortable: true,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'country',
      label: 'Country',
      sortable: true,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
    {
      key: 'postal_code',
      label: 'Postal Code',
      sortable: true,
      filterable: true,
      render: (value: any) => value || 'N/A',
    },
  ],
  searchableFields: ['name', 'address', 'town', 'country', 'postal_code'],
  sortableFields: ['id', 'name', 'town', 'country', 'postal_code'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

// Configuration registry
export const dataTableConfigs = {
  users: userConfig,
  roles: roleConfig,
  groups: groupConfig,
  assets: assetConfig,
  asset_types: assetTypeConfig,
  manufacturers: manufacturerConfig,
  locations: locationConfig,
} as const;

export type DataType = keyof typeof dataTableConfigs;

// Helper function to get configuration for a data type
export function getDataTableConfig<T>(type: DataType): DataTableConfig<T> {
  return dataTableConfigs[type] as unknown as DataTableConfig<T>;
}

// Helper function to check if a data type is supported
export function isSupportedDataType(type: string): type is DataType {
  return type in dataTableConfigs;
} 