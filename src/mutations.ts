import { useState } from 'react';
import { useSession, getSession, signOut } from 'next-auth/react';
import { mutate as swrMutate } from 'swr';
import { notifications } from '@mantine/notifications';
import { API_BASE } from './fetchers';
import { Group, CreateGroupRequest, Role, CreateRoleRequest, Document } from '../types/models';
import { useTranslation } from './hooks/useTranslation';

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

  // If we got 401, try to refresh the session once
  if (retry && res.status === 401) {
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

// Multipart mutation client for file uploads
const multipartMutationClient = async (
  url: string,
  method: 'POST' | 'PUT' | 'PATCH',
  formData: FormData,
  token?: string,
  retry = true
) => {
  const res = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Intentionally omit Content-Type so browser sets correct boundary
    },
    credentials: 'include',
    body: formData,
  });

  if (res.ok) {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return null;
  }

  if (retry && res.status === 401) {
    try {
      const newSession = await getSession();
      if (newSession?.accessToken && newSession.accessToken !== token) {
        return multipartMutationClient(url, method, formData, newSession.accessToken, false);
      }
    } catch {}
    signOut({ callbackUrl: '/login' });
  }

  const error = new Error('An error occurred while uploading the file') as any;
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
    successNotification?: {
      title?: string;
      message: string; // translation key
      color?: string;
      messageValues?: Record<string, any>;
    };
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);
  const [data, setData] = useState<TData | null>(null);
  const { t } = useTranslation();

  const mutate = async (mutationData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(mutationData);
      setData(result);
      options?.onSuccess?.(result);
      // Show success notification if configured
      if (options?.successNotification) {
        notifications.show({
          title: options.successNotification.title ?? t('common.success'),
          message: t(options.successNotification.message, options.successNotification.messageValues),
          color: options.successNotification.color ?? 'teal',
        });
      }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.group.createSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.group.updateSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.group.deleteSuccess',
        color: 'red',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.group.assetAddedSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.group.assetRemovedSuccess',
        color: 'red',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.group.userAddedSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.group.userRemovedSuccess',
        color: 'red',
      },
    }
  );
};

// Compliance scope - asset relationship mutations
export const useAddAssetToComplianceScope = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async ({ scopeId, assetId }: { scopeId: number; assetId: number }) => {
      return mutationClient(
        `${API_BASE}/compliance/assets/${assetId}/scopes/${scopeId}`,
        'POST',
        undefined,
        session?.accessToken
      );
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.compliance.assetAddedToScopeSuccess',
        color: 'teal',
      },
    }
  );
};

export const useRemoveAssetFromComplianceScope = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async ({ scopeId, assetId }: { scopeId: number; assetId: number }) => {
      return mutationClient(
        `${API_BASE}/compliance/assets/${assetId}/scopes/${scopeId}`,
        'DELETE',
        undefined,
        session?.accessToken
      );
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.compliance.assetRemovedFromScopeSuccess',
        color: 'red',
      },
    }
  );
};

