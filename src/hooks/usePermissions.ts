import { useSession } from "next-auth/react";

/**
 * Hook to check if the current user has a specific permission
 * @param permission - The permission to check (e.g., "user:read", "role:create")
 * @returns boolean indicating if user has the permission
 */
export const useHasPermission = (permission: string): boolean => {
  const { data: session } = useSession();
  console.log("checking permission", permission);
  console.log(session?.user.permissions?.includes(permission) ?? false);
  return session?.user.permissions?.includes(permission) ?? false;
};

/**
 * Hook to check if the current user has any of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns boolean indicating if user has at least one of the permissions
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { data: session } = useSession();
  return session?.user.permissions?.some(permission => permissions.includes(permission)) ?? false;
};

/**
 * Hook to check if the current user has all of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns boolean indicating if user has all the permissions
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { data: session } = useSession();
  return session?.user.permissions?.every(permission => permissions.includes(permission)) ?? false;
};

/**
 * Hook to get all permissions for the current user
 * @returns array of user permissions or empty array if not authenticated
 */
export const useUserPermissions = (): string[] => {
  const { data: session } = useSession();
  return session?.user.permissions ?? [];
};

/**
 * Hook to check if the current user has a specific role ID
 * @param roleId - The role ID to check
 * @returns boolean indicating if user has the role
 */
export const useHasRole = (roleId: number): boolean => {
  const { data: session } = useSession();
  return session?.user.role_id === roleId;
};

/**
 * Hook to get the current user's role ID
 * @returns user's role ID or null if not authenticated
 */
export const useUserRole = (): number | null => {
  const { data: session } = useSession();
  return session?.user.role_id ?? null;
};

/**
 * Hook to check if the current user is an admin (role_id === 1)
 * @returns boolean indicating if user is admin
 */
export const useIsAdmin = (): boolean => {
  return useHasRole(1);
};

/**
 * Hook to check if the current user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { data: session } = useSession();
  return !!session;
};

/**
 * Hook to get the current user's session data
 * @returns session data or null if not authenticated
 */
export const useUserSession = () => {
  const { data: session } = useSession();
  return session;
};

// Utility functions for permission checking (can be used outside of components)
export const permissionUtils = {
  /**
   * Check if user has a specific permission
   * @param userPermissions - Array of user permissions
   * @param permission - The permission to check
   * @returns boolean indicating if user has the permission
   */
  hasPermission: (userPermissions: string[], permission: string): boolean => {
    return userPermissions.includes(permission);
  },

  /**
   * Check if user has any of the specified permissions
   * @param userPermissions - Array of user permissions
   * @param permissions - Array of permissions to check
   * @returns boolean indicating if user has at least one of the permissions
   */
  hasAnyPermission: (userPermissions: string[], permissions: string[]): boolean => {
    return userPermissions.some(permission => permissions.includes(permission));
  },

  /**
   * Check if user has all of the specified permissions
   * @param userPermissions - Array of user permissions
   * @param permissions - Array of permissions to check
   * @returns boolean indicating if user has all the permissions
   */
  hasAllPermissions: (userPermissions: string[], permissions: string[]): boolean => {
    return userPermissions.every(permission => permissions.includes(permission));
  },

  /**
   * Check if user has a specific role
   * @param userRoleId - User's role ID
   * @param roleId - The role ID to check
   * @returns boolean indicating if user has the role
   */
  hasRole: (userRoleId: number, roleId: number): boolean => {
    return userRoleId === roleId;
  },

  /**
   * Check if user is admin
   * @param userRoleId - User's role ID
   * @returns boolean indicating if user is admin
   */
  isAdmin: (userRoleId: number): boolean => {
    return userRoleId === 1;
  },
};

