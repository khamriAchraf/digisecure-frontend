import React, { useMemo, useState } from 'react';
import { AppShell, Grid, Paper, Stack, Title, Divider, Box, Loader, Alert, Container } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useDocumentFolderTree, useFolderContents, useDocumentFolders, useRootFolderDocuments, downloadDocumentVersion } from '../../fetchers';
import { useCreateDocumentFolder, useCreateDocument, useDeleteDocument, useUploadDocumentVersion, useUpdateDocument } from '../../mutations';
import { FolderTree } from '../../../components/Documents/FolderTree';
import { FolderToolbar } from '../../../components/Documents/FolderToolbar';
import { FolderCreateModal } from '../../../components/Documents/FolderCreateModal';
import VersionUploadModal from '../../../components/Documents/VersionUploadModal';
import FolderBreadcrumbs from '../../../components/Documents/FolderBreadcrumbs';
import DocumentDetailsPanel from '../../../components/Documents/DocumentDetailsPanel';
import { Table, Group, Text, ThemeIcon, ActionIcon, Tooltip, Badge, Button, Tabs } from '@mantine/core';
import { IconFolder, IconFile, IconUpload, IconTrash, IconDownload, IconEdit } from '@tabler/icons-react';
import type { Document as DocType, DocumentVersion } from '../../../types/models';
import { useHasPermission, PERMISSIONS } from '../../hooks/usePermissions';
import { useSession } from 'next-auth/react';
import RenameModal from '../../../components/Documents/RenameModal';
import { renameFolder } from '../../fetchers';
import { notifications } from '@mantine/notifications';
import { useContextMenu } from 'mantine-contextmenu';

