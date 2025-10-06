import React, { useEffect, useState } from 'react';
import { Modal, Stack, Text, Group, Button, Alert, Table, Loader, ScrollArea } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { Asset } from '../../types/models';

export interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  size?: string;
  confirmColor?: string;
  // Impact checking props
  showImpactedAssets?: boolean;
  resourceType?: 'location' | 'manufacturer';
  resourceId?: number;
  resourceName?: string;
}

export function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
  size = 'sm',
  confirmColor = 'red',
  showImpactedAssets = false,
  resourceType,
  resourceId,
  resourceName,
}: ConfirmModalProps) {
  const [impactedAssets, setImpactedAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const { data: session } = useSession();

  // Fetch assets manually when modal opens and impact checking is enabled
  useEffect(() => {
    if (!opened || !showImpactedAssets || !resourceId || !resourceType || !session?.accessToken) {
      setImpactedAssets([]);
      setAssetsLoading(false);
      return;
    }

    const fetchImpactedAssets = async () => {
      setAssetsLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const endpoint = resourceType === 'location' 
          ? `${API_BASE}/assets/?location_id=${resourceId}&per_page=50`
          : `${API_BASE}/assets/?manufacturer_id=${resourceId}&per_page=50`;
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setImpactedAssets(data.data || []);
        } else {
          setImpactedAssets([]);
        }
      } catch (error) {
        console.error('Error fetching impacted assets:', error);
        setImpactedAssets([]);
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchImpactedAssets();
  }, [opened, showImpactedAssets, resourceId, resourceType, session?.accessToken]);

  const getImpactMessage = () => {
    if (resourceType === 'location') {
      return `Deleting this location will impact ${impactedAssets.length} asset(s). These assets will no longer be attached to any location.`;
    } else if (resourceType === 'manufacturer') {
      return `Deleting this manufacturer will impact ${impactedAssets.length} asset(s). These assets will no longer be attached to any manufacturer.`;
    }
    return '';
  };

  return (
    <Modal opened={opened} onClose={onCancel} title={title} size={showImpactedAssets && impactedAssets.length > 0 ? 'lg' : size}>
      <Stack>
        {typeof message === 'string' ? <Text>{message}</Text> : message}
        
        {showImpactedAssets && assetsLoading && (
          <Group justify="center">
            <Loader size="sm" />
            <Text size="sm">Checking for impacted assets...</Text>
          </Group>
        )}

        {showImpactedAssets && !assetsLoading && impactedAssets.length > 0 && (
          <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
            <Stack gap="xs">
              <Text fw={500}>Warning: Assets will be affected</Text>
              <Text size="sm">{getImpactMessage()}</Text>
              
              <ScrollArea.Autosize mah={300}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Asset Name</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Serial Number</Table.Th>
                      <Table.Th>Status</Table.Th>
                      {resourceType === 'location' && <Table.Th>Current Location</Table.Th>}
                      {resourceType === 'manufacturer' && <Table.Th>Current Manufacturer</Table.Th>}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {impactedAssets.slice(0, 10).map((asset) => (
                      <Table.Tr key={asset.id}>
                        <Table.Td>{asset.name}</Table.Td>
                        <Table.Td>{asset.type || 'N/A'}</Table.Td>
                        <Table.Td>{asset.serial_number || 'N/A'}</Table.Td>
                        <Table.Td>{asset.status}</Table.Td>
                        {resourceType === 'location' && (
                          <Table.Td>{asset.location?.name || resourceName}</Table.Td>
                        )}
                        {resourceType === 'manufacturer' && (
                          <Table.Td>{asset.manufacturer?.name || resourceName}</Table.Td>
                        )}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea.Autosize>
              
              {impactedAssets.length > 10 && (
                <Text size="sm" c="dimmed">
                  ... and {impactedAssets.length - 10} more asset(s)
                </Text>
              )}
            </Stack>
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ConfirmModal;


