import useSWR from 'swr';
import { useSession, getSession, signOut } from 'next-auth/react';
import { PaginatedResponse, User, Role, Group, Asset, AssetType, Manufacturer, Location, Computer, NetworkDevice, Software, VirtualMachine } from '../types/models';
import { PaginationParams, PersistedTableConfig } from '../types/utils';

// Base URL for the backend API – change this to match your backend configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

// Generic fetcher that handles JSON responses, transparently refreshes the
// access token on 401 and signs the user out if refresh also fails.
const jsonFetcher = async (url: string, token?: string, retry = true) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
  });

  if (res.ok) {
    return res.json();
  }

  // If we got 401/403, try to refresh the session *once*
  if (retry && (res.status === 401 || res.status === 403)) {
    try {
      // Will trigger NextAuth's JWT callback and refresh logic
      const newSession = await getSession();

      // If we obtained a new access token different from the previous one, retry once
      if (newSession?.accessToken && newSession.accessToken !== token) {
        return jsonFetcher(url, newSession.accessToken, false);
      }
    } catch (err) {
      // Ignore and fall through to signOut below
    }

    // Either refresh failed or we still have no valid token -> sign out
    signOut({ callbackUrl: '/login' });
  }

  const error = new Error('An error occurred while fetching the data') as any;
  error.info = await res.json().catch(() => ({}));
  error.status = res.status;
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
function usePaginatedData<T>(
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
  return usePaginatedData<User>(`${API_BASE}/users`, params);
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
  return usePaginatedData<Role>(`${API_BASE}/roles`, params);
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
  return usePaginatedData<Group>(`${API_BASE}/groups`, params);
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
  return usePaginatedData<Computer>(`${API_BASE}/assets/computers`, params);
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

// Assets fetcher
export const useNetworkDevices = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<NetworkDevice>(`${API_BASE}/assets/network_devices`, params);
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
  return usePaginatedData<Software>(`${API_BASE}/assets/software`,params);
};

// Single Software fetcher
export const useSoftware = (sid?: number | string)=>{
  const {data:session}=useSession();
  const token=session?.accessToken;
  const key=sid?`${API_BASE}/assets/software/${sid}`:null;
  const {data,error,isLoading,mutate}=useSWR<Software>(key,(url)=>jsonFetcher(url,token),{shouldRetryOnError:false});
  return {data,isLoading,isError:error,mutate} as const;
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
  return usePaginatedData<VirtualMachine>(`${API_BASE}/assets/virtual_machines`, params);
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
  return usePaginatedData<Asset>(`${API_BASE}/assets`, params);
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

// Manufacturers fetcher
export const useManufacturers = (params?: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}) => {
  return usePaginatedData<Manufacturer>(`${API_BASE}/reference_data/manufacturers`, params);
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
  return usePaginatedData<Location>(`${API_BASE}/reference_data/locations`, params);
};

// Legacy useUsers hook for backward compatibility
export const useUsersLegacy = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/users`,
    (url) => jsonFetcher(url, token)
  );

  return {
    users: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Export helpers (fetcher & base URL) in case they are useful elsewhere
export { jsonFetcher, API_BASE };

// Table configuration fetchers

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
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, error, isLoading, mutate } = useSWR<PersistedTableConfig | null>(
    `${API_BASE}/table-configs/${tableKey}`,
    (url: string) => jsonFetcher(url, token),
    { 
      shouldRetryOnError: false, // 404 → null, not an error
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Table config mutation functions
export const upsertTableConfig = async (tableKey: string, columns: string[], token?: string) => {
  return apiClient.put(`${API_BASE}/table-configs/${tableKey}`, { columns }, token);
};

export const deleteTableConfig = async (tableKey: string, token?: string) => {
  return apiClient.delete(`${API_BASE}/table-configs/${tableKey}`, token);
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