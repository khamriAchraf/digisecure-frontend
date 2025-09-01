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
  rank?: number;
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
  user_count?: number;
  asset_count?: number;
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

export interface NetworkDevice extends Asset {
  device_type?: string;
  model?: string;
  ip_address?: string;
  mac_address?: string;
  port_count?: number;
  connection_type?: string;
  management_ip?: string;
  firmware_version?: string;

  // Physical security
  rack_location?: string;
  physical_lock?: string;
  tamper_evident?: string;

  // Network security
  vlan?: string;
  segmentation?: string;
  firewall_enabled?: boolean;
  ids_ips_enabled?: boolean;
  remote_access_enabled?: boolean;
  remote_access_method?: string;
  remote_access_restriction?: string;

  // Authentication and access control
  admin_username?: string;
  admin_password_set?: boolean;
  password_last_changed?: string;
  multi_factor_auth_enabled?: boolean;
  default_accounts_disabled?: boolean;

  // Logging and monitoring
  logging_enabled?: boolean;
  log_retention_days?: number;
  syslog_server?: string;
  snmp_enabled?: boolean;
  snmp_version?: string;
  monitoring_tool?: string;

  // Patch and vulnerability management
  last_patch_date?: string;
  patch_level?: string;
  vulnerability_scan_date?: string;
  vulnerability_status?: string;

  // Encryption
  management_encryption?: boolean;
  encryption_type?: string;
  data_in_transit_encryption?: boolean;

  // Device lifecycle
  power_state?: string;
  creation_date?: string;
  last_modified?: string;
  scheduled_decommission_date?: string;

  // Redundancy and high availability
  ha_enabled?: boolean;
  redundancy_level?: string;
  failover_capability?: boolean;
  groups?: Group[];
}

export interface Software extends Asset {
  name: string;
  vendor?: string;
  description?: string;
  software_type?: string;

  encryption_enabled?: boolean;
  encryption_type?: string;
  encryption_key_management?: string;
  secure_communication?: boolean;
  communication_protocol?: string;

  authentication_required?: boolean;
  multi_factor_auth_supported?: boolean;
  role_based_access_control?: boolean;
  session_timeout_enabled?: boolean;
  session_timeout_minutes?: number;

  audit_logging_enabled?: boolean;
  log_retention_days?: number;
  log_integrity_protection?: boolean;
  centralized_logging?: boolean;

  last_vulnerability_scan?: string;
  vulnerability_status?: string;
  known_vulnerabilities?: string;
  patch_management_enabled?: boolean;
  last_patch_date?: string;
  patch_level?: string;
  auto_update_enabled?: boolean;

  network_access_required?: boolean;
  firewall_rules_required?: string;
  vpn_required?: boolean;
  network_segmentation?: string;

  data_classification?: string;
  data_retention_policy?: string;
  data_backup_enabled?: boolean;
  data_encryption_at_rest?: boolean;

  pci_compliance_status?: string;
  pci_assessment_date?: string;
  next_assessment_date?: string;
  compliance_notes?: string;

  end_of_life_date?: string;
  end_of_support_date?: string;
  replacement_planned?: boolean;
  replacement_software_id?: number;

  minimum_requirements?: string;
  recommended_requirements?: string;
  resource_usage_monitoring?: boolean;
  groups?: Group[];
}

export interface SoftwareVersion extends BaseModel {
  id: number;
  version: string;
  build_number: string;
  release_date: string;
  end_of_support_date: string;
  end_of_life_date: string;
  created_at: string;
  updated_at: string;
}


export interface CertificateKey extends Asset {
  cert_type: string; // e.g., 'certificate', 'private_key', etc.
  algorithm?: string | null;
  storage_location?: string | null;

  expiration_date?: string | null; // ISO datetime string
  last_rotation_date?: string | null; // ISO datetime string
  next_rotation_due?: string | null; // ISO datetime string

  cert_status: string;

  issuer?: string | null;
  subject?: string | null;
  groups?: Group[];
}

// Document management types
export interface DocumentVersion extends BaseModel {
  version_number: number;
  file_path: string;
  file_name: string;
  file_size: number;
  checksum?: string | null;
  uploaded_by: number;
  document_id: number;
  uploaded_at: string; // ISO datetime string
}

export interface Document extends BaseModel {
  name: string;
  description?: string;
  folder_id?: number;
  id: number;
  review_status: string;
  review_notes: string;
  review_frequency_months: number;
  review_date: string;
  user_id: number;
  user: User;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  versions?: DocumentVersion[]; // Present on single fetch
}

// Document folders and tree
export interface DocumentFolder extends BaseModel {
  name: string;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentFolderNode {
  id: number;
  name: string;
  children: DocumentFolderNode[];
}

export interface FolderContents {
  folder: DocumentFolder;
  subfolders: DocumentFolder[];
  documents: Document[];
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
  // Compliance scopes attached to this asset
  compliance_scopes?: ComplianceScopeAsset[];
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

// Compliance types
export interface ComplianceScope extends BaseModel {
  name: string;
  description?: string;
  reference_url?: string;
  last_audit_date?: string | null;
  last_audit_result?: string | null;
  next_audit_due?: string | null;
  auditor?: string | null;
  notes?: string | null;
}

export interface ComplianceScopeAsset extends BaseModel {
  name: string;
  description?: string | null;
  reference_url?: string | null;
  last_audit_date?: string | null; // ISO date string or null
  last_audit_result?: string | null;
  next_audit_due?: string | null; // ISO date string or null
  auditor?: string | null;
  notes?: string | null;
  id: number;
  compliant?: boolean | null;
  justification?: string | null;
  last_review_date?: string | null; // ISO date string or null
  next_review_date?: string | null; // ISO date string or null
  compliance_notes?: string | null;
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

// Compliance scope controls types
export interface ComplianceScopeControl extends BaseModel {
  id: number;
  scope_id: number;
  code: string;
  title: string;
  description?: string;
  
  required_document_name?: string;
  required_document_description?: string;
  required_document_type?: string;
  
  last_audit_date?: string | null;
  last_audit_result?: string | null;

  document_count?: number;
  documents?: Document[];
}

export interface ScopeComplianceBreakdown extends BaseModel {
  scope_name: string;
  document_control_percentage: number;
  asset_compliance_percentage: number;
  total_compliance_percentage: number;
}

export interface ScopesComplianceSummary extends BaseModel {
  scopes: Record<number, ScopeComplianceBreakdown>;
  overall_progress_percentage: number;
}

// All types are already exported as interfaces above 