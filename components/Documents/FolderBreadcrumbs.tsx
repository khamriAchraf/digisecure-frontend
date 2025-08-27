import React, { useMemo } from 'react';
import { Breadcrumbs, Anchor, Text } from '@mantine/core';
import { DocumentFolderNode } from '../../types/models';

interface FolderBreadcrumbsProps {
  tree?: DocumentFolderNode;
  currentFolderId: number;
  onNavigate: (id: number) => void;
}

const findPath = (node: DocumentFolderNode | undefined, targetId: number): DocumentFolderNode[] | null => {
  if (!node) return null;
  if (node.id === targetId) return [node];
  for (const child of node.children || []) {
    const childPath = findPath(child, targetId);
    if (childPath) return [node, ...childPath];
  }
  return node.id === 0 && targetId === 0 ? [node] : null;
};

export const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({ tree, currentFolderId, onNavigate }) => {
  const path = useMemo(() => {
    if (!tree) return [{ id: 0, name: 'root' } as any];
    const p = findPath(tree, currentFolderId) || [tree];
    return p;
  }, [tree, currentFolderId]);

  return (
    <Breadcrumbs>
      {path.map((node, idx) => {
        const isLast = idx === path.length - 1;
        if (isLast) {
          return (
            <Text key={node.id} size="sm" c="dimmed">
              {node.name}
            </Text>
          );
        }
        return (
          <Anchor key={node.id} size="sm" onClick={() => onNavigate(node.id)}>
            {node.name}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
};

export default FolderBreadcrumbs;


