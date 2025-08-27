import React, { useState } from 'react';
import { Modal, Stack, FileInput, Group, Button } from '@mantine/core';

interface VersionUploadModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void> | void;
}

export const VersionUploadModal: React.FC<VersionUploadModalProps> = ({ opened, onClose, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await onSubmit(file);
      setFile(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Upload new version" size="sm">
      <Stack>
        <FileInput label="File" value={file} onChange={setFile} placeholder="Select file" />
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!file}>Upload</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default VersionUploadModal;

