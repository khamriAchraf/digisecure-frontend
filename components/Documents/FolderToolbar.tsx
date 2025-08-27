import React, { useState } from 'react';
import { Group, Button, TextInput, FileButton, Tooltip } from '@mantine/core';
import { IconPlus, IconUpload } from '@tabler/icons-react';

interface FolderToolbarProps {
  canCreateFolder: boolean;
  canCreateDocument: boolean;
  onCreateFolder: () => void;
  onUploadFile: (file: File) => void;
  search: string;
  onSearchChange: (text: string) => void;
}

export const FolderToolbar: React.FC<FolderToolbarProps> = ({
  canCreateFolder,
  canCreateDocument,
  onCreateFolder,
  onUploadFile,
  search,
  onSearchChange,
}) => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Group justify="space-between" p="xs">
      <Group>
        {canCreateFolder && (
          <Button leftSection={<IconPlus size={16} />} size="xs" onClick={onCreateFolder}>
            New Folder
          </Button>
        )}
        {canCreateDocument && (
          <FileButton onChange={(f) => { if (f) { setFile(f); onUploadFile(f); setFile(null); } }} accept="*">
            {(props) => (
              <Tooltip label="Upload document">
                <Button {...props} leftSection={<IconUpload size={16} />} size="xs" variant="light">
                  Upload
                </Button>
              </Tooltip>
            )}
          </FileButton>
        )}
      </Group>
      <TextInput placeholder="Search documents" value={search} onChange={(e) => onSearchChange(e.target.value)} size="xs" style={{ minWidth: 240 }} />
    </Group>
  );
};

export default FolderToolbar;

