import { useSoftwareDocuments } from '@/fetchers';
import { ActionIcon, Button, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconFileText, IconX } from '@tabler/icons-react';
import React from 'react'
import { openDocumentPicker } from './Documents/DocumentPicker';
import { useAttachDocumentToSoftware, useDetachDocumentFromSoftware } from '@/mutations';
import { t } from '../i18n';


interface SoftwareDocsManagerProps {
  assetId: string;
  assetType: string;
}

const SoftwareDocsManager = ({ assetId, assetType }: SoftwareDocsManagerProps) => {

  const { data: softwareDocuments, isLoading, isError, mutate } = useSoftwareDocuments(assetId);
  const { mutate: attachDoc, isLoading: isAttaching } = useAttachDocumentToSoftware({ onSuccess: () => mutate() });
  const { mutate: detachDoc, isLoading: isDetaching } = useDetachDocumentFromSoftware({ onSuccess: () => mutate() });

  return (
    <React.Fragment>
      <Stack gap="lg">
        <Group gap={2} justify="end" style={{ width: '100%' }}>
          <Button size="xs" loading={isAttaching} onClick={async () => {
            const picked = await openDocumentPicker({ title: t('forms.documents.attach') });
            if (picked) {
              attachDoc({ softwareId: Number(assetId), documentId: picked });
            }
          }}>{t('forms.documents.attach')}</Button>
        </Group>
        {softwareDocuments?.map((doc) => (
          <Group key={`attached-${doc.id}`} gap={8} justify="space-between">
            <Group gap={8}>
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconFileText size={14} />
              </ThemeIcon>
              <Text size="sm">{doc.name}</Text>
            </Group>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              loading={isDetaching}
              onClick={() => detachDoc({ softwareId: Number(assetId), documentId: doc.id })}
            >
              <IconX size={14} />
            </ActionIcon>
          </Group>
        ))}</Stack>
    </React.Fragment>
  )
}

export default SoftwareDocsManager