const DocumentsPage: React.FC = () => {
    const { data: tree, isLoading: treeLoading, mutate: refreshTree } = useDocumentFolderTree();
    const [currentFolderId, setCurrentFolderId] = useState<number>(0);
    const isRoot = currentFolderId === 0;
  const { data: contents, isLoading: contentsLoading, mutate: refreshContents } = useFolderContents(isRoot ? undefined : currentFolderId);
  const { data: listedFolders, isLoading: listLoading, mutate: refreshListedFolders } = useDocumentFolders(isRoot ? undefined : currentFolderId);
  const { data: rootDocs, isLoading: rootDocsLoading, mutate: refreshRootDocs } = useRootFolderDocuments(isRoot);

    const canRead = useHasPermission(PERMISSIONS.DOCUMENTS_READ);
    const canCreate = useHasPermission(PERMISSIONS.DOCUMENTS_CREATE);
    const canUpdate = useHasPermission(PERMISSIONS.DOCUMENTS_UPDATE);
    const canDelete = useHasPermission(PERMISSIONS.DOCUMENTS_DELETE);

    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 400);
    const { data: session } = useSession();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadDocId, setUploadDocId] = useState<number | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
    const [docToRename, setDocToRename] = useState<DocType | null>(null);
    const [folderToRename, setFolderToRename] = useState<any | null>(null);

  const createFolder = useCreateDocumentFolder({
    onSuccess: async () => {
      await refreshTree();
      if (isRoot) {
        await refreshListedFolders();
      } else {
        await refreshContents();
      }
    },
  });
  const createDocument = useCreateDocument({
    onSuccess: async () => {
      if (isRoot) {
        await refreshRootDocs();
      } else {
        await refreshContents();
      }
    },
  });
    const deleteDocument = useDeleteDocument({ onSuccess: async () => { await refreshContents(); } });
    const uploadVersion = useUploadDocumentVersion({ onSuccess: async () => { await refreshContents(); } });
    const updateDocument = useUpdateDocument({ onSuccess: async () => { await refreshContents(); } });

    const handleCreateFolder = async (name: string) => {
        await createFolder.mutate({ name, parent_id: currentFolderId || null });
    };

    const handleUploadInitial = async (file: File) => {
        await createDocument.mutate({ name: file.name, folder_id: currentFolderId || null, file });
    };

    const handleOpenUploadVersion = (doc: { id: number }) => {
        setUploadDocId(doc.id);
        setUploadModalOpen(true);
    };

    const handleUploadVersion = async (file: File) => {
        if (!uploadDocId) return;
        await uploadVersion.mutate({ documentId: uploadDocId, file });
        setUploadDocId(null);
    };

    const handleDownloadLatest = async (doc: import('../../../types/models').Document) => {
        const latest = (doc.versions || []).sort((a: any, b: any) => b.version_number - a.version_number)[0];
        if (!latest) {
            notifications.show({ color: 'yellow', message: 'No versions to download' });
            return;
        }
        await downloadDocumentVersion(latest.id, latest.file_name || doc.name);
    };

    const handleDeleteDocument = async (doc: any) => {
        if (!canDelete) return;
        await deleteDocument.mutate(doc.id);
        if (selectedDoc?.id === doc.id) setSelectedDoc(null);
    };

    const rootDocsArray = useMemo(() => {
        if (!isRoot) return [] as any[];
        const v: any = rootDocs;
        if (Array.isArray(v)) return v;
        if (v?.documents && Array.isArray(v.documents)) return v.documents;
        if (v?.data && Array.isArray(v.data)) return v.data;
        return [] as any[];
    }, [isRoot, rootDocs]);

    const filteredDocuments: DocType[] = useMemo(() => {
        const docs: DocType[] = isRoot ? (rootDocsArray as DocType[]) : ((contents?.documents || []) as DocType[]);
        if (!debouncedSearch) return docs;
        const q = debouncedSearch.toLowerCase();
        return docs.filter((d: DocType) => (d.name || '').toLowerCase().includes(q) || ((d.description || '').toLowerCase().includes(q)));
    }, [isRoot, contents?.documents, rootDocsArray, debouncedSearch]);

    if (!canRead) {
        return <Alert color="red">You do not have permission to view documents.</Alert>;
    }

    const { showContextMenu } = useContextMenu();

    return (
    <Container size="xl" py="md">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
          <Paper p={0}>
            <Stack>
              <Box p="md">
                <Title order={3}>Documents</Title>
              </Box>
              <Divider />
              <FolderToolbar
                canCreateFolder={canCreate}
                canCreateDocument={canCreate}
                onCreateFolder={() => setCreateModalOpen(true)}
                onUploadFile={handleUploadInitial}
                search={search}
                onSearchChange={setSearch}
              />
              <Box px="md" pb="xs">
              <FolderBreadcrumbs
                  tree={tree as any}
                  currentFolderId={currentFolderId}
                  onNavigate={(id) => setCurrentFolderId(id)}
                /></Box>
              <Divider />
              <Box p="md">
                {(isRoot ? (listLoading || rootDocsLoading) : contentsLoading) ? (
                  <Box p="md" style={{ display: 'flex', justifyContent: 'center' }}><Loader /></Box>
                ) : (
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: selectedDoc ? 4 : 12 }}>
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ width: '50%' }}>
                              <Text size="sm" fw={500}>Name</Text>
                            </Table.Th>
                            {selectedDoc ? null : (
                              <Table.Th style={{ width: '25%' }}>
                                <Text size="sm" fw={500}>Modified</Text>
                              </Table.Th>
                            )}
                            {selectedDoc ? null : (
                              <Table.Th style={{ width: '25%' }}>
                                <Text size="sm" fw={500}>Size</Text>
                              </Table.Th>
                            )}
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {!isRoot && (
                            <Table.Tr onClick={() => {
                              const findParent = (node: any, target: number, parentId: number | null = null): number | null => {
                                if (!node) return null;
                                if (node.id === target) return parentId;
                                for (const child of node.children || []) {
                                  const res = findParent(child, target, node.id);
                                  if (res !== null) return res;
                                }
                                return null;
                              };
                              const parent = findParent(tree, currentFolderId, null);
                              setCurrentFolderId(parent ?? 0);
                              setSelectedDoc(null);
                            }} style={{ cursor: 'pointer' }}
                            >
                              <Table.Td><Text fw={600}>..</Text></Table.Td>
                              {selectedDoc ? null : <Table.Td>—</Table.Td>}
                              {selectedDoc ? null : <Table.Td>—</Table.Td>}
                            </Table.Tr>
                          )}
                          {(isRoot ? (listedFolders || []) : (contents?.subfolders || [])).map((f: any) => (
                            <Table.Tr key={`folder-${f.id}`} onClick={() => { setCurrentFolderId(f.id); setSelectedDoc(null); }} style={{ cursor: 'pointer' }}>
                              <Table.Td>
                                <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                  <ThemeIcon variant="light" color="yellow"><IconFolder size={16} /></ThemeIcon>
                                  <Text fw={600} title={f.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</Text>
                                </Group>
                              </Table.Td>   
                              {selectedDoc ? null : (
                                <>
                                   <Table.Td><Text size="sm" c="dimmed">{f.updated_at ? new Date(f.updated_at).toLocaleString() : '—'}</Text></Table.Td>
                                 
                                </>
                              )}
                            </Table.Tr>
                          ))}
                          {filteredDocuments.map((d: DocType) => {
                            const lv = (d.versions || []).sort((a: any, b: any) => b.version_number - a.version_number)[0];
                            const size = lv?.file_size;
                            const formatSize = (bytes?: number) => {
                              if (bytes === undefined || bytes === null) return '—';
                              if (bytes < 1024) return `${bytes} B`;
                              if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                              if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                              return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
                            };
                            const isSelected = selectedDoc?.id === d.id;
                            return (
                              <Table.Tr key={`doc-${d.id}`} onClick={() => setSelectedDoc(d)} style={{ cursor: 'pointer', background: isSelected ? 'var(--mantine-color-gray-1)' : undefined }}>
                                <Table.Td>
                                  <Group gap="xs" style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
                                    <ThemeIcon variant="light" color="blue"><IconFile size={16} /></ThemeIcon>
                                    <Group gap={6} style={{ flex: 1, minWidth: 0 }}>
                                      <Text fw={600} title={d.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</Text>
                                      {lv && <Badge variant="light">v{lv.version_number}</Badge>}
                                    </Group>
                                  </Group>
                                </Table.Td>
                                {selectedDoc ? null : (
                                  <>
                                    <Table.Td><Text size="sm" c="dimmed">{d.updated_at ? new Date(d.updated_at).toLocaleString() : '—'}</Text></Table.Td>
                                    <Table.Td>
                                      <Group gap={6}>
                                        <Text size="sm" c="dimmed">{formatSize(size)}</Text>
                                      </Group>
                                    </Table.Td>
                                  </>
                                )}
                              </Table.Tr>
                            );
                          })}
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>

                    {selectedDoc && (
                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <DocumentDetailsPanel
                          documentId={selectedDoc.id}
                          onDeleted={() => setSelectedDoc(null)}
                          onUpdated={async () => {
                            // refresh list to reflect changed name/version size etc.
                            await Promise.all([refreshContents(), refreshTree(), refreshRootDocs()]);
                          }}
                        />
                      </Grid.Col>
                    )}
                  </Grid>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <FolderCreateModal opened={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateFolder} />
      <VersionUploadModal opened={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onSubmit={handleUploadVersion} />
      <RenameModal
        opened={!!docToRename}
        initialName={docToRename?.name || ''}
        title="Rename document"
        onClose={() => setDocToRename(null)}
        onSubmit={async (newName) => {
          if (!docToRename) return;
          await updateDocument.mutate({ id: docToRename.id, name: newName });
          setDocToRename(null);
          await Promise.all([refreshContents(), refreshTree()]);
        }}
      />
      <RenameModal
        opened={!!folderToRename}
        initialName={folderToRename?.name || ''}
        title="Rename folder"
        onClose={() => setFolderToRename(null)}
        onSubmit={async (newName) => {
          if (!folderToRename) return;
          await renameFolder(folderToRename.id, { name: newName }, session?.accessToken);
          setFolderToRename(null);
          await Promise.all([refreshContents(), refreshTree()]);
        }}
      />
    </Container >
  );
};

export default DocumentsPage;

