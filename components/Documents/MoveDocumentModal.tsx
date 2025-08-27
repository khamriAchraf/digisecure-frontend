import React, { useMemo, useState } from 'react';
import { Modal, Stack, Select, Group, Button, Loader, Alert } from '@mantine/core';
import { useDocumentFolderTree } from '../../src/fetchers';

interface MoveDocumentModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (destinationFolderId: number | null) => Promise<void> | void;
  excludeFolderId?: number | null; // optionally exclude current folder from options
}

type TreeNode = { id: number; name: string; children?: TreeNode[] };

const flattenTreeToOptions = (node?: TreeNode, depth = 0): { value: string; label: string; id: number }[] => {
  if (!node) return [];
  const indent = '— '.repeat(depth);
  const self = [{ value: String(node.id), id: node.id, label: `${indent}${node.name}` }];
  const children = (node.children || []).flatMap((c) => flattenTreeToOptions(c as TreeNode, depth + 1));
  return [...self, ...children];
};

export const MoveDocumentModal: React.FC<MoveDocumentModalProps> = ({ opened, onClose, onSubmit, excludeFolderId }) => {
  const { data: tree, isLoading, isError } = useDocumentFolderTree();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const options = useMemo(() => {
    const opts = flattenTreeToOptions(tree as any);
    // Optional: allow moving to root by picking id 0
    return opts.filter((o) => (excludeFolderId == null ? true : o.id !== excludeFolderId));
  }, [tree, excludeFolderId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(selected ? Number(selected) : null);
      setSelected(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Move document" size="sm">
      <Stack>
        {isLoading && <Loader />}
        {isError && <Alert color="red">Failed to load folders</Alert>}
        {!isLoading && !isError && (
          <Select
            label="Destination folder"
            placeholder="Select folder"
            data={options}
            value={selected}
            onChange={setSelected}
            searchable
          />
        )}
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!selected}>Move</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default MoveDocumentModal;