// Update compliance state for an asset within a scope
// PUT /compliance/assets/{asset_id}/scopes/{scope_id}
export const useUpdateAssetScopeCompliance = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  const formatAssetTypeForUrl = (assetType?: string) => {
    if (assetType === 'computer') return 'computers';
    if (assetType === 'network_device') return 'network_devices';
    if (assetType === 'virtual_machine') return 'virtual_machines';
    if (assetType === 'software') return 'software';
    if (assetType === 'certificate_key') return 'certificate_keys';
    return assetType ?? '';
  };

  return useMutation<void>(
    async ({
      assetId,
      scopeId,
      compliant,
      justification,
      last_review_date,
      next_review_date,
      compliance_notes,
      assetType,
    }: {
      assetId: number;
      scopeId: number;
      compliant: boolean;
      justification?: string;
      last_review_date?: string;
      next_review_date?: string;
      compliance_notes?: string;
      assetType?: string;
    }) => {
      const payload: Record<string, any> = { compliant };
      if (justification !== undefined) payload.justification = justification;
      if (last_review_date !== undefined) payload.last_review_date = last_review_date;
      if (next_review_date !== undefined) payload.next_review_date = next_review_date;
      if (compliance_notes !== undefined) payload.compliance_notes = compliance_notes;

      const result = await mutationClient(
        `${API_BASE}/compliance/assets/${assetId}/scopes/${scopeId}`,
        'PUT',
        payload,
        session?.accessToken
      );

      // Invalidate relevant caches to update UI
      const formattedType = formatAssetTypeForUrl(assetType);
      await Promise.all([
        formattedType && assetId
          ? swrMutate(`${API_BASE}/assets/${formattedType}/${assetId}`)
          : Promise.resolve(null),
        swrMutate(`${API_BASE}/compliance/scopes/${scopeId}/assets`),
      ]);

      return result;
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.compliance.assetScopeComplianceUpdated',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.role.createSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.user.createSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.user.updateSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.user.deleteSuccess',
        color: 'green',
      },
    }
  );
};

export const usePurgeUser = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/recycle_bin/users/${id}/purge`, 'DELETE', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.user.purgeSuccess',
        color: 'green',
      },
    }
  );
};

export const useRestoreUser = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/recycle_bin/users/${id}/restore`, 'POST', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.user.restoreSuccess',
        color: 'green',
      },
    }
  );
};

// Purge Group
export const usePurgeGroup = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/recycle_bin/groups/${id}/purge`, 'DELETE', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.group.purgeSuccess',
        color: 'green',
      },
    }
  );
};

// Restore Group 
export const useRestoreGroup = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/recycle_bin/groups/${id}/restore`, 'POST', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.group.restoreSuccess',
        color: 'green',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.asset.createSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.asset.updateSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.asset.deleteSuccess',
        color: 'red',
      },
    }
  );
};

// Purge Asset
export const usePurgeAsset = (assetType: string, options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/recycle_bin/assets/${assetType}/${id}/purge`, 'DELETE', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.asset.purgeSuccess',
        color: 'green',
      },
    }
  );
};

// Restore Asset
export const useRestoreAsset = (assetType: string, options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/recycle_bin/assets/${assetType}/${id}/restore`, 'POST', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.asset.restoreSuccess',
        color: 'green',
      },
    }
  );
};

// Software mutations
export const useCreateSoftware = (options?: {onSuccess?: (s:any)=>void; onError?: (e:any)=>void;})=>{
  const {data:session}=useSession();
  return useMutation(async(data:any)=>mutationClient(`${API_BASE}/assets/software/`,'POST',data,session?.accessToken),options);
};
export const useUpdateSoftware = (options?: {onSuccess?:(s:any)=>void; onError?:(e:any)=>void;})=>{
  const {data:session}=useSession();
  return useMutation(async({id,...data}:{id:number}&any)=>mutationClient(`${API_BASE}/assets/software/${id}`,'PUT',data,session?.accessToken),options);
};
export const useDeleteSoftware = (options?: {onSuccess?:()=>void; onError?:(e:any)=>void;})=>{
  const {data:session}=useSession();
  return useMutation<void>(async(id:number)=>mutationClient(`${API_BASE}/assets/software/${id}`,'DELETE',undefined,session?.accessToken),options);
};

// Software ↔ Documents linking
export const useAttachDocumentToSoftware = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ softwareId, documentId }: { softwareId: number; documentId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/${softwareId}/documents/${documentId}`,
        'POST',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/${softwareId}/documents`),
      ]);
      return result;
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.software.documentAttachedSuccess',
        color: 'teal',
      },
    }
  );
};

export const useDetachDocumentFromSoftware = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ softwareId, documentId }: { softwareId: number; documentId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/${softwareId}/documents/${documentId}`,
        'DELETE',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/${softwareId}/documents`),
      ]);
      return result;
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.software.documentDetachedSuccess',
        color: 'red',
      },
    }
  );
};

