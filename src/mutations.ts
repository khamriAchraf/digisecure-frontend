import { useState } from 'react';
import { useSession, getSession, signOut } from 'next-auth/react';
import { API_BASE } from './fetchers';
import { Group, CreateGroupRequest, Role, CreateRoleRequest } from '../types/models';

// Generic mutation client that handles JSON requests, transparently refreshes the
// access token on 401 and signs the user out if refresh also fails.
const mutationClient = async (
  url: string, 
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: any, 
  token?: string, 
  retry = true
) => {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    ...(data && { body: JSON.stringify(data) }),
  });

  if (res.ok) {
    // Handle different response types
    if (res.status === 204) {
      return null; // No content
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return null;
  }

  // If we got 401/403, try to refresh the session *once*
  if (retry && (res.status === 401 || res.status === 403)) {
    try {
      // Will trigger NextAuth's JWT callback and refresh logic
      const newSession = await getSession();

      // If we obtained a new access token different from the previous one, retry once
      if (newSession?.accessToken && newSession.accessToken !== token) {
        return mutationClient(url, method, data, newSession.accessToken, false);
      }
    } catch (err) {
      // Ignore and fall through to signOut below
    }

    // Either refresh failed or we still have no valid token -> sign out
    signOut({ callbackUrl: '/login' });
  }

  const error = new Error('An error occurred while processing the request') as any;
  error.info = await res.json().catch(() => ({}));
  error.status = res.status;
  throw error;
};

// Generic mutation hook that provides loading, error, and success states
function useMutation<TData = any, TError = any>(
  mutationFn: (data: any) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = async (mutationData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(mutationData);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorObj = err as TError;
      setError(errorObj);
      options?.onError?.(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
    error,
    data,
    isError: !!error,
  };
}

// Groups mutations
export const useCreateGroup = (options?: {
  onSuccess?: (group: Group) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<Group>(
    async (groupData: CreateGroupRequest) => {
      return mutationClient(`${API_BASE}/groups/`, 'POST', groupData, session?.accessToken);
    },
    options
  );
};

export const useUpdateGroup = (options?: {
  onSuccess?: (group: Group) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<Group>(
    async ({ id, ...groupData }: { id: number } & Partial<CreateGroupRequest>) => {
      return mutationClient(`${API_BASE}/groups/${id}`, 'PUT', groupData, session?.accessToken);
    },
    options
  );
};

export const useDeleteGroup = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/groups/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    options
  );
};


export const useAddAssetToGroup = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async ({ groupId, assetId }: { groupId: number; assetId: number }) => {
      return mutationClient(
        `${API_BASE}/groups/${groupId}/assets/${assetId}`,
        'POST',
        undefined,
        session?.accessToken
      );
    },
    options
  );
};

export const useRemoveAssetFromGroup = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async ({ groupId, assetId }: { groupId: number; assetId: number }) => {
      return mutationClient(
        `${API_BASE}/groups/${groupId}/assets/${assetId}`,
        'DELETE',
        undefined,
        session?.accessToken
      );
    },
    options
  );
};


// Group-User relationship mutations
export const useAddUserToGroup = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async ({ groupId, userId }: { groupId: number; userId: number }) => {
      return mutationClient(
        `${API_BASE}/groups/${groupId}/users/${userId}`,
        'POST',
        undefined,
        session?.accessToken
      );
    },
    options
  );
};

export const useRemoveUserFromGroup = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async ({ groupId, userId }: { groupId: number; userId: number }) => {
      return mutationClient(
        `${API_BASE}/groups/${groupId}/users/${userId}`,
        'DELETE',
        undefined,
        session?.accessToken
      );
    },
    options
  );
};

// Roles mutations
export const useCreateRole = (options?: {
  onSuccess?: (role: Role) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<Role>(
    async (roleData: CreateRoleRequest) => {
      return mutationClient(`${API_BASE}/roles/`, 'POST', roleData, session?.accessToken);
    },
    options
  );
};

// Users mutations
export const useCreateUser = (options?: {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (userData: any) => {
      return mutationClient(`${API_BASE}/users/`, 'POST', userData, session?.accessToken);
    },
    options
  );
};

export const useUpdateUser = (options?: {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...userData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/users/${id}`, 'PUT', userData, session?.accessToken);
    },
    options
  );
};

export const useDeleteUser = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/users/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    options
  );
};

// Assets mutations
export const useCreateAsset = (options?: {
  onSuccess?: (asset: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (assetData: any) => {
      return mutationClient(`${API_BASE}/assets/`, 'POST', assetData, session?.accessToken);
    },
    options
  );
};

export const useUpdateAsset = (options?: {
  onSuccess?: (asset: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...assetData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/assets/${id}`, 'PUT', assetData, session?.accessToken);
    },
    options
  );
};

export const useDeleteAsset = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/assets/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    options
  );
};

// Computers mutations
export const useCreateComputer = (options?: {
  onSuccess?: (computer: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (computerData: any) => {
      return mutationClient(`${API_BASE}/assets/computers/`, 'POST', computerData, session?.accessToken);
    },
    options
  );
};

export const useUpdateComputer = (options?: {
  onSuccess?: (computer: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...computerData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/assets/computers/${id}`, 'PUT', computerData, session?.accessToken);
    },
    options
  );
};

export const useDeleteComputer = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/assets/computers/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    options
  );
};

// Virtual Machines mutations
export const useCreateVirtualMachine = (options?: {
  onSuccess?: (virtualMachine: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (virtualMachineData: any) => {
      return mutationClient(`${API_BASE}/assets/virtual_machines/`, 'POST', virtualMachineData, session?.accessToken);
    },
    options
  );
};

export const useUpdateVirtualMachine = (options?: {
  onSuccess?: (virtualMachine: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...virtualMachineData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/assets/virtual_machines/${id}`, 'PUT', virtualMachineData, session?.accessToken);
    },
    options
  );
};

export const useDeleteVirtualMachine = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/assets/virtual_machines/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    options
  );
};


// Generic quick create mutation for any resource type
export const useQuickCreate = (resourceType: string, options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (data: any) => {
      return mutationClient(`${API_BASE}/${resourceType}s/`, 'POST', data, session?.accessToken);
    },
    options
  );
};



// Export the mutation client for direct use if needed
export { mutationClient }; 