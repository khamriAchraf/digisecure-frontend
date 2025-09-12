import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Group, Text, ActionIcon, Tooltip, Tabs, Table, Button, Loader, Alert, Box, Card, Grid, TextInput, Select, Textarea, NumberInput } from '@mantine/core';
import { IconDownload, IconUpload, IconTrash, IconEdit, IconArrowsMove, IconHelpCircle } from '@tabler/icons-react';
import { useDocument, useDocumentVersions, downloadDocumentVersion, useUsers } from '../../src/fetchers';
import { useHasPermission, PERMISSIONS } from '../../src/hooks/usePermissions';
import { useDeleteDocument, useUploadDocumentVersion, useUpdateDocument } from '../../src/mutations';
import VersionUploadModal from './VersionUploadModal';
import RenameModal from './RenameModal';
import MoveDocumentModal from './MoveDocumentModal';
import type { DocumentVersion } from '../../types/models';
import { DatePickerInput } from '@mantine/dates';
import { t } from '../../i18n';

interface DocumentDetailsPanelProps {
  documentId: number;
  onDeleted?: () => void;
  onUpdated?: () => void; // notify parent to refresh listing
}

export const DocumentDetailsPanel: React.FC<DocumentDetailsPanelProps> = ({ documentId, onDeleted, onUpdated }) => {
  const { data: doc, isLoading: docLoading, mutate: refreshDoc } = useDocument(documentId);
  const { data: versions, isLoading: versionsLoading, mutate: refreshVersions } = useDocumentVersions(documentId);

  const [form, setForm] = useState<Record<string, any>>({
    description: doc?.description || '',
    review_status: doc?.review_status || '',
    review_notes: doc?.review_notes || '',
    review_frequency_months: doc?.review_frequency_months || 0,
    review_date: null as Date | null,
    user_id: doc?.user_id || null,
  });

  const parseDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  useEffect(() => {
    setForm({
      description: doc?.description || '',
      review_status: doc?.review_status || '',
      review_notes: doc?.review_notes || '',
      review_frequency_months: doc?.review_frequency_months || 0,
      review_date: parseDate(doc?.review_date || null),
      user_id: doc?.user_id || null,
    });
  }, [doc]);

  const toValidDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    try {
      const parsed = new Date(value as any);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  };

  const formatDate = (value: unknown) => {
    const d = toValidDate(value);
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const canUpdate = useHasPermission(PERMISSIONS.DOCUMENTS_UPDATE);
  const canDelete = useHasPermission(PERMISSIONS.DOCUMENTS_DELETE);

  const deleteMutation = useDeleteDocument({ onSuccess: () => onDeleted?.() });
  const uploadMutation = useUploadDocumentVersion({ onSuccess: async () => { await refreshVersions(); await refreshDoc(); onUpdated?.(); } });
  const updateDoc = useUpdateDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  // Users dropdown search
  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState(userSearch);
  useEffect(() => {
    const h = setTimeout(() => setDebouncedUserSearch(userSearch), 300);
    return () => clearTimeout(h);
  }, [userSearch]);
  const { data: usersData, isLoading: usersLoading } = useUsers({ page: 1, per_page: 1000, search: debouncedUserSearch });

  const nextReviewDate: Date | null = useMemo(() => {
    const d = form.review_date;
    const freq = Number(form.review_frequency_months || 0);
    if (!d || !freq || Number.isNaN(freq) || freq <= 0) return null;
    const nd = new Date(d);
    const day = nd.getDate();
    nd.setMonth(nd.getMonth() + freq);
    // Adjust if month rolled over
    if (nd.getDate() !== day) {
      nd.setDate(0);
    }
    return nd;
  }, [form.review_date, form.review_frequency_months]);

  const latest = useMemo(() => {
    const list = versions || [];
    return list.slice().sort((a, b) => b.version_number - a.version_number)[0];
  }, [versions]);

  if (docLoading || versionsLoading) {
    return (
      <Card withBorder p="md">
        <Box p="md" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </Box>
      </Card>
    );
  }

  if (!doc) {
    return (
      <Card withBorder p="md">
        <Alert color="red">Failed to load document</Alert>
      </Card>
    );
  }

  return (
    <Card withBorder p="md">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>{doc.name}</Text>
        <Group gap="xs">
          <Tooltip label="Download latest">
            <ActionIcon
              variant="light"
              onClick={() => latest && downloadDocumentVersion(latest.id, latest.file_name || doc.name)}
              disabled={!latest}
            >
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Rename">
            <ActionIcon variant="light" onClick={() => setRenameOpen(true)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          {canUpdate && (
            <Tooltip label="Upload version">
              <ActionIcon variant="light" onClick={() => setUploadOpen(true)}>
                <IconUpload size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {canUpdate && (
            <Tooltip label="Move to folder">
              <ActionIcon variant="light" onClick={() => setMoveOpen(true)}>
                <IconArrowsMove size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip label="Delete document">
              <ActionIcon variant="light" color="red" onClick={() => deleteMutation.mutate(doc.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      <Tabs defaultValue="versions">
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="versions">Versions</Tabs.Tab>
          <Tabs.Tab value="compliance">Compliance</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="versions" pt="sm">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Version</Table.Th>
                <Table.Th>Uploaded</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(versions || []).slice().sort((a, b) => b.version_number - a.version_number).map((v: DocumentVersion) => (
                <Table.Tr key={v.id}>
                  <Table.Td>v{v.version_number}</Table.Td>
                  <Table.Td>{new Date(v.uploaded_at).toLocaleString()}</Table.Td>
                  <Table.Td>{(v.file_size / 1024).toFixed(1)} KB</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="light" leftSection={<IconDownload size={14} />} onClick={() => downloadDocumentVersion(v.id, v.file_name)}>
                      Download
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="details" pt="sm">
          <Grid>
            <Grid.Col span={12}>
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.currentTarget.value }))}
                autosize
                minRows={2}
                disabled={!canUpdate}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label={t('forms.documents.review_status')}
                data={[
                  { value: 'Draft', label: t('forms.documents.status.Draft') },
                  { value: 'Pending review', label: t('forms.documents.status.Pending review') },
                  { value: 'Approved', label: t('forms.documents.status.Approved') },
                  { value: 'Rejected', label: t('forms.documents.status.Rejected') },
                ]}
                value={form.review_status || null}
                onChange={(val) => setForm((f) => ({ ...f, review_status: val }))}
                allowDeselect
                disabled={!canUpdate}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label={t('forms.documents.review_date')}
                value={form.review_date}
                onChange={(val) => setForm((f) => ({ ...f, review_date: (val as Date | null) }))}
                valueFormat="YYYY-MM-DD"
                disabled={!canUpdate}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs" align="center">
                <Text fw={500}>{t('forms.documents.review_frequency_months')}</Text>
                <Tooltip label={t('forms.documents.help.computedReview')}>
                  <ActionIcon variant="subtle" size="sm">
                    <IconHelpCircle size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Text c="dimmed" mt={4}>{String(form.review_frequency_months ?? '') || '—'}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs" align="center">
                <Text fw={500}>{t('forms.documents.next_review_date')}</Text>
                <Tooltip label={t('forms.documents.help.computedReview')}>
                  <ActionIcon variant="subtle" size="sm">
                    <IconHelpCircle size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Text c="dimmed" mt={4}>{formatDate(nextReviewDate) ?? '—'}</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label={t('forms.documents.review_notes')}
                value={form.review_notes}
                onChange={(e) => setForm((f) => ({ ...f, review_notes: e.currentTarget.value }))}
                autosize
                minRows={2}
                disabled={!canUpdate}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label={t('forms.documents.assigned_user')}
                searchable
                data={(usersData?.data ?? []).map((u: any) => ({ value: String(u.id), label: u.full_name || u.username || u.email }))}
                value={form.user_id != null ? String(form.user_id) : null}
                onChange={(val) => setForm((f) => ({ ...f, user_id: val ? Number(val) : null }))}
                searchValue={userSearch}
                onSearchChange={setUserSearch}
                rightSection={usersLoading ? <Loader size="xs" /> : undefined}
                allowDeselect
                disabled={!canUpdate}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group justify="flex-end">
                <Button
                  onClick={async () => {
                    await updateDoc.mutate({
                      id: doc.id,
                      description: form.description,
                      review_status: form.review_status,
                      review_notes: form.review_notes,
                      review_date: formatDate(form.review_date),
                      user_id: form.user_id,
                    } as any);
                    await refreshDoc();
                    onUpdated?.();
                  }}
                  disabled={!canUpdate}
                >
                  {t('common.save')}
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
        <Tabs.Panel value="compliance" pt="sm">
          <Text size="sm" c="dimmed">Coming soon…</Text>
        </Tabs.Panel>
      </Tabs>

      <VersionUploadModal
        opened={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={async (file) => {
          await uploadMutation.mutate({ documentId, file });
          setUploadOpen(false);
        }}
      />

      <RenameModal
        opened={renameOpen}
        initialName={doc.name}
        title={t('forms.documents.rename_document')}
        onClose={() => setRenameOpen(false)}
        onSubmit={async (newName) => {
          await updateDoc.mutate({ id: doc.id, name: newName });
          await refreshDoc();
          onUpdated?.();
          setRenameOpen(false);
        }}
      />

      <MoveDocumentModal
        opened={moveOpen}
        onClose={() => setMoveOpen(false)}
        onSubmit={async (destinationFolderId) => {
          await updateDoc.mutate({ id: doc.id, folder_id: destinationFolderId ?? null });
          await Promise.all([refreshDoc(), refreshVersions()]);
          onUpdated?.();
          setMoveOpen(false);
        }}
      />
    </Card>
  );
};

export default DocumentDetailsPanel;

