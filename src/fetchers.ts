import useSWR from 'swr';
import { useSession, getSession, signOut } from 'next-auth/react';
import { PaginatedResponse, PaginationParams, User, Role, Group, Asset, AssetType, Manufacturer, Location } from '../types/models';

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

  const error = new Error('An error occurred while fetching the data');
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
    (url) => jsonFetcher(url, token)
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

// Assets fetcher
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
  return usePaginatedData<Manufacturer>(`${API_BASE}/manufacturers`, params);
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
  return usePaginatedData<Location>(`${API_BASE}/locations`, params);
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