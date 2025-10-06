import useSWR from 'swr';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useSession, getSession, signOut } from 'next-auth/react';
import { PaginatedResponse, User, Role, Group, Asset, AssetType, Manufacturer, Location, Computer, NetworkDevice, Software, VirtualMachine, ComplianceScope, ComplianceScopeAsset, Document, DocumentFolder, DocumentFolderNode, FolderContents, DocumentVersion, ComplianceScopeControl, CertificateKey, SoftwareVersion, ScopesComplianceSummary, OperatingSystem, ComplianceScopeEvent } from '../types/models';
import { PaginationParams, PersistedTableConfig } from '../types/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const extractErrorMessage = (info: any, fallback: string): string => {
  if (!info) return fallback;
  if (typeof info === 'string') return info;
  if (info.message) return String(info.message);
  if (info.detail) return String(info.detail);
  if (info.error) return String(info.error);
  if (Array.isArray(info.errors)) {
    const errs = info.errors as Array<{ message?: string; detail?: string } | string>;
    return errs
      .map((item: { message?: string; detail?: string } | string) =>
        typeof item === 'string' ? item : (item.message ?? item.detail ?? JSON.stringify(item))
      )
      .join('\n');
  }
  try {
    return JSON.stringify(info);
  } catch {
    return fallback;
  }
};

const jsonFetcher = async (url: string, token?: string, retry = true) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
  });

  if (res.ok) {
    return res.json();
  }

  // If we got 401, try to refresh the session once
  if (retry && res.status === 401) {
    try {
      const newSession = await getSession();

      if (newSession?.accessToken && newSession.accessToken !== token) {
        return jsonFetcher(url, newSession.accessToken, false);
      }
    } catch (err) {
    }

    signOut({ callbackUrl: '/login' });
  }

  const error = new Error('An error occurred while fetching the data') as any;
  error.info = await res.json().catch(() => ({}));
  error.status = res.status;
  if (res.status !== 401) {
    const message = extractErrorMessage(error.info, 'An error occurred while fetching the data');
    notifications.show({ title: `Request failed (${res.status})`, message, color: 'red' });
  }
  throw error;
};

// Helper function to build query parameters
const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

// Generic paginated fetcher hook
export function usePaginatedData<T>(
  endpoint: string,
  params: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
  } = {}
) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const queryParams = buildQueryParams(params);
  const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<T>>(
    url,
    (url: string) => jsonFetcher(url, token)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Users fetcher
export const useUsers = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<User>(`${API_BASE}/users/`, params);
};



// Roles fetcher
export const useRoles = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Role>(`${API_BASE}/roles/`, params);
};

// Groups fetcher
export const useGroups = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Group>(`${API_BASE}/groups/`, params);
};

// Single User fetcher
// ------------------------------------------------------------
// Retrieves details of a single user along with their nested
// relationships such as role and groups.
export const useUser = (id?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  // Do not execute until we actually have an ID
  const key = id ? `${API_BASE}/users/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<User>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      shouldRetryOnError: false, // 404 should surface as error
    },
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// ------------------------------------------------------------
// Single Group fetcher
export const useGroup = (id?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = id ? `${API_BASE}/groups/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<Group>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      shouldRetryOnError: false,
    },
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// Assets fetcher
export const useComputers = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Computer>(`${API_BASE}/assets/computers/`, params);
};

// Single Computer fetcher
export const useComputer = (computerId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = computerId ? `${API_BASE}/assets/computers/${computerId}` : null;

  const { data, error, isLoading, mutate } = useSWR<Computer>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      shouldRetryOnError: false,
    },
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// Single CertificateKey fetcher

export const useCertificateKey = (certificateKeyId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = certificateKeyId ? `${API_BASE}/assets/certificate_keys/${certificateKeyId}` : null;
  const { data, error, isLoading, mutate } = useSWR<CertificateKey>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// Assets fetcher
export const useNetworkDevices = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<NetworkDevice>(`${API_BASE}/assets/network_devices/`, params);
};

