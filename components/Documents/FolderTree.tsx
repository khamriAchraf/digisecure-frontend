import React, { useMemo, useState, useCallback } from 'react';
import { Stack, Group, Text, ActionIcon, ScrollArea, ThemeIcon, Tooltip } from '@mantine/core';
import { IconChevronRight, IconChevronDown, IconFolder, IconFileText } from '@tabler/icons-react';
import { DocumentFolderNode, Document } from '../../types/models';
import { useFolderContents, useRootFolderDocuments } from '../../src/fetchers';

export interface FolderTreeProps {
  root?: DocumentFolderNode;
  selectedId?: number;
  onSelect: (id: number) => void;
  height?: number | string;
  // Optional file-selection for picker modals
  selectedDocumentId?: number;
  onSelectDocument?: (id: number, doc?: Document) => void;
  // Whether to include files that live directly under the virtual root (folder_id = null)
  includeRootDocuments?: boolean;
}

interface FlatNode extends DocumentFolderNode {
  depth: number;
  path: number[];
}

const flattenTree = (node: DocumentFolderNode | undefined, depth = 0, path: number[] = []): FlatNode[] => {
  if (!node) return [];
  const current: FlatNode = { ...node, depth, path: [...path, node.id] };
  const children = (node.children || []).flatMap((c) => flattenTree(c, depth + 1, current.path));
  return [current, ...children];
};

const DocumentList: React.FC<{
  folderId: number | null;
  depth: number;
  selectedDocumentId?: number;
  onSelectDocument?: (id: number, doc?: Document) => void;
}> = ({ folderId, depth, selectedDocumentId, onSelectDocument }) => {
  // Root files correspond to folder_id = null in the backend
  const isRoot = folderId === null;
  const { data: rootDocs } = useRootFolderDocuments(isRoot);
  const { data: contents } = useFolderContents(!isRoot && folderId !== null ? folderId : undefined);

  const rawDocuments: unknown = isRoot ? (rootDocs as unknown) : (contents?.documents as unknown);
  let documents: Document[] = [];
  if (Array.isArray(rawDocuments)) {
    documents = rawDocuments as Document[];
  } else if (rawDocuments && typeof rawDocuments === 'object') {
    const obj = rawDocuments as any;
    if (Array.isArray(obj.data)) {
      documents = obj.data as Document[];
    } else if (Array.isArray(obj.documents)) {
      documents = obj.documents as Document[];
    } else if (Array.isArray(obj.items)) {
      documents = obj.items as Document[];
    }
  }

  if (!onSelectDocument) return null;

  return (
    <>
      {documents.map((doc) => {
        const isSelectedDoc = selectedDocumentId === doc.id;
        return (
          <Group key={`doc-${doc.id}`} gap="xs" style={{ paddingLeft: depth * 12 }} justify="space-between">
            <Group
              gap={6}
              onClick={() => onSelectDocument(doc.id, doc)}
              style={{ cursor: 'pointer', flex: 1 }}
            >
              {/* placeholder to align with folder toggle */}
              <ActionIcon size="sm" variant="subtle" style={{ visibility: 'hidden' }}>
                <IconChevronRight size={16} />
              </ActionIcon>
              <ThemeIcon variant={isSelectedDoc ? 'filled' : 'light'} color={isSelectedDoc ? 'blue' : 'gray'} size="sm">
                <IconFileText size={14} />
              </ThemeIcon>
              <Text size="sm" fw={isSelectedDoc ? 600 : 400}>{doc.name}</Text>
            </Group>
          </Group>
        );
      })}
    </>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({ root, selectedId = 0, onSelect, height = '100%', selectedDocumentId, onSelectDocument, includeRootDocuments = true }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });

  const flat = useMemo(() => flattenTree(root), [root]);

  const isVisible = useCallback(
    (node: FlatNode) => node.depth === 0 || expanded[node.path[node.path.length - 2] ?? 0],
    [expanded]
  );

  const toggle = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <ScrollArea style={{ height }}>
      <Stack gap={4} p="xs">
        {flat.filter(isVisible).map((n) => {
          const hasChildren = (n.children || []).length > 0; // kept for potential future use
          const isSelected = n.id === selectedId;
          return (
            <React.Fragment key={n.path.join('/')}> 
              <Group gap="xs" style={{ paddingLeft: n.depth * 12 }} justify="space-between">
                <Group gap={6}
                  onClick={() => onSelect(n.id)}
                  style={{ cursor: 'pointer', flex: 1 }}
                >
                  <ActionIcon size="sm" variant="subtle" onClick={(e) => { e.stopPropagation(); toggle(n.id); }}>
                    {expanded[n.id] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  </ActionIcon>
                  <ThemeIcon variant={'light'} color={'gray'} size="sm">
                    <IconFolder size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={isSelected ? 600 : 400}>{n.name}</Text>
                </Group>
              </Group>
              {(
                n.id === 0
                  ? (includeRootDocuments && Boolean(expanded[0]))
                  : Boolean(expanded[n.id])
              ) && (
                <DocumentList
                  key={`docs-under-${n.id}`}
                  folderId={n.id === 0 ? null : n.id}
                  depth={n.depth + 1}
                  selectedDocumentId={selectedDocumentId}
                  onSelectDocument={onSelectDocument}
                />
              )}
            </React.Fragment>
          );
        })}
      </Stack>
    </ScrollArea>
  );
};

export default FolderTree;

