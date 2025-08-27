import React, { useState } from 'react';
import { Modal, Stack, TextInput, Group, Button } from '@mantine/core';

interface FolderCreateModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void> | void;
}

export const FolderCreateModal: React.FC<FolderCreateModalProps> = ({ opened, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(name.trim());
      setName('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="New Folder" size="sm">
      <Stack>
        <TextInput label="Folder name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!name.trim()}>Create</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default FolderCreateModal;