// Single NetworkDevice fetcher
export const useNetworkDevice = (ndId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = ndId ? `${API_BASE}/assets/network_devices/${ndId}` : null;
  const { data, error, isLoading, mutate } = useSWR<NetworkDevice>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// Assets fetcher
export const useSoftwares = (params?: { page?:number; per_page?:number; sort_by?:string; sort_order?:'asc'|'desc'; search?:string; filters?:Record<string,any>;})=>{
  return usePaginatedData<Software>(`${API_BASE}/assets/software/`,params);
};

// Single Software fetcher
export const useSoftware = (sid?: number | string)=>{
  const {data:session}=useSession();
  const token=session?.accessToken;
  const key=sid?`${API_BASE}/assets/software/${sid}`:null;
  const {data,error,isLoading,mutate}=useSWR<Software>(key,(url)=>jsonFetcher(url,token),{shouldRetryOnError:false});
  return {data,isLoading,isError:error,mutate} as const;
};

// Software → Versions fetcher

export const useSoftwareVersions = (softwareId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = softwareId ? `${API_BASE}/assets/software/${softwareId}/versions/` : null;
  const { data, error, isLoading, mutate } = useSWR<SoftwareVersion[]>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// Software Version → Installed On (relationships)
// GET /assets/software/versions/{version_id}/computers
export const useSoftwareVersionComputers = (versionId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = versionId ? `${API_BASE}/assets/software/versions/${versionId}/computers/` : null;
  const { data, error, isLoading, mutate } = useSWR<Computer[]>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// GET /assets/software/versions/{version_id}/virtual-machines
export const useSoftwareVersionVirtualMachines = (versionId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = versionId ? `${API_BASE}/assets/software/versions/${versionId}/virtual-machines/` : null;
  const { data, error, isLoading, mutate } = useSWR<VirtualMachine[]>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// GET /assets/software/versions/{version_id}/network-devices
export const useSoftwareVersionNetworkDevices = (versionId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = versionId ? `${API_BASE}/assets/software/versions/${versionId}/network-devices/` : null;
  const { data, error, isLoading, mutate } = useSWR<NetworkDevice[]>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// Software → Documents fetcher
export const useSoftwareDocuments = (softwareId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = softwareId ? `${API_BASE}/assets/software/${softwareId}/documents/` : null;

  const { data, error, isLoading, mutate } = useSWR<Document[]>(
    key,
    (url: string) => jsonFetcher(url, token),
    { shouldRetryOnError: false }
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// Assets fetcher
export const useVirtualMachines = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<VirtualMachine>(`${API_BASE}/assets/virtual_machines/`, params);
};

// Single VirtualMachine fetcher
export const useVirtualMachine = (vmId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = vmId ? `${API_BASE}/assets/virtual_machines/${vmId}` : null;

  const { data, error, isLoading, mutate } = useSWR<VirtualMachine>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      shouldRetryOnError: false,
    },
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// Generic Assets fetcher (all asset types)
export const useAssets = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Asset>(`${API_BASE}/assets/`, params);
};

// Single Asset fetcher
export const useAsset = (assetId?: number | string, assetType?: string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const formattedAssetType = (assetType?: string) => {
    if (assetType === 'computer') return 'computers';
    if (assetType === 'network_device') return 'network_devices';
    if (assetType === 'virtual_machine') return 'virtual_machines';
    if (assetType === 'software') return 'software';
    if (assetType === 'certificate_key') return 'certificate_keys';
    return assetType;
  };

  const key = assetId ? `${API_BASE}/assets/${formattedAssetType(assetType ?? '')}/${assetId}` : null;

  const { data, error, isLoading, mutate } = useSWR<Asset>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      shouldRetryOnError: false,
    },
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// Asset Types fetcher
export const useAssetTypes = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<AssetType>(`${API_BASE}/asset-types`, params);
};

export const useAssetsLocationFilter = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  location_id?: number;
}) => {
  return usePaginatedData<Asset>(`${API_BASE}/assets/?location_id=${params?.location_id}`, params);
};

export const useAssetsManufacturerFilter = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  manufacturer_id?: number;
}) => {
  return usePaginatedData<Asset>(`${API_BASE}/assets/?manufacturer_id=${params?.manufacturer_id}`, params);
};

// Manufacturers fetcher
export const useManufacturers = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Manufacturer>(`${API_BASE}/reference_data/manufacturers/`, params);
};

export const useManufacturer = (manufacturerId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = manufacturerId ? `${API_BASE}/reference_data/manufacturers/${manufacturerId}` : null;
  const { data, error, isLoading, mutate } = useSWR<Manufacturer>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// Locations fetcher
export const useLocations = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Location>(`${API_BASE}/reference_data/locations/`, params);
};

