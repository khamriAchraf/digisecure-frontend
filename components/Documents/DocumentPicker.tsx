import React, { useState } from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { FolderTree } from './FolderTree';
import { useDocumentFolderTree } from '../../src/fetchers';
import { t } from '../../i18n';

type DocumentPickerProps = {
  onPick: (documentId: number) => void;
  onCancel: () => void;
};

export const DocumentPicker: React.FC<DocumentPickerProps> = ({ onPick, onCancel }) => {
  const { data: folderRoot } = useDocumentFolderTree();
  const [selectedFolderId, setSelectedFolderId] = useState<number>(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | undefined>(undefined);

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text fw={500}>{t('modals.pick_document')}</Text>
        <Group gap="xs">
          <Button size="xs" variant="default" onClick={onCancel}>Cancel</Button>
          <Button
            size="xs"
            disabled={!selectedDocumentId}
            onClick={() => selectedDocumentId && onPick(selectedDocumentId)}
          >
            Select
          </Button>
        </Group>
      </Group>
      <div style={{ height: '60vh' }}>
        <FolderTree
          root={folderRoot}
          selectedId={selectedFolderId}
          onSelect={setSelectedFolderId}
          height="100%"
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={(id) => setSelectedDocumentId(id)}
          includeRootDocuments
        />
      </div>
    </Stack>
  );
};

export const openDocumentPicker = (options?: { title?: string }): Promise<number | null> => {
  return new Promise((resolve) => {
    const modalId = modals.open({
      title: options?.title ?? 'Attach document',
      centered: true,
      size: 'lg',
      withCloseButton: false,
      children: (
        <DocumentPicker
          onCancel={() => {
            modals.close(modalId);
            resolve(null);
          }}
          onPick={(documentId) => {
            modals.close(modalId);
            resolve(documentId);
          }}
        />
      ),
    });
  });
};

export default DocumentPicker;


