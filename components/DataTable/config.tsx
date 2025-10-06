import React from 'react';
import { TableColumn } from '../../types/utils';
import { User, Role, Group, Asset, AssetType, Manufacturer, Location, Computer, VirtualMachine, NetworkDevice, Software, CertificateKey, OperatingSystem } from '../../types/models';
import { IconUser, IconShield, IconUsers, IconDeviceDesktop, IconRouter, IconCategory, IconBuilding, IconMapPin, IconDeviceLaptop, IconApps, IconNetwork, IconKey } from '@tabler/icons-react';
import { Text } from '@mantine/core';

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

// Helper function to create translated column configurations
const createTranslatedColumns = <T,>(columns: (keyof T)[], t: (key: string) => string) => {
  return columns.map(key => ({
    key,
    label: t(`datatable.${String(key)}`),
    sortable: true,
    filterable: true,
  }));
};

// User configuration factory
export const createUserConfig = (t: (key: string) => string): DataTableConfig<User> => ({
  type: 'users',
  icon: IconUser,
  columns: [
    {
      key: 'id',
      label: t('datatable.id'),
      sortable: true,
      width: 80,
    },
    {
      key: 'username',
      label: t('common.username'),
      sortable: false,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
    {
      key: 'role',
      label: t('datatable.role.name'),
      sortable: true,
      filterable: true,
      render: (value: any) => value?.name || t('datatable.na'),
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value === 'active' ? 'green' : value === 'inactive' ? 'orange' : 'red',
          fontWeight: 'bold'
        }}>
          {value?.charAt(0).toUpperCase() + value?.slice(1) || t('datatable.na')}
        </span>
      ),
    },
  ],
  searchableFields: ['full_name', 'email', 'username', 'phone', 'location'],
  sortableFields: ['id', 'full_name', 'email', 'phone', 'location', 'status'],
  defaultSort: { field: 'id', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000],
});

// Role configuration factory
export const createRoleConfig = (t: (key: string) => string): DataTableConfig<Role> => ({
  type: 'roles',
  icon: IconShield,
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
    },
    {
      key: 'is_builtin',
      label: t('datatable.builtIn'),
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value ? 'blue' : 'gray',
          fontWeight: 'bold'
        }}>
          {value ? t('common.yes') : t('common.no')}
        </span>
      ),
    },
    {
      key: 'description',
      label: t('datatable.description'),
      sortable: false,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
  ],
  searchableFields: ['name', 'description'],
  sortableFields: ['id', 'name', 'is_builtin'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
});

// Group configuration factory
export const createGroupConfig = (t: (key: string) => string): DataTableConfig<Group> => ({
  type: 'groups',
  icon: IconUsers,
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
    },
    {
      key: 'description',
      label: t('datatable.description'),
      sortable: false,
      filterable: true,
    },
    {
      key: 'user_count',
      label: t('datatable.usersCount'),
      sortable: true,
      filterable: true,
    },
    {
      key: 'asset_count',
      label: t('datatable.assetsCount'),
      sortable: true,
      filterable: true,
    },
  ],
  searchableFields: ['name', 'description', 'type'],
  sortableFields: ['id', 'name', 'type', 'user_count', 'asset_count'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
});

// Asset configuration factory
export const createAssetConfig = (t: (key: string) => string): DataTableConfig<Asset> => ({
  type: 'assets',
  icon: IconDeviceDesktop,
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
    },
    {
      key: 'serial_number',
      label: t('datatable.serialNumber'),
      sortable: true,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
    {
      key: 'inventory_number',
      label: t('datatable.inventoryNumber'),
      sortable: true,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value === 'active' ? 'green' : value === 'maintenance' ? 'orange' : 'red',
          fontWeight: 'bold'
        }}>
          {value?.charAt(0).toUpperCase() + value?.slice(1) || t('datatable.na')}
        </span>
      ),
    },
    {
      key: 'asset_type_rel',
      label: t('datatable.type'),
      sortable: false,
      filterable: true,
      render: (value: any) => value?.name || t('datatable.na'),
    },
    {
      key: 'manufacturer',
      label: t('datatable.manufacturer'),
      sortable: false,
      filterable: true,
      render: (value: any) => value?.name || t('datatable.na'),
    },
  ],
  searchableFields: ['name', 'serial_number', 'inventory_number', 'status'],
  sortableFields: ['id', 'name', 'serial_number', 'inventory_number', 'status'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
});