// Permission constants for better maintainability
export const PERMISSIONS = {
  // Network device permissions
  NETWORK_DEVICE_READ: "network_device:read",
  NETWORK_DEVICE_LIST: "network_device:list",
  NETWORK_DEVICE_CREATE: "network_device:create",
  NETWORK_DEVICE_UPDATE: "network_device:update",
  NETWORK_DEVICE_DELETE: "network_device:delete",
  NETWORK_DEVICE_PURGE: "network_device:purge",
  
  // Virtual machine permissions
  VIRTUAL_MACHINE_READ: "virtual_machine:read",
  VIRTUAL_MACHINE_LIST: "virtual_machine:list",
  VIRTUAL_MACHINE_CREATE: "virtual_machine:create",
  VIRTUAL_MACHINE_UPDATE: "virtual_machine:update",
  VIRTUAL_MACHINE_DELETE: "virtual_machine:delete",
  VIRTUAL_MACHINE_PURGE: "virtual_machine:purge",
  
  // Software permissions
  SOFTWARE_READ: "software:read",
  SOFTWARE_LIST: "software:list",
  SOFTWARE_CREATE: "software:create",
  SOFTWARE_UPDATE: "software:update",
  SOFTWARE_DELETE: "software:delete",
  SOFTWARE_PURGE: "software:purge",
  
  // Computer permissions
  COMPUTER_READ: "computer:read",
  COMPUTER_LIST: "computer:list",
  COMPUTER_CREATE: "computer:create",
  COMPUTER_UPDATE: "computer:update",
  COMPUTER_DELETE: "computer:delete",
  COMPUTER_PURGE: "computer:purge",

  // Certificate key permissions
  CERTIFICATE_KEY_READ: "certificate_key:read",
  CERTIFICATE_KEY_LIST: "certificate_key:list",
  CERTIFICATE_KEY_CREATE: "certificate_key:create",
  CERTIFICATE_KEY_UPDATE: "certificate_key:update",
  CERTIFICATE_KEY_DELETE: "certificate_key:delete",
  CERTIFICATE_KEY_PURGE: "certificate_key:purge",
  
  // User permissions
  USER_READ: "user:read",
  USER_LIST: "user:list",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_PURGE: "user:purge",
  
  // Role permissions
  ROLE_READ: "role:read",
  ROLE_LIST: "role:list",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  ROLE_PURGE: "role:purge",
  
  // Group permissions
  GROUP_READ: "group:read",
  GROUP_LIST: "group:list",
  GROUP_CREATE: "group:create",
  GROUP_UPDATE: "group:update",
  GROUP_DELETE: "group:delete",
  GROUP_PURGE: "group:purge",
  
  // Reference data permissions
  REFERENCE_DATA_READ: "reference_data:read",
  REFERENCE_DATA_LIST: "reference_data:list",
  REFERENCE_DATA_CREATE: "reference_data:create",
  REFERENCE_DATA_UPDATE: "reference_data:update",
  REFERENCE_DATA_DELETE: "reference_data:delete",
  REFERENCE_DATA_PURGE: "reference_data:purge",
  
  // Asset permissions
  // compliance manage is the ability to tag/untag assets with compliance scopes
  ASSET_COMPLIANCE_MANAGE: "asset:compliance_manage",
  // compliance check is the ability to check if an asset is compliant
  ASSET_COMPLIANCE_CHECK: "asset:compliance_check",
  
  // Compliance permissions
  COMPLIANCE_SCOPE_READ: "compliance_scope:read",
  COMPLIANCE_SCOPE_LIST: "compliance_scope:list",
  COMPLIANCE_SCOPE_CREATE: "compliance_scope:create",
  COMPLIANCE_SCOPE_UPDATE: "compliance_scope:update",
  COMPLIANCE_SCOPE_DELETE: "compliance_scope:delete",
  COMPLIANCE_SCOPE_PURGE: "compliance_scope:purge",

  // Documents permissions
  DOCUMENTS_READ: "document:read",
  DOCUMENTS_LIST: "document:list",
  DOCUMENTS_CREATE: "document:create",
  DOCUMENTS_UPDATE: "document:update",
  DOCUMENTS_DELETE: "document:delete",
  DOCUMENTS_PURGE: "document:purge",

  // Recycle bin (user) permissions
  RECYCLE_BIN_USER_READ: "recycle_bin_user:read",
  RECYCLE_BIN_USER_LIST: "recycle_bin_user:list",
  RECYCLE_BIN_USER_PURGE: "recycle_bin_user:purge",
  RECYCLE_BIN_USER_RESTORE: "recycle_bin_user:restore",

  // Analytics permissions
  ANALYTICS_READ: "analytics:read",
  ANALYTICS_LIST: "analytics:list",
  ANALYTICS_CREATE: "analytics:create",
  ANALYTICS_UPDATE: "analytics:update",
  ANALYTICS_DELETE: "analytics:delete",
  ANALYTICS_PURGE: "analytics:purge",


  
  
} as const;

// Role constants
export const ROLES = {
  ADMIN: 1,
  // Add other roles as needed
} as const; 