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
  roles?: Role[];
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
  parent?: Group;
  children?: Group[];
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
  group_id?: number; // Foreign key to Group
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
  roles?: number[];
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
  role_ids?: number[];
  group_ids?: number[];
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
  role?: string;
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