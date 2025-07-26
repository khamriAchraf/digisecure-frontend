// Base interface for all models
export interface BaseModel {
  id: number;
}

// User related types
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETED = "deleted"
}

export enum UserRole {
  SUPER_ADMIN = "Super-Admin",
  ADMIN = "Admin",
  SUPERVISOR = "Supervisor",
  TECHNICIAN = "Technician",
  HOTLINER = "Hotliner",
  OBSERVER = "Observer",
  SELF_SERVICE = "Self-Service"
}

export interface User extends BaseModel {
  administartive_number?: string;
  email: string;
  username: string;
  full_name?: string;
  hashed_password: string;
  phone?: string;
  secondary_phone?: string;
  timezone?: string;
  location?: string;
  language?: string;
  theme?: string;
  status: UserStatus;
  valid_until?: string; // ISO date string
  valid_from?: string; // ISO date string
  role_id?: number;
  role?: Role;
  groups?: Group[];
  refresh_tokens?: RefreshToken[];
}

// Role and Permission types
export interface Role extends BaseModel {
  name: string;
  description?: string;
  is_builtin: boolean;
  permissions?: Permission[];
  users?: User[];
}

export interface Permission extends BaseModel {
  action: string;
  resource: string;
  description?: string;
  roles?: Role[];
}

// Group types
export interface Group extends BaseModel {
  name: string;
  description?: string;
  type?: string; // e.g., 'skill', 'org', 'notification'
  contain_users: boolean;
  contain_items: boolean;
  comment?: string;
  parent_id?: number;
  users?: User[];
  assets?: Asset[];
  parent?: Group;
  children?: Group[];
}

export interface Computer extends Asset {
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  mac_address?: string;
  ip_address?: string;
  model?: string;
  hostname?: string;
  groups?: Group[];
}

export interface VirtualMachine extends Asset {
    // Virtualization platform details
    hypervisor_type?: string;  // VMware, Hyper-V, KVM, Xen, VirtualBox
    hypervisor_version?: string;
    vm_platform?: string;  // vSphere, ESXi, Hyper-V Server, etc.
    
    // VM specifications
    cpu_cores?: number;
    memory_mb?: number;
    storage_gb?: number;
    os_type?: string;  // Windows, Linux, macOS
    os_version?: string;
    os_architecture?: string;  // x86_64, ARM64, etc.
    
    // Network configuration
    ip_address?: string;
    mac_address?: string;
    network_segment?: string;  // DMZ, Internal, PCI, etc.
    vlan_id?: string;
    
    // Security and compliance fields
    pci_scope?: string;  // In Scope, Out of Scope
    cardholder_data_environment?: string;  // CDE, Connected-to, Out-of-Scope
    encryption_status?: string;  // Encrypted, Not Encrypted, Partial
    encryption_type?: string;  // AES-256, AES-128, etc.
    backup_encryption?: string;  // Yes, No, N/A
    
    // Access control and monitoring
    admin_access_restricted?: string;  // Yes, No
    multi_factor_auth_enabled?: string;  // Yes, No
    logging_enabled?: string;  // Yes, No
    monitoring_tool?: string;  // SIEM, IDS/IPS, etc.
    
    // Patch and vulnerability management
    last_patch_date?: string;  // ISO date string
    patch_level?: string;
    vulnerability_scan_date?: string;  // ISO date string
    vulnerability_status?: string;  // Compliant, Non-Compliant, Pending
    
    // Backup and disaster recovery
    backup_frequency?: string;  // Daily, Weekly, Monthly
    last_backup_date?: string;  // ISO date string
    backup_retention_days?: number;
    disaster_recovery_plan?: string;  // Yes, No, N/A
    
    // Virtualization security
    isolation_level?: string;  // High, Medium, Low
    resource_isolation?: string;  // Yes, No
    network_isolation?: string;  // Yes, No
    storage_isolation?: string;  // Yes, No
    
    // Compliance tracking
    pci_assessment_date?: string;  // ISO date string
    pci_compliance_status?: string;  // Compliant, Non-Compliant, In Progress
    next_assessment_date?: string;  // ISO date string
    compliance_notes?: string;
    