// Network Devices mutations
export const useCreateNetworkDevice = (options?: { onSuccess?: (nd:any)=>void; onError?: (e:any)=>void;}) => {
  const { data: session } = useSession();
  return useMutation(
    async (data:any)=> mutationClient(`${API_BASE}/assets/network_devices/`,'POST',data,session?.accessToken),
    {
      ...options,
      successNotification: {
        message: 'notifications.networkDevice.createSuccess',
        color: 'teal',
      },
    }
  );
};
export const useUpdateNetworkDevice = (options?: { onSuccess?: (nd:any)=>void; onError?: (e:any)=>void;})=>{
  const { data: session } = useSession();
  return useMutation(
    async ({id,...data}:{id:number}&any)=>mutationClient(`${API_BASE}/assets/network_devices/${id}`,'PUT',data,session?.accessToken),
    {
      ...options,
      successNotification: {
        message: 'notifications.networkDevice.updateSuccess',
        color: 'teal',
      },
    }
  );
};
export const useDeleteNetworkDevice = (options?: { onSuccess?: () => void; onError?: (e:any)=>void;})=>{
  const { data: session } = useSession();
  return useMutation<void>(
    async (id:number)=>mutationClient(`${API_BASE}/assets/network_devices/${id}`,'DELETE',undefined,session?.accessToken),
    {
      ...options,
      successNotification: {
        message: 'notifications.networkDevice.deleteSuccess',
        color: 'red',
      },
    }
  );
};

// Software Versions mutations
export const useCreateSoftwareVersion = (options?: { onSuccess?: (version: any) => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation(async(data:any)=>mutationClient(`${API_BASE}/assets/software/versions/`,'POST',data,session?.accessToken),options);
};

export const useUpdateSoftwareVersion = (options?: { onSuccess?: (version:any)=>void; onError?:(e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation(async({id,...data}:{id:number}&any)=>mutationClient(`${API_BASE}/assets/software/versions/${id}`,'PUT',data,session?.accessToken),options);
};
export const useDeleteSoftwareVersion = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(async(id:number)=>mutationClient(`${API_BASE}/assets/software/versions/${id}`,'DELETE',undefined,session?.accessToken),options);
};

// ------------------------------------------------------------
// Software Version ↔ Assets relationships
// POST /assets/software/versions/{version_id}/computers/{computer_id}
export const useAttachVersionToComputer = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ versionId, computerId }: { versionId: number; computerId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/versions/${versionId}/computers/${computerId}`,
        'POST',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/versions/${versionId}/computers`),
      ]);
      return result;
    },
    { ...options, successNotification: { message: 'notifications.software.versionAttachedToComputer', color: 'teal' } }
  );
};

export const useDetachVersionFromComputer = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ versionId, computerId }: { versionId: number; computerId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/versions/${versionId}/computers/${computerId}`,
        'DELETE',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/versions/${versionId}/computers`),
      ]);
      return result;
    },
    { ...options, successNotification: { message: 'notifications.software.versionDetachedFromComputer', color: 'red' } }
  );
};

// POST /assets/software/versions/{version_id}/virtual-machines/{virtual_machine_id}
export const useAttachVersionToVirtualMachine = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ versionId, virtualMachineId }: { versionId: number; virtualMachineId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/versions/${versionId}/virtual-machines/${virtualMachineId}`,
        'POST',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/versions/${versionId}/virtual-machines`),
      ]);
      return result;
    },
    { ...options, successNotification: { message: 'notifications.software.versionAttachedToVm', color: 'teal' } }
  );
};

export const useDetachVersionFromVirtualMachine = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ versionId, virtualMachineId }: { versionId: number; virtualMachineId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/versions/${versionId}/virtual-machines/${virtualMachineId}`,
        'DELETE',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/versions/${versionId}/virtual-machines`),
      ]);
      return result;
    },
    { ...options, successNotification: { message: 'notifications.software.versionDetachedFromVm', color: 'red' } }
  );
};