// Asset Type configuration factory
export const createAssetTypeConfig = (t: (key: string) => string): DataTableConfig<AssetType> => ({
  type: 'asset_types',
  icon: IconCategory,
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
    },
    {
      key: 'is_builtin',
      label: t('datatable.builtIn'),
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <span style={{ 
          color: value ? 'blue' : 'gray',
          fontWeight: 'bold'
        }}>
          {value ? t('common.yes') : t('common.no')}
        </span>
      ),
    },
    {
      key: 'description',
      label: t('datatable.description'),
      sortable: false,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
  ],
  searchableFields: ['name', 'description'],
  sortableFields: ['id', 'name', 'is_builtin'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
});

// Manufacturer configuration factory
export const createManufacturerConfig = (t: (key: string) => string): DataTableConfig<Manufacturer> => ({
  type: 'manufacturers',
  icon: IconBuilding,
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
    },
    {
      key: 'comment',
      label: t('datatable.comment'),
      sortable: false,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
  ],
  searchableFields: ['name', 'comment'],
  sortableFields: ['id', 'name'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
});

// Location configuration factory
export const createLocationConfig = (t: (key: string) => string): DataTableConfig<Location> => ({
  type: 'locations',
  icon: IconMapPin,
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
    },
    {
      key: 'address',
      label: t('datatable.address'),
      sortable: false,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
    {
      key: 'town',
      label: t('datatable.town'),
      sortable: true,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
    {
      key: 'country',
      label: t('datatable.country'),
      sortable: true,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
    {
      key: 'postal_code',
      label: t('datatable.postalCode'),
      sortable: true,
      filterable: true,
      render: (value: any) => value || t('datatable.na'),
    },
  ],
  searchableFields: ['name', 'address', 'town', 'country', 'postal_code'],
  sortableFields: ['id', 'name', 'town', 'country', 'postal_code'],
  defaultSort: { field: 'name', order: 'asc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
});

// Computer configuration factory
export const createComputerConfig = (t: (key: string) => string): DataTableConfig<Computer> => ({
  type: 'computers',
  icon: IconDeviceDesktop,
  columns: [
    { key: 'id', label: t('datatable.id'), sortable: true, width: 80 },
    { key: 'name', label: t('common.name'), sortable: true, filterable: true },
    { key: 'serial_number', label: t('datatable.serial_number'), sortable: true, filterable: true },
    { key: 'updated_at', label: t('datatable.updatedAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
    { key: 'created_at', label: t('datatable.createdAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
    
  ],
  searchableFields: ['name', 'serial_number'],
  sortableFields: ['id', 'name', 'serial_number', 'updated_at', 'created_at'],
  defaultSort: { field: 'updated_at', order: 'desc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000],
});

// Software configuration factory
export const createSoftwareConfig = (t:(k:string)=>string): DataTableConfig<Software>=>({
  type:'software',
  icon: IconApps,
  columns: [
    { key: 'id', label: t('datatable.id'), sortable: true, width: 80 },
    { key: 'name', label: t('common.name'), sortable: true, filterable: true },
    { key: 'serial_number', label: t('datatable.serial_number'), sortable: true, filterable: true },
    { key: 'updated_at', label: t('datatable.updatedAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
    { key: 'created_at', label: t('datatable.createdAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
  ],
  searchableFields: ['name', 'serial_number'],
  sortableFields: ['id', 'name', 'serial_number', 'updated_at', 'created_at'],
  defaultSort: { field: 'updated_at', order: 'desc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000],
});

// Network Device configuration factory
export const createNetworkDeviceConfig = (t: (key: string) => string): DataTableConfig<NetworkDevice> => ({
    type: 'network_devices',
    icon: IconRouter,
    columns: [
      { key: 'id', label: t('datatable.id'), sortable: true, width: 80 },
      { key: 'name', label: t('common.name'), sortable: true, filterable: true },
      { key: 'serial_number', label: t('datatable.serial_number'), sortable: true, filterable: true },
      { key: 'updated_at', label: t('datatable.updatedAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
      { key: 'created_at', label: t('datatable.createdAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
    ],
    searchableFields: ['name', 'serial_number'],
    sortableFields: ['id', 'name', 'serial_number', 'updated_at', 'created_at'],
    defaultSort: { field: 'updated_at', order: 'desc' },
    defaultPageSize: 20,
    pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000],
});

// Virtual Machine configuration factory
export const createVirtualMachineConfig = (t: (key: string) => string): DataTableConfig<VirtualMachine> => ({
    type: 'virtual_machines',
    icon: IconDeviceLaptop,
    columns: [
      { key: 'id', label: t('datatable.id'), sortable: true, width: 80 },
      { key: 'name', label: t('common.name'), sortable: true, filterable: true },
      { key: 'serial_number', label: t('datatable.serial_number'), sortable: true, filterable: true },
      { key: 'updated_at', label: t('datatable.updatedAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
      { key: 'created_at', label: t('datatable.createdAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
    ],
    searchableFields: ['name', 'serial_number'],
    sortableFields: ['id', 'name', 'serial_number', 'updated_at', 'created_at'],
    defaultSort: { field: 'updated_at', order: 'desc' },
    defaultPageSize: 20,
    pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000],
  });

// Certificate key configuration factory

export const createCertificateKeyConfig = (t: (key: string) => string): DataTableConfig<CertificateKey> => ({
  type: 'certificate_keys',
  icon: IconKey,
  columns: [
    { key: 'id', label: t('datatable.id'), sortable: true, width: 80 },
    { key: 'name', label: t('common.name'), sortable: true, filterable: true },
    { key: 'serial_number', label: t('datatable.serial_number'), sortable: true, filterable: true },
    { key: 'updated_at', label: t('datatable.updatedAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
    { key: 'created_at', label: t('datatable.createdAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
  ],
  searchableFields: ['name', 'serial_number'],
  sortableFields: ['id', 'name', 'serial_number', 'updated_at', 'created_at'],
  defaultSort: { field: 'updated_at', order: 'desc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000],
});

// Operating System configuration factory

export const createOperatingSystemConfig = (t: (key: string) => string): DataTableConfig<OperatingSystem> => ({
  type: 'operating_systems',
  icon: IconBuilding,
  columns: [
    { key: 'id', label: t('datatable.id'), sortable: true, width: 80 },
    { key: 'name', label: t('common.name'), sortable: true, filterable: true },
    { key: 'version', label: t('datatable.version'), sortable: true, filterable: true },
    { key: 'created_at', label: t('datatable.createdAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
    { key: 'updated_at', label: t('datatable.updatedAt'), sortable: true, filterable: true, render: (value: any) => (<Text>{value ? new Date(value).toLocaleString() : t('datatable.na')}</Text>) },
  ],
  searchableFields: ['name', 'version'],
  sortableFields: ['id', 'name', 'version', 'created_at', 'updated_at'],
  defaultSort: { field: 'updated_at', order: 'desc' },
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100, 150, 200, 250, 300, 500, 1000],
});

// Configuration registry factory
export const createDataTableConfigs = (t: (key: string) => string) => ({
  users: createUserConfig(t),
  roles: createRoleConfig(t),
  groups: createGroupConfig(t),
  assets: createAssetConfig(t),
  computers: createComputerConfig(t),
  network_devices: createNetworkDeviceConfig(t),
  software: createSoftwareConfig(t),
  virtual_machines: createVirtualMachineConfig(t),
  asset_types: createAssetTypeConfig(t),
  manufacturers: createManufacturerConfig(t),
  locations: createLocationConfig(t),
  certificate_keys: createCertificateKeyConfig(t),
  operating_systems: createOperatingSystemConfig(t),
});

export type DataType = 'users' | 'roles' | 'groups' | 'computers' | 'network_devices' | 'software' | 'asset_types' | 'manufacturers' | 'locations' | 'virtual_machines' | 'certificate_keys' | 'operating_systems';

// Helper function to get configuration for a data type
export function getDataTableConfig<T>(type: DataType, t: (key: string) => string): DataTableConfig<T> {
  const configs = createDataTableConfigs(t);
  return configs[type] as unknown as DataTableConfig<T>;
}

// Helper function to check if a data type is supported
export function isSupportedDataType(type: string): type is DataType {
  const supportedTypes: DataType[] = ['users', 'roles', 'groups', 'computers', 'network_devices', 'software', 'asset_types', 'manufacturers', 'locations', 'virtual_machines', 'certificate_keys', 'operating_systems'];
  return supportedTypes.includes(type as DataType);
} 