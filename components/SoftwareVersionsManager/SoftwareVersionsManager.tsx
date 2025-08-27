import React, { useMemo, useState } from 'react'
import { useSoftwareVersions } from '@/fetchers'
import { SoftwareVersion } from '../../types';
import VersionCard from './VersionCard';
import { Button, Grid, Stack, Modal, TextInput, Group, NumberInput, ActionIcon, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import SoftwareVersionDetails from './SoftwareVersionDetails';
import { useCreateSoftwareVersion } from '@/mutations';
import { IconPlus, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { t } from '../../i18n'

export default function SoftwareVersionsManager({ softwareId }: { softwareId: number }) {

  const [selectedVersion, setSelectedVersion] = useState<SoftwareVersion | null>(null);
  const [ascending, setAscending] = useState(false);
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState<{
    software_id: number;
    version: string;
    build_number: string;
    release_date: Date | null;
    end_of_life_date: Date | null;
    end_of_support_date: Date | null;
  }>({
    software_id: softwareId,
    version: '',
    build_number: '',
    release_date: null,
    end_of_life_date: null,
    end_of_support_date: null,
  });

  const { data: versions, isLoading, isError, mutate } = useSoftwareVersions(softwareId);

  const sortedVersions = useMemo(() => {
    if (!versions) return [] as SoftwareVersion[];
    const arr = [...versions];
    arr.sort((a, b) => {
      const aTime = new Date(a.release_date).getTime();
      const bTime = new Date(b.release_date).getTime();
      return ascending ? aTime - bTime : bTime - aTime;
    });
    return arr;
  }, [versions, ascending]);

  const { mutate: createVersion, isLoading: isCreating } = useCreateSoftwareVersion({
    onSuccess: async () => {
      setOpened(false);
      setForm({
        software_id: softwareId,
        version: '',
        build_number: '',
        release_date: null,
        end_of_life_date: null,
        end_of_support_date: null,
      });
      await mutate();
    },
  });

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

  const handleSubmit = async () => {
    const payload = {
      software_id: form.software_id,
      version: form.version,
      build_number: form.build_number,
      release_date: formatDate(form.release_date),
      end_of_life_date: formatDate(form.end_of_life_date),
      end_of_support_date: formatDate(form.end_of_support_date),
    } as any;
    await createVersion(payload);
  };

  return (
    <React.Fragment>
      <Grid>
        <Grid.Col span={3}>
          <Stack>
            <Group gap="xs">
              <Button leftSection={<IconPlus size={16} />} flex={1} onClick={() => setOpened(true)}>{t('forms.software.add_version')}</Button>
              <Tooltip flex={1} label={ascending ? 'Newest first' : 'Oldest first'}>
                <ActionIcon variant="light" size="lg" onClick={() => setAscending((v) => !v)}>
                  {ascending ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                </ActionIcon>
              </Tooltip>
            </Group>
            {sortedVersions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                setSelectedVersion={setSelectedVersion}
                selected={selectedVersion?.id === version.id}
              />
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={9}>
          {selectedVersion && <SoftwareVersionDetails softwareId={softwareId} version={selectedVersion} setSelectedVersion={setSelectedVersion} />}
        </Grid.Col>
      </Grid>

      <Modal opened={opened} onClose={() => setOpened(false)} title={t('modals.add_version')} centered>
        <Stack>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Version"
                placeholder="e.g. 2.0.1"
                required
                value={form.version}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((f) => ({ ...f, version: value }));
                }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Build number"
                placeholder="e.g. 2025.08.21-rc1"
                value={form.build_number}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((f) => ({ ...f, build_number: value }));
                }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Release date"
                placeholder="Pick date"
                value={form.release_date}
                onChange={(value) => setForm((f) => ({ ...f, release_date: value as Date | null }))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label="End of life date"
                placeholder="Pick date"
                value={form.end_of_life_date}
                onChange={(value) => setForm((f) => ({ ...f, end_of_life_date: value as Date | null }))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label="End of support date"
                placeholder="Pick date"
                value={form.end_of_support_date}
                onChange={(value) => setForm((f) => ({ ...f, end_of_support_date: value as Date | null }))}
              />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button loading={isCreating} onClick={handleSubmit}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </React.Fragment>
  )
}