export const useLocation = (locationId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = locationId ? `${API_BASE}/reference_data/locations/${locationId}` : null;
  const { data, error, isLoading, mutate } = useSWR<Location>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

export const useOperatingSystems = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<OperatingSystem>(`${API_BASE}/reference_data/operating_systems/`, params);
};

export const useOperatingSystem = (operatingSystemId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const key = operatingSystemId ? `${API_BASE}/reference_data/operating_systems/${operatingSystemId}` : null;
  const { data, error, isLoading, mutate } = useSWR<OperatingSystem>(key, (url: string) => jsonFetcher(url, token), { shouldRetryOnError:false});
  return { data, isLoading, isError: error, mutate } as const;
};

// Legacy useUsers hook for backward compatibility
export const useUsersLegacy = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/users/`,
    (url) => jsonFetcher(url, token)
  );

  return {
    users: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export { jsonFetcher, API_BASE };

// Table configuration fetchers

// -----------------------------------------------
// LocalStorage-backed table configuration helpers
// -----------------------------------------------
const TABLE_CONFIG_STORAGE_PREFIX = 'table-configs:';

const getTableConfigStorageKey = (tableKey: string) => `${TABLE_CONFIG_STORAGE_PREFIX}${tableKey}`;

const readTableConfigFromStorage = (tableKey: string): PersistedTableConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getTableConfigStorageKey(tableKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.columns)) {
      return { columns: parsed.columns } as PersistedTableConfig;
    }
  } catch {}
  return null;
};

const writeTableConfigToStorage = (tableKey: string, columns: string[]) => {
  if (typeof window === 'undefined') return;
  const payload: PersistedTableConfig = { columns, table_key: tableKey };
  window.localStorage.setItem(getTableConfigStorageKey(tableKey), JSON.stringify(payload));
};

const deleteTableConfigFromStorage = (tableKey: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getTableConfigStorageKey(tableKey));
};

const notifyTableConfigChanged = (tableKey: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('table-config-changed', { detail: { tableKey } }));
  } catch {}
};

// Generic API client for table configs
const apiClient = {
  async get(url: string, token?: string) {
    return jsonFetcher(url, token);
  },
  
  async put(url: string, data: any, token?: string) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = new Error('An error occurred while updating the data') as any;
      error.info = await res.json().catch(() => ({}));
      error.status = res.status;
      const message = extractErrorMessage(error.info, 'An error occurred while updating the data');
      notifications.show({ title: `Update failed (${res.status})`, message, color: 'red' });
      throw error;
    }

    return res.json();
  },

  async delete(url: string, token?: string) {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'include',
    });

    if (!res.ok) {
      const error = new Error('An error occurred while deleting the data') as any;
      error.info = await res.json().catch(() => ({}));
      error.status = res.status;
      const message = extractErrorMessage(error.info, 'An error occurred while deleting the data');
      notifications.show({ title: `Delete failed (${res.status})`, message, color: 'red' });
      throw error;
    }

    // DELETE requests typically return 204 No Content, so don't try to parse JSON
    if (res.status === 204) {
      return null;
    }

    // For other success status codes, try to parse JSON if there's content
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }

    return null;
  },
};

// Table config fetcher hook
export const useTableConfig = (tableKey: string) => {
  // Use SWR but backed by localStorage read instead of API
  const swrKey = tableKey ? `table-configs/${tableKey}` : null;
  const { data, error, isLoading, mutate } = useSWR<PersistedTableConfig | null>(
    swrKey,
    () => Promise.resolve(readTableConfigFromStorage(tableKey)),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  // Keep SWR cache in sync when storage changes (cross-tab) or we dispatch local updates
  useEffect(() => {
    if (!tableKey) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key === getTableConfigStorageKey(tableKey)) {
        mutate();
      }
    };
    const onLocalChange = (e: Event) => {
      const ev = e as CustomEvent<{ tableKey: string }>;
      if (!ev.detail || ev.detail.tableKey === tableKey) {
        mutate();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('table-config-changed', onLocalChange as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('table-config-changed', onLocalChange as EventListener);
    };
  }, [tableKey, mutate]);

  return { data, isLoading, isError: error, mutate };
};

// Table config mutation functions
export const upsertTableConfig = async (tableKey: string, columns: string[], _token?: string) => {
  writeTableConfigToStorage(tableKey, columns);
  notifyTableConfigChanged(tableKey);
  return { columns } as PersistedTableConfig;
};

export const deleteTableConfig = async (tableKey: string, _token?: string) => {
  deleteTableConfigFromStorage(tableKey);
  notifyTableConfigChanged(tableKey);
  return null;
}; 

// Schema fetcher hook – fetches and caches JSON schema for resource creation forms
export interface ResourceSchemaResponse {
  version: string;
  resource_type: string;
  schema: any; // JSON-Schema describing data shape
  ui: any;     // UI metadata to help build forms
}

/**
 * Fetch JSON schema describing how to create a resource of the given type.
 * Result is cached aggressively because schemas change very rarely.
 *
 * @param resourceType – e.g. "group", "user" …
 */
export const useResourceSchema = (resourceType?: string) => {
  // Do not make the request until we actually have a resource type
  const key = resourceType ? `${API_BASE}/schemas/${resourceType}` : null;

  const { data: session } = useSession();
  const token = session?.accessToken;

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<ResourceSchemaResponse>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      // Schemas barely ever change – cache for 7 days and don’t revalidate on focus/reconnect
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60 * 24 * 7, // 7 days
      keepPreviousData: true,
    },
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
}; 

/**
 * Fetch JSON schema describing how to edit a resource of the given type.
 * Result is cached aggressively because schemas change very rarely.
 *
 * @param resourceType – e.g. "group", "user" …
 */
export const useResourceEditSchema = (resourceType?: string) => {
  // Do not make the request until we actually have a resource type
  const key = resourceType ? `${API_BASE}/schemas/${resourceType}/edit` : null;

  const { data: session } = useSession();
  const token = session?.accessToken;

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<ResourceSchemaResponse>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      // Schemas barely ever change – cache for 7 days and don’t revalidate on focus/reconnect
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60 * 24 * 7, // 7 days
      keepPreviousData: true,
    },
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// ------------------------------------------------------------
// Compliance scopes fetcher
export const useComplianceScopes = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, error, isLoading, mutate } = useSWR<ComplianceScope[]>(
    `${API_BASE}/compliance/scopes`,
    (url: string) => jsonFetcher(url, token)
  );

  return {
    data,
    totalItems: data?.length,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// ------------------------------------------------------------

type ComplianceScopeAssetsParams = {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  cursor?: string;
  type?: string;
};




// Fetch all compliance scopes with optional query (alias for consistency)
export const useAllComplianceScopes = () => useComplianceScopes();

// ------------------------------------------------------------
// Compliance scope assets fetcher
// GET /compliance/scopes/{scope_id}/assets
export const useScopeAssets = (
  scopeId?: number | string,
  params: ComplianceScopeAssetsParams = {}
) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const base = scopeId ? `${API_BASE}/compliance/scopes/${scopeId}/assets` : null;
  const queryParams = buildQueryParams(params);
  const url = base && (queryParams ? `${base}?${queryParams}` : base);

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<ComplianceScopeAsset>>(
    url,
    (u: string) => jsonFetcher(u, token)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// ------------------------------------------------------------
// Compliance scope controls fetcher
// GET /compliance/scopes/{scope_id}/controls
export const useScopeControls = (scopeId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const base = scopeId ? `${API_BASE}/compliance/scopes/${scopeId}/controls` : null;

  const { data, error, isLoading, mutate } = useSWR<ComplianceScopeControl[]>(
    base,
    (u: string) => jsonFetcher(u, token)
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// GET /compliance/scopes/{scope_id}/controls
export const useScopeControl = (scopeId?: number | string, controlId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const base = controlId ? `${API_BASE}/compliance/scopes/${scopeId}/controls/${controlId}` : null;

  const { data, error, isLoading, mutate } = useSWR<ComplianceScopeControl>(
    base,
    (u: string) => jsonFetcher(u, token)
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// GET /compliance/scopes/{scope_id}/event
export const useScopeEvents = (scopeId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const base = scopeId ? `${API_BASE}/compliance/scopes/${scopeId}/events` : null;

  const { data, error, isLoading, mutate } = useSWR<ComplianceScopeEvent[]>(
    base,
    (u: string) => jsonFetcher(u, token)
  );

  return { data, isLoading, isError: error, mutate } as const;
};




export const useDetetedUsers = (
  params: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
  } = {}
) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const base = `${API_BASE}/recycle_bin/users`;
  const queryParams = buildQueryParams(params);
  const url = base && (queryParams ? `${base}?${queryParams}` : base);

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<User>>(
    url,
    (u: string) => jsonFetcher(u, token)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

export const useDeletedGroups = (
  params: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
  } = {}
) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const base = `${API_BASE}/recycle_bin/groups`;
  const queryParams = buildQueryParams(params);
  const url = base && (queryParams ? `${base}?${queryParams}` : base);

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Group>>(
    url,
    (u: string) => jsonFetcher(u, token)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  } as const;
};

// Alias with correct spelling for convenience/consistency
export const useDeletedUsers = useDetetedUsers;

// ------------------------------------------------------------
// Documents fetchers
export const useDocuments = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Document>(`${API_BASE}/documents`, params);
};

export const useDocument = (id?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = id ? `${API_BASE}/documents/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<Document>(
    key,
    (url: string) => jsonFetcher(url, token),
    {
      shouldRetryOnError: false,
    },
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// Update folder name or move folder
export const renameFolder = async (id: number, payload: { name?: string; parent_id?: number | null }, token?: string) => {
  const res = await fetch(`${API_BASE}/documents/folders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = new Error('Failed to update folder') as any;
    try { error.info = await res.json(); } catch {}
    error.status = res.status;
    const message = extractErrorMessage(error.info, 'Failed to update folder');
    notifications.show({ title: `Update folder failed (${res.status})`, message, color: 'red' });
    throw error;
  }
  return res.json();
};

// Documents: folders tree
export const useDocumentFolderTree = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, error, isLoading, mutate } = useSWR<DocumentFolderNode>(
    `${API_BASE}/documents/folders/tree`,
    (url: string) => jsonFetcher(url, token),
    { revalidateOnFocus: false }
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// Documents: list folders by parent
export const useDocumentFolders = (parentId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const base = `${API_BASE}/documents/folders`;
  const url = parentId !== undefined && parentId !== null && parentId !== ''
    ? `${base}?${buildQueryParams({ parent_id: parentId })}`
    : base;

  const { data, error, isLoading, mutate } = useSWR<DocumentFolder[]>(
    url,
    (u: string) => jsonFetcher(u, token)
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// Documents: folder contents
export const useFolderContents = (folderId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = folderId ? `${API_BASE}/documents/folders/${folderId}` : null;

  const { data, error, isLoading, mutate } = useSWR<FolderContents>(
    key,
    (url: string) => jsonFetcher(url, token),
    { shouldRetryOnError: false }
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// Documents: versions list for a document
export const useDocumentVersions = (documentId?: number | string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = documentId ? `${API_BASE}/documents/${documentId}/versions` : null;

  const { data, error, isLoading, mutate } = useSWR<DocumentVersion[]>(
    key,
    (url: string) => jsonFetcher(url, token),
    { shouldRetryOnError: false }
  );

  return { data, isLoading, isError: error, mutate } as const;
};

// Documents: helper to download a version with auth token
export const downloadDocumentVersion = async (versionId: number, fileName?: string) => {
  const session = await getSession();
  const token = (session as any)?.accessToken as string | undefined;
  const url = `${API_BASE}/documents/versions/${versionId}/download`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
  });
  if (!res.ok) {
    const error = new Error('Failed to download file') as any;
    try { error.info = await res.json(); } catch {}
    error.status = res.status;
    const message = extractErrorMessage(error.info, 'Failed to download file');
    notifications.show({ title: `Download failed (${res.status})`, message, color: 'red' });
    throw error;
  }
  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName || `document_${versionId}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
};

// Documents: list files that belong to root (folder_id = null)
export const useRootFolderDocuments = (enabled: boolean) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const key = enabled ? `${API_BASE}/documents/folders/none` : null;

  const { data, error, isLoading, mutate } = useSWR<Document[]>(
    key,
    (url: string) => jsonFetcher(url, token),
    { shouldRetryOnError: false }
  );

  return { data, isLoading, isError: error, mutate } as const;
};

export const useComplianceDashboard = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, error, isLoading, mutate } = useSWR<ScopesComplianceSummary>(
    `${API_BASE}/analytics/scopes/compliance`,
    (url: string) => jsonFetcher(url, token)
  );

  return { data, isLoading, isError: error, mutate } as const;
};