import React, { useState, useEffect } from 'react';
import { Modal, Stack, TextInput, Group, Button } from '@mantine/core';

interface RenameModalProps {
  opened: boolean;
  initialName: string;
  title?: string;
  onClose: () => void;
  onSubmit: (newName: string) => Promise<void> | void;
}

export const RenameModal: React.FC<RenameModalProps> = ({ opened, initialName, title = 'Rename', onClose, onSubmit }) => {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) setName(initialName);
  }, [opened, initialName]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm">
      <Stack>
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!name.trim()}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default RenameModal;