// POST /assets/software/versions/{version_id}/network-devices/{network_device_id}
export const useAttachVersionToNetworkDevice = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ versionId, networkDeviceId }: { versionId: number; networkDeviceId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/versions/${versionId}/network-devices/${networkDeviceId}`,
        'POST',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/versions/${versionId}/network-devices`),
      ]);
      return result;
    },
    { ...options, successNotification: { message: 'notifications.software.versionAttachedToNetworkDevice', color: 'teal' } }
  );
};

export const useDetachVersionFromNetworkDevice = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ versionId, networkDeviceId }: { versionId: number; networkDeviceId: number }) => {
      const result = await mutationClient(
        `${API_BASE}/assets/software/versions/${versionId}/network-devices/${networkDeviceId}`,
        'DELETE',
        undefined,
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/assets/software/versions/${versionId}/network-devices`),
      ]);
      return result;
    },
    { ...options, successNotification: { message: 'notifications.software.versionDetachedFromNetworkDevice', color: 'red' } }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.computer.createSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.computer.updateSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.computer.deleteSuccess',
        color: 'red',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.virtualMachine.createSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.virtualMachine.updateSuccess',
        color: 'teal',
      },
    }
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
    {
      ...options,
      successNotification: {
        message: 'notifications.virtualMachine.deleteSuccess',
        color: 'red',
      },
    }
  );
};

// Certificate Keys mutations
export const useCreateCertificateKey = (options?: {
  onSuccess?: (certificateKey: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (certificateKeyData: any) => {
      return mutationClient(`${API_BASE}/assets/certificate_keys/`, 'POST', certificateKeyData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.certificateKey.createSuccess',
        color: 'teal',
      },
    }
  );
};

export const useUpdateCertificateKey = (options?: {
  onSuccess?: (certificateKey: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...certificateKeyData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/assets/certificate_keys/${id}`, 'PUT', certificateKeyData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.certificateKey.updateSuccess',
        color: 'teal',
      },
    }
  );
};

export const useDeleteCertificateKey = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/assets/certificate_keys/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.certificateKey.deleteSuccess',
        color: 'red',
      },
    }
  );
};

// Locations mutations
export const useCreateLocation = (options?: {
  onSuccess?: (location: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (locationData: any) => {
      return mutationClient(`${API_BASE}/reference_data/locations/`, 'POST', locationData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.location.createSuccess',
        color: 'teal',
      },
    }
  );
};

export const useUpdateLocation = (options?: {
  onSuccess?: (location: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...locationData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/reference_data/locations/${id}`, 'PUT', locationData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.location.updateSuccess',
        color: 'teal',
      },
    }
  );
};

export const useDeleteLocation = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/reference_data/locations/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.location.deleteSuccess',
        color: 'teal',
      },
    }
  );
};

// Manufacturers mutations
export const useCreateManufacturer = (options?: {
  onSuccess?: (manufacturer: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (manufacturerData: any) => {
      return mutationClient(`${API_BASE}/reference_data/manufacturers/`, 'POST', manufacturerData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.manufacturer.createSuccess',
        color: 'teal',
      },
    }
  );
};

export const useUpdateManufacturer = (options?: {
  onSuccess?: (manufacturer: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...manufacturerData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/reference_data/manufacturers/${id}`, 'PUT', manufacturerData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.manufacturer.updateSuccess',
        color: 'teal',
      },
    }
  );
};

export const useDeleteManufacturer = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/reference_data/manufacturers/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.manufacturer.deleteSuccess',
        color: 'teal',
      },
    }
  );
};

