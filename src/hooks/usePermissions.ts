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
  NETWORK_DEVICE_CREATE: "network_device:create",
  NETWORK_DEVICE_UPDATE: "network_device:update",
  NETWORK_DEVICE_DELETE: "network_device:delete",
  NETWORK_DEVICE_PURGE: "network_device:purge",
  
  // Virtual machine permissions
  VIRTUAL_MACHINE_READ: "virtual_machine:read",
  VIRTUAL_MACHINE_CREATE: "virtual_machine:create",
  VIRTUAL_MACHINE_UPDATE: "virtual_machine:update",
  VIRTUAL_MACHINE_DELETE: "virtual_machine:delete",
  VIRTUAL_MACHINE_PURGE: "virtual_machine:purge",
  
  // Software permissions
  SOFTWARE_READ: "software:read",
  SOFTWARE_CREATE: "software:create",
  SOFTWARE_UPDATE: "software:update",
  SOFTWARE_DELETE: "software:delete",
  SOFTWARE_PURGE: "software:purge",
  
  // Computer permissions
  COMPUTER_READ: "computer:read",
  COMPUTER_CREATE: "computer:create",
  COMPUTER_UPDATE: "computer:update",
  COMPUTER_DELETE: "computer:delete",
  COMPUTER_PURGE: "computer:purge",
  
  // User permissions
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_PURGE: "user:purge",
  
  // Role permissions
  ROLE_READ: "role:read",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  ROLE_PURGE: "role:purge",
  
  // Group permissions
  GROUP_READ: "group:read",
  GROUP_CREATE: "group:create",
  GROUP_UPDATE: "group:update",
  GROUP_DELETE: "group:delete",
  GROUP_PURGE: "group:purge",
  
  // Reference data permissions
  REFERENCE_DATA_READ: "reference_data:read",
  REFERENCE_DATA_CREATE: "reference_data:create",
  REFERENCE_DATA_UPDATE: "reference_data:update",
  REFERENCE_DATA_DELETE: "reference_data:delete",
  REFERENCE_DATA_PURGE: "reference_data:purge",
  
  // Asset permissions
  ASSET_READ: "asset:read",
  ASSET_CREATE: "asset:create",
  ASSET_UPDATE: "asset:update",
  ASSET_DELETE: "asset:delete",
  ASSET_PURGE: "asset:purge",
  
  // Analytics permissions (for future use)
  ANALYTICS_READ: "analytics:read",
  ANALYTICS_CREATE: "analytics:create",
  ANALYTICS_UPDATE: "analytics:update",
  ANALYTICS_DELETE: "analytics:delete",
  ANALYTICS_PURGE: "analytics:purge",
  
  // Contract permissions (for future use)
  CONTRACT_READ: "contract:read",
  CONTRACT_CREATE: "contract:create",
  CONTRACT_UPDATE: "contract:update",
  CONTRACT_DELETE: "contract:delete",
  CONTRACT_PURGE: "contract:purge",
  
  // Settings permissions (for future use)
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
  
  // Security permissions (for future use)
  SECURITY_READ: "security:read",
  SECURITY_UPDATE: "security:update",
  SECURITY_2FA_MANAGE: "security:2fa:manage",
} as const;

// Role constants
export const ROLES = {
  ADMIN: 1,
  // Add other roles as needed
} as const; 