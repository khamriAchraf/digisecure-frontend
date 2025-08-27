import { Card, Stack } from '@mantine/core'
import { Group } from '@mantine/core'
import { Badge } from '@mantine/core'
import { Title } from '@mantine/core'
import { ActionIcon } from '@mantine/core'
import { TextInput, NumberInput, Button, Grid } from '@mantine/core'
import { Tabs, Divider } from '@mantine/core'
import React, { useEffect, useMemo, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { SoftwareVersion } from '../../types'
import { DatePickerInput } from '@mantine/dates'
import { useUpdateSoftwareVersion, useAttachVersionToComputer, useDetachVersionFromComputer, useAttachVersionToVirtualMachine, useDetachVersionFromVirtualMachine, useAttachVersionToNetworkDevice, useDetachVersionFromNetworkDevice } from '@/mutations'
import { mutate as swrMutate } from 'swr'
import { API_BASE, useComputers, useVirtualMachines, useNetworkDevices, useSoftwareVersionComputers, useSoftwareVersionVirtualMachines, useSoftwareVersionNetworkDevices } from '@/fetchers'
import { t } from '../../i18n'
import RelationshipWidget, { RelationshipItem } from '../RelationshipWidget'

interface SoftwareVersionDetailsProps {
    version: SoftwareVersion;
    softwareId: number;
    setSelectedVersion: (version: SoftwareVersion | null) => void;
}

const SoftwareVersionDetails = ({ version, softwareId, setSelectedVersion }: SoftwareVersionDetailsProps) => {
  const [form, setForm] = useState<{
    version: string;
    build_number: string;
    release_date: Date | null;
    end_of_life_date: Date | null;
    end_of_support_date: Date | null;
  }>(() => ({
    version: version.version,
    build_number: (version as any).build_number ?? '',
    release_date: null,
    end_of_life_date: null,
    end_of_support_date: null,
  }));

  const parseDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  useEffect(() => {
    setForm({
      version: version.version,
      build_number: (version as any).build_number ?? '',
      release_date: parseDate((version as any).release_date as any),
      end_of_life_date: parseDate((version as any).end_of_life_date as any),
      end_of_support_date: parseDate((version as any).end_of_support_date as any),
    });
  }, [version]);

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

  const softwareVersionsKey = useMemo(() => `${API_BASE}/assets/software/${softwareId}/versions`, [softwareId]);

  const { mutate: updateVersion, isLoading } = useUpdateSoftwareVersion({
    onSuccess: async () => {
      await swrMutate(softwareVersionsKey);
    },
  });

  // ----- Relationships state & hooks -----
  // Debounced search inputs for options
  const [computerSearch, setComputerSearch] = useState('');
  const [vmSearch, setVmSearch] = useState('');
  const [ndSearch, setNdSearch] = useState('');

  const [debouncedComputerSearch, setDebouncedComputerSearch] = useState(computerSearch);
  const [debouncedVmSearch, setDebouncedVmSearch] = useState(vmSearch);
  const [debouncedNdSearch, setDebouncedNdSearch] = useState(ndSearch);

  useEffect(() => { const h = setTimeout(()=>setDebouncedComputerSearch(computerSearch),300); return ()=>clearTimeout(h); }, [computerSearch]);
  useEffect(() => { const h = setTimeout(()=>setDebouncedVmSearch(vmSearch),300); return ()=>clearTimeout(h); }, [vmSearch]);
  useEffect(() => { const h = setTimeout(()=>setDebouncedNdSearch(ndSearch),300); return ()=>clearTimeout(h); }, [ndSearch]);

  // Fetch linked assets for this version
  const { data: versionComputers, isLoading: vcLoading, mutate: mutateVC } = useSoftwareVersionComputers(version.id);
  const { data: versionVMs, isLoading: vvmLoading, mutate: mutateVVM } = useSoftwareVersionVirtualMachines(version.id);
  const { data: versionNDs, isLoading: vndLoading, mutate: mutateVND } = useSoftwareVersionNetworkDevices(version.id);

  // Fetch available assets with search
  const { data: computersData, isLoading: computersLoading } = useComputers({ page:1, per_page:1000, search: debouncedComputerSearch });
  const { data: vmsData, isLoading: vmsLoading } = useVirtualMachines({ page:1, per_page:1000, search: debouncedVmSearch });
  const { data: ndsData, isLoading: ndsLoading } = useNetworkDevices({ page:1, per_page:1000, search: debouncedNdSearch });

  // Mutations to attach/detach
  const attachVC = useAttachVersionToComputer({ onSuccess: mutateVC });
  const detachVC = useDetachVersionFromComputer({ onSuccess: mutateVC });
  const attachVVM = useAttachVersionToVirtualMachine({ onSuccess: mutateVVM });
  const detachVVM = useDetachVersionFromVirtualMachine({ onSuccess: mutateVVM });
  const attachVND = useAttachVersionToNetworkDevice({ onSuccess: mutateVND });
  const detachVND = useDetachVersionFromNetworkDevice({ onSuccess: mutateVND });

  const toArray = (val: any) => (Array.isArray(val) ? val : (Array.isArray(val?.data) ? val.data : []));

  const currentComputerItems: RelationshipItem[] = toArray(versionComputers).map((c: any) => ({ id: c.id, label: c.name || c.hostname || String(c.id) }));
  const currentVmItems: RelationshipItem[] = toArray(versionVMs).map((vm: any) => ({ id: vm.id, label: vm.name || vm.hostname || String(vm.id) }));
  const currentNdItems: RelationshipItem[] = toArray(versionNDs).map((nd: any) => ({ id: nd.id, label: nd.name || nd.hostname || String(nd.id) }));

  const handleSubmit = async () => {
    await updateVersion({
      id: version.id,
      software_id: softwareId,
      version: form.version,
      build_number: form.build_number,
      release_date: formatDate(form.release_date),
      end_of_life_date: formatDate(form.end_of_life_date),
      end_of_support_date: formatDate(form.end_of_support_date),
    } as any);
  };

  return (
    <React.Fragment>
      <Card p="md" withBorder>
        <Stack gap="lg">
          <Group gap={2} justify="space-between" style={{ width: '100%' }}>
            <div></div>
            <Group >
                <Title order={4}>{t('modals.version_details')}</Title> <Badge variant="light" size="sm">{version.version}</Badge>
            </Group>
            <ActionIcon color="red" variant="light" size="sm" onClick={() => setSelectedVersion(null)}>
              <IconX size={16} />
            </ActionIcon>
          </Group>

          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Version"
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
                  value={form.release_date}
                  onChange={(val) => setForm((f) => ({ ...f, release_date: val as Date | null }))}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DatePickerInput
                  label="End of life date"
                  value={form.end_of_life_date}
                  onChange={(val) => setForm((f) => ({ ...f, end_of_life_date: val as Date | null }))}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DatePickerInput
                  label="End of support date"
                  value={form.end_of_support_date}
                  onChange={(val) => setForm((f) => ({ ...f, end_of_support_date: val as Date | null }))}
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end">
              <Button loading={isLoading} onClick={handleSubmit}>{t('common.save')}</Button>
            </Group>
          </Stack>

          {/* Relationships */}
          <Divider my="sm" />
          <Tabs variant="pills" keepMounted={false} defaultValue="computers">
            <Tabs.List>
              <Tabs.Tab value="computers">{t('assets.computers')}</Tabs.Tab>
              <Tabs.Tab value="virtual-machines">{t('assets.virtualMachines')}</Tabs.Tab>
              <Tabs.Tab value="network-devices">{t('assets.networkDevices')}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="computers" pt="md">
              <RelationshipWidget
                title={t('assets.computers')}
                currentItems={currentComputerItems}
                availableItems={(computersData?.data ?? []).map((c:any)=>({ id: c.id, label: c.name || c.hostname || String(c.id) }))}
                onAdd={async (ids) => {
                  await Promise.all(ids.map((id)=>attachVC.mutate({ versionId: version.id, computerId: Number(id) })));
                }}
                onRemove={async (id) => { await detachVC.mutate({ versionId: version.id, computerId: Number(id) }); }}
                loading={attachVC.isLoading || detachVC.isLoading || vcLoading}
                searchValue={computerSearch}
                onSearchChange={setComputerSearch}
                optionsLoading={computersLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="virtual-machines" pt="md">
              <RelationshipWidget
                title={t('assets.virtualMachines')}
                currentItems={currentVmItems}
                availableItems={(vmsData?.data ?? []).map((vm:any)=>({ id: vm.id, label: vm.name || vm.hostname || String(vm.id) }))}
                onAdd={async (ids) => { await Promise.all(ids.map((id)=>attachVVM.mutate({ versionId: version.id, virtualMachineId: Number(id) }))); }}
                onRemove={async (id) => { await detachVVM.mutate({ versionId: version.id, virtualMachineId: Number(id) }); }}
                loading={attachVVM.isLoading || detachVVM.isLoading || vvmLoading}
                searchValue={vmSearch}
                onSearchChange={setVmSearch}
                optionsLoading={vmsLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="network-devices" pt="md">
              <RelationshipWidget
                title={t('assets.networkDevices')}
                currentItems={currentNdItems}
                availableItems={(ndsData?.data ?? []).map((nd:any)=>({ id: nd.id, label: nd.name || nd.hostname || String(nd.id) }))}
                onAdd={async (ids) => { await Promise.all(ids.map((id)=>attachVND.mutate({ versionId: version.id, networkDeviceId: Number(id) }))); }}
                onRemove={async (id) => { await detachVND.mutate({ versionId: version.id, networkDeviceId: Number(id) }); }}
                loading={attachVND.isLoading || detachVND.isLoading || vndLoading}
                searchValue={ndSearch}
                onSearchChange={setNdSearch}
                optionsLoading={ndsLoading}
              />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Card>
    </React.Fragment>
  )
}

export default SoftwareVersionDetails