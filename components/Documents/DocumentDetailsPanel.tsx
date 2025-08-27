import React, { useMemo, useState } from 'react';
import { Paper, Group, Text, ActionIcon, Tooltip, Tabs, Table, Button, Loader, Alert, Box } from '@mantine/core';
import { IconDownload, IconUpload, IconTrash, IconEdit, IconArrowsMove } from '@tabler/icons-react';
import { useDocument, useDocumentVersions, downloadDocumentVersion } from '../../src/fetchers';
import { useHasPermission, PERMISSIONS } from '../../src/hooks/usePermissions';
import { useDeleteDocument, useUploadDocumentVersion, useUpdateDocument } from '../../src/mutations';
import VersionUploadModal from './VersionUploadModal';
import RenameModal from './RenameModal';
import MoveDocumentModal from './MoveDocumentModal';
import type { DocumentVersion } from '../../types/models';

interface DocumentDetailsPanelProps {
  documentId: number;
  onDeleted?: () => void;
  onUpdated?: () => void; // notify parent to refresh listing
}

export const DocumentDetailsPanel: React.FC<DocumentDetailsPanelProps> = ({ documentId, onDeleted, onUpdated }) => {
  const { data: doc, isLoading: docLoading, mutate: refreshDoc } = useDocument(documentId);
  const { data: versions, isLoading: versionsLoading, mutate: refreshVersions } = useDocumentVersions(documentId);

  const canUpdate = useHasPermission(PERMISSIONS.DOCUMENTS_UPDATE);
  const canDelete = useHasPermission(PERMISSIONS.DOCUMENTS_DELETE);

  const deleteMutation = useDeleteDocument({ onSuccess: () => onDeleted?.() });
  const uploadMutation = useUploadDocumentVersion({ onSuccess: async () => { await refreshVersions(); await refreshDoc(); onUpdated?.(); } });
  const updateDoc = useUpdateDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const latest = useMemo(() => {
    const list = versions || [];
    return list.slice().sort((a, b) => b.version_number - a.version_number)[0];
  }, [versions]);

  if (docLoading || versionsLoading) {
    return (
      <Paper withBorder p="md">
        <Box p="md" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </Box>
      </Paper>
    );
  }

  if (!doc) {
    return (
      <Paper withBorder p="md">
        <Alert color="red">Failed to load document</Alert>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>{doc.name}</Text>
        <Group gap="xs">
          <Tooltip label="Download latest">
            <ActionIcon
              variant="light"
              onClick={() => latest && downloadDocumentVersion(latest.id, latest.file_name || doc.name)}
              disabled={!latest}
            >
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Rename">
            <ActionIcon variant="light" onClick={() => setRenameOpen(true)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          {canUpdate && (
            <Tooltip label="Upload version">
              <ActionIcon variant="light" onClick={() => setUploadOpen(true)}>
                <IconUpload size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {canUpdate && (
            <Tooltip label="Move to folder">
              <ActionIcon variant="light" onClick={() => setMoveOpen(true)}>
                <IconArrowsMove size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip label="Delete document">
              <ActionIcon variant="light" color="red" onClick={() => deleteMutation.mutate(doc.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      <Tabs defaultValue="versions">
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="versions">Versions</Tabs.Tab>
          <Tabs.Tab value="compliance">Compliance</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="versions" pt="sm">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Version</Table.Th>
                <Table.Th>Uploaded</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(versions || []).slice().sort((a, b) => b.version_number - a.version_number).map((v: DocumentVersion) => (
                <Table.Tr key={v.id}>
                  <Table.Td>v{v.version_number}</Table.Td>
                  <Table.Td>{new Date(v.uploaded_at).toLocaleString()}</Table.Td>
                  <Table.Td>{(v.file_size / 1024).toFixed(1)} KB</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="light" leftSection={<IconDownload size={14} />} onClick={() => downloadDocumentVersion(v.id, v.file_name)}>
                      Download
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="details" pt="sm">
          <Text size="sm" c="dimmed">Coming soon…</Text>
        </Tabs.Panel>
        <Tabs.Panel value="compliance" pt="sm">
          <Text size="sm" c="dimmed">Coming soon…</Text>
        </Tabs.Panel>
      </Tabs>

      <VersionUploadModal
        opened={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={async (file) => {
          await uploadMutation.mutate({ documentId, file });
          setUploadOpen(false);
        }}
      />

      <RenameModal
        opened={renameOpen}
        initialName={doc.name}
        title="Rename document"
        onClose={() => setRenameOpen(false)}
        onSubmit={async (newName) => {
          await updateDoc.mutate({ id: doc.id, name: newName });
          await refreshDoc();
          onUpdated?.();
          setRenameOpen(false);
        }}
      />

      <MoveDocumentModal
        opened={moveOpen}
        onClose={() => setMoveOpen(false)}
        onSubmit={async (destinationFolderId) => {
          await updateDoc.mutate({ id: doc.id, folder_id: destinationFolderId ?? null });
          await Promise.all([refreshDoc(), refreshVersions()]);
          onUpdated?.();
          setMoveOpen(false);
        }}
      />
    </Paper>
  );
};

export default DocumentDetailsPanel;