// Operating Systems mutations
export const useCreateOperatingSystem = (options?: {
  onSuccess?: (operatingSystem: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (operatingSystemData: any) => {
      return mutationClient(`${API_BASE}/reference_data/operating_systems/`, 'POST', operatingSystemData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.operatingSystem.createSuccess',
        color: 'teal',
      },
    }
  );
};

export const useUpdateOperatingSystem = (options?: {
  onSuccess?: (operatingSystem: any) => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation(
    async ({ id, ...operatingSystemData }: { id: number } & any) => {
      return mutationClient(`${API_BASE}/reference_data/operating_systems/${id}`, 'PUT', operatingSystemData, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.operatingSystem.updateSuccess',
        color: 'teal',
      },
    }
  );
};

export const useDeleteOperatingSystem = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const { data: session } = useSession();

  return useMutation<void>(
    async (id: number) => {
      return mutationClient(`${API_BASE}/reference_data/operating_systems/${id}`, 'DELETE', undefined, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.operatingSystem.deleteSuccess',
        color: 'teal',
      },
    }
  );
};


// Generic quick create mutation for any resource type
export const useQuickCreate = (resourceType: string, options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successNotification?: {
    title?: string;
    message: string;
    color?: string;
  };
}) => {
  const { data: session } = useSession();

  return useMutation(
    async (data: any) => {
      return mutationClient(`${API_BASE}/${resourceType}s/`, 'POST', data, session?.accessToken);
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.quickCreate.success',
        messageValues: { resource: resourceType },
        color: 'teal',
      },
    }
  );
};



// Export the mutation client for direct use if needed
export { mutationClient }; 

// ------------------------------------------------------------
// Documents & Folders mutations

// Folders
export const useCreateDocumentFolder = (options?: { onSuccess?: (folder: any) => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation(
    async (data: { name: string; parent_id?: number | null }) =>
      mutationClient(`${API_BASE}/documents/folders`, 'POST', data, session?.accessToken),
    {
      ...options,
      successNotification: { message: 'notifications.folder.createSuccess', color: 'teal' },
    }
  );
};

export const useUpdateDocumentFolder = (options?: { onSuccess?: (folder:any)=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation(
    async ({ id, ...data }: { id: number } & { name?: string; parent_id?: number | null }) =>
      mutationClient(`${API_BASE}/documents/folders/${id}`, 'PUT', data, session?.accessToken),
    {
      ...options,
      successNotification: { message: 'notifications.folder.updateSuccess', color: 'teal' },
    }
  );
};

// ------------------------------------------------------------
// Compliance Controls ↔ Documents linking
export const useAttachDocumentsToControl = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ scopeId, controlId, documentIds }: { scopeId: number; controlId: number; documentIds: number[] }) => {
      const result = await mutationClient(
        `${API_BASE}/compliance/scopes/${scopeId}/controls/${controlId}/documents`,
        'POST',
        { document_ids: documentIds },
        session?.accessToken
      );
      // Invalidate SWR caches for both the controls list and the single control
      await Promise.all([
        swrMutate(`${API_BASE}/compliance/scopes/${scopeId}/controls`),
        swrMutate(`${API_BASE}/compliance/scopes/${scopeId}/controls/${controlId}`),
      ]);
      return result;
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.compliance.documentsAttachedToControlSuccess',
        color: 'teal',
      },
    }
  );
};

export const useDetachDocumentsFromControl = (options?: { onSuccess?: () => void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ scopeId, controlId, documentIds }: { scopeId: number; controlId: number; documentIds: number[] }) => {
      const result = await mutationClient(
        `${API_BASE}/compliance/scopes/${scopeId}/controls/${controlId}/documents`,
        'DELETE',
        { document_ids: documentIds },
        session?.accessToken
      );
      await Promise.all([
        swrMutate(`${API_BASE}/compliance/scopes/${scopeId}/controls`),
        swrMutate(`${API_BASE}/compliance/scopes/${scopeId}/controls/${controlId}`),
      ]);
      return result;
    },
    {
      ...options,
      successNotification: {
        message: 'notifications.compliance.documentsDetachedFromControlSuccess',
        color: 'red',
      },
    }
  );
};

