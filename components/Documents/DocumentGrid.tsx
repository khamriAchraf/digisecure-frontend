import React from 'react';
import { Table, Group, Text, ThemeIcon, ActionIcon, Tooltip, Badge } from '@mantine/core';
import { IconFolder, IconFile, IconUpload, IconTrash, IconDownload } from '@tabler/icons-react';
import { Document, DocumentFolder, DocumentVersion } from '../../types/models';

export interface DocumentGridProps {
  subfolders: DocumentFolder[];
  documents: Document[];
  onOpenFolder: (id: number) => void;
  onUploadNewVersion: (doc: Document) => void;
  onDownloadLatest: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
}

const latestVersion = (doc: Document): DocumentVersion | undefined => {
  if (!doc.versions || doc.versions.length === 0) return undefined;
  return [...doc.versions].sort((a, b) => b.version_number - a.version_number)[0];
};

const formatSize = (bytes?: number) => {
  if (bytes === undefined || bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const DocumentGrid: React.FC<DocumentGridProps> = ({ subfolders, documents, onOpenFolder, onUploadNewVersion, onDownloadLatest, onDeleteDocument }) => {
  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: '50%' }}>
            <Text size="sm" fw={500}>Name</Text>
          </Table.Th>
          <Table.Th style={{ width: '20%' }}>
            <Text size="sm" fw={500}>Modified</Text>
          </Table.Th>
          <Table.Th style={{ width: '15%' }}>
            <Text size="sm" fw={500}>Size</Text>
          </Table.Th>
          <Table.Th style={{ width: '10%' }}>
            <Text size="sm" fw={500}>Versions</Text>
          </Table.Th>
          <Table.Th style={{ width: '5%' }}>
            <Text size="sm" fw={500}>Actions</Text>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {subfolders.map((f) => (
          <Table.Tr key={`folder-${f.id}`} onClick={() => onOpenFolder(f.id)} style={{ cursor: 'pointer' }}>
            <Table.Td>
              <Group gap="xs">
                <ThemeIcon variant="light" color="yellow"><IconFolder size={16} /></ThemeIcon>
                <Text fw={600}>{f.name}</Text>
              </Group>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="dimmed">{f.updated_at ? new Date(f.updated_at).toLocaleString() : '—'}</Text>
            </Table.Td>
            <Table.Td>—</Table.Td>
            <Table.Td>—</Table.Td>
            <Table.Td />
          </Table.Tr>
        ))}

        {documents.map((d) => {
          const lv = latestVersion(d);
          return (
            <Table.Tr key={`doc-${d.id}`}>
              <Table.Td>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="blue"><IconFile size={16} /></ThemeIcon>
                  <Group gap={6}>
                    <Text fw={600}>{d.name}</Text>
                    {lv && <Badge variant="light">v{lv.version_number}</Badge>}
                  </Group>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">{d.updated_at ? new Date(d.updated_at).toLocaleString() : '—'}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">{formatSize(lv?.file_size)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">{d.versions ? d.versions.length : '—'}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap={6}>
                  <Tooltip label="Download latest">
                    <ActionIcon variant="subtle" onClick={() => onDownloadLatest(d)} aria-label="Download latest">
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Upload new version">
                    <ActionIcon variant="subtle" onClick={() => onUploadNewVersion(d)} aria-label="Upload new version">
                      <IconUpload size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete document">
                    <ActionIcon variant="subtle" color="red" onClick={() => onDeleteDocument(d)} aria-label="Delete">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
};

export default DocumentGrid;