    // VM lifecycle
    power_state?: string;  // Running, Stopped, Suspended
    creation_date?: string;  // ISO date string
    last_modified?: string;  // ISO datetime string
    scheduled_decommission_date?: string;  // ISO date string
    
    // Resource allocation
    cpu_allocation_percent?: number;
    memory_allocation_percent?: number;
    storage_allocation_percent?: number;
    
    // High availability and redundancy
    ha_enabled?: string;  // Yes, No
    redundancy_level?: string;  // None, N+1, N+2
    failover_capability?: string;  // Yes, No
    
    // Relationships
    groups?: Group[];
}

// Asset related types
export interface Asset extends BaseModel {
  name: string;
  asset_type: number; // Foreign key to AssetType
  serial_number?: string;
  inventory_number?: string;
  manufacturer_id?: number; // Foreign key to Manufacturer
  status: string;
  purchase_date?: string; // ISO date string
  warranty_expiry?: string; // ISO date string
  location_id?: number; // Foreign key to Location
  assigned_to?: number; // Foreign key to User
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  // Relationships
  asset_type_rel?: AssetType;
  manufacturer?: Manufacturer;
  location?: Location;
  group?: Group;
  assigned_user?: User;
}

export interface AssetType extends BaseModel {
  name: string;
  description?: string;
  is_builtin: boolean;
}

export interface Manufacturer extends BaseModel {
  name: string;
  comment?: string;
}

export interface Location extends BaseModel {
  name: string;
  postal_code?: string;
  building_number?: string;
  latitude?: number;
  altitude?: number;
  comment?: string;
  address?: string;
  town?: string;
  country?: string;
  state?: string;
  room_number?: string;
  longitude?: number;
  floor_number?: string;
}

// Authentication types
export interface RefreshToken extends BaseModel {
  token_id: string; // JWT ID (jti claim)
  user_id: number; // Foreign key to User
  token_hash: string; // Hashed version of the token
  expires_at: string; // ISO datetime string
  is_revoked: boolean;
  created_at: string; // ISO datetime string
  used_at?: string; // ISO datetime string
  ip_address?: string;
  user_agent?: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Request types for API calls
export interface CreateUserRequest {
  email: string;
  username: string;
  full_name?: string;
  password: string;
  phone?: string;
  secondary_phone?: string;
  timezone?: string;
  location?: string;
  language?: string;
  theme?: string;
  status?: UserStatus;
  valid_until?: string;
  valid_from?: string;
  administartive_number?: string;
  role_id?: number;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  full_name?: string;
  phone?: string;
  secondary_phone?: string;
  timezone?: string;
  location?: string;
  language?: string;
  theme?: string;
  status?: UserStatus;
  valid_until?: string;
  valid_from?: string;
  role_id?: number;
  group_ids?: number[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  type?: string;
  contain_users?: boolean;
  contain_items?: boolean;
  comment?: string;
  parent_id?: number;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  type?: string;
  contain_users?: boolean;
  contain_items?: boolean;
  comment?: string;
  parent_id?: number;
}

export interface CreateAssetRequest {
  name: string;
  asset_type: number;
  serial_number?: string;
  inventory_number?: string;
  manufacturer_id?: number;
  status: string;
  purchase_date?: string;
  warranty_expiry?: string;
  location_id?: number;
  group_id?: number;
  assigned_to?: number;
}

export interface UpdateAssetRequest {
  name?: string;
  asset_type?: number;
  serial_number?: string;
  inventory_number?: string;
  manufacturer_id?: number;
  status?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  location_id?: number;
  group_id?: number;
  assigned_to?: number;
}

// Filter and query types
export interface UserFilters {
  status?: UserStatus;
  role_id?: number;
  group?: string;
  search?: string;
}

export interface AssetFilters {
  asset_type?: number;
  manufacturer?: number;
  location?: number;
  group?: number;
  assigned_to?: number;
  status?: string;
  search?: string;
}

// All types are already exported as interfaces above 