export const useDeleteDocumentFolder = (options?: { onSuccess?: ()=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async (id: number) => mutationClient(`${API_BASE}/documents/folders/${id}`, 'DELETE', undefined, session?.accessToken),
    { ...options, successNotification: { message: 'notifications.folder.deleteSuccess', color: 'red' } }
  );
};

// Documents
export const useCreateDocument = (options?: { onSuccess?: (doc: Document)=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<Document>(
    async (data: { name: string; description?: string; folder_id?: number | null; file: File }) => {
      const fd = new FormData();
      fd.append('name', data.name);
      if (data.description) fd.append('description', data.description);
      if (data.folder_id !== undefined && data.folder_id !== null) fd.append('folder_id', String(data.folder_id));
      fd.append('file', data.file);
      return multipartMutationClient(`${API_BASE}/documents`, 'POST', fd, session?.accessToken);
    },
    { ...options, successNotification: { message: 'notifications.document.createSuccess', color: 'teal' } }
  );
};

export const useUpdateDocument = (options?: { onSuccess?: (doc: Document)=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<Document>(
    async ({ id, ...data }: { id: number } & { name?: string; description?: string; folder_id?: number | null }) =>
      mutationClient(`${API_BASE}/documents/${id}`, 'PATCH', data, session?.accessToken),
    { ...options, successNotification: { message: 'notifications.document.updateSuccess', color: 'teal' } }
  );
};

// Documents: update/rename/move folder
// Note: useUpdateDocumentFolder is defined once above. Remove duplicate.

export const useDeleteDocument = (options?: { onSuccess?: ()=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async (id: number) => mutationClient(`${API_BASE}/documents/${id}`, 'DELETE', undefined, session?.accessToken),
    { ...options, successNotification: { message: 'notifications.document.deleteSuccess', color: 'red' } }
  );
};

export const useUploadDocumentVersion = (options?: { onSuccess?: (data:any)=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation(
    async ({ documentId, file }: { documentId: number; file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return multipartMutationClient(`${API_BASE}/documents/${documentId}/versions`, 'POST', fd, session?.accessToken);
    },
    { ...options, successNotification: { message: 'notifications.version.uploadSuccess', color: 'teal' } }
  );
};

export const useDeleteDocumentVersion = (options?: { onSuccess?: ()=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async (versionId: number) => mutationClient(`${API_BASE}/documents/versions/${versionId}`, 'DELETE', undefined, session?.accessToken),
    { ...options, successNotification: { message: 'notifications.version.deleteSuccess', color: 'red' } }
  );
};

export const useResetPassword = (options?: { onSuccess?: ()=>void; onError?: (e:any)=>void; }) => {
  return useMutation<void>(
    async ({ token, password }: { token: string; password: string }) => mutationClient(`${API_BASE}/auth/reset-password`, 'POST', { token, new_password: password }),
    { ...options, successNotification: { message: 'notifications.password.resetSuccess', color: 'teal' } }
  );
};

export const useForgotPassword = (options?: { onSuccess?: ()=>void; onError?: (e:any)=>void; }) => {
  return useMutation<void>(
    async ({ email }: { email: string }) => mutationClient(`${API_BASE}/auth/forgot-password`, 'POST', { email }),
    { ...options }
  );
};

// Compliance Events
export const useUpdateComplianceEvent = (options?: { onSuccess?: ()=>void; onError?: (e:any)=>void; }) => {
  const { data: session } = useSession();
  return useMutation<void>(
    async ({ scopeId, eventId, data }: { scopeId: number; eventId: number; data: any }) => {
      const result = await mutationClient(
        `${API_BASE}/compliance/events/${eventId}`,
        'PUT',
        data,
        session?.accessToken
      );
      await swrMutate(`${API_BASE}/compliance/scopes/${scopeId}/events`);
      return result;
    },
    { ...options, successNotification: { message: 'notifications.complianceEvent.updateSuccess', color: 'teal' } }
  );
};
