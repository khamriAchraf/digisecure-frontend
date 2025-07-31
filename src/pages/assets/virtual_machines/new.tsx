import { Container, Title, Stack, Group, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import DynamicForm from '../../../../components/DynamicForm';
import { useCreateVirtualMachine } from '../../../../src/mutations';
import React from 'react';
import Head from 'next/head';
  
export default function CreateVirtualMachinePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const createVirtualMachineMutation = useCreateVirtualMachine({
    onSuccess: (vm) => {
      console.log('Virtual Machine created successfully:', vm);
      router.push('/assets/virtual_machines');
    },
    onError: (error) => {
      console.error('Error creating virtual machine:', error);
      alert(`Failed to create virtual machine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleBack = () => {
    router.push('/assets/virtual_machines');
  };

  const handleSubmit = async (values: Record<string, any>) => {
    // Clean up form values - convert empty strings to null for optional fields
    const cleanValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    // Prepare the request body according to the API specification
    // Only include fields that are in the create VM schema
    const requestBody = {
      name: cleanValues.name,
      serial_number: cleanValues.serial_number || null,
      inventory_number: cleanValues.inventory_number || null,
      manufacturer_id: cleanValues.manufacturer_id ? parseInt(cleanValues.manufacturer_id, 10) : null,
      status: cleanValues.status,
      purchase_date: cleanValues.purchase_date || null,
      warranty_expiry: cleanValues.warranty_expiry || null,
      location_id: cleanValues.location_id ? parseInt(cleanValues.location_id, 10) : null,
      group_ids: cleanValues.group_ids || null,
      assigned_to: cleanValues.assigned_to ? parseInt(cleanValues.assigned_to, 10) : null,
      hypervisor_type: cleanValues.hypervisor_type || null,
      hypervisor_version: cleanValues.hypervisor_version || null,
      vm_platform: cleanValues.vm_platform || null,
      cpu_cores: cleanValues.cpu_cores ? parseInt(cleanValues.cpu_cores, 10) : null,
      memory_mb: cleanValues.memory_mb ? parseInt(cleanValues.memory_mb, 10) : null,
      storage_gb: cleanValues.storage_gb ? parseInt(cleanValues.storage_gb, 10) : null,
      os_type: cleanValues.os_type || null,
      os_version: cleanValues.os_version || null,
      os_architecture: cleanValues.os_architecture || null,
      ip_address: cleanValues.ip_address || null,
      mac_address: cleanValues.mac_address || null,
      network_segment: cleanValues.network_segment || null,
      vlan_id: cleanValues.vlan_id || null,
      pci_scope: cleanValues.pci_scope || null,
      cardholder_data_environment: cleanValues.cardholder_data_environment || null,
      encryption_status: cleanValues.encryption_status || null,
      encryption_type: cleanValues.encryption_type || null,
      backup_encryption: cleanValues.backup_encryption || null,
      admin_access_restricted: cleanValues.admin_access_restricted || null,
      multi_factor_auth_enabled: cleanValues.multi_factor_auth_enabled || null,
      logging_enabled: cleanValues.logging_enabled || null,
      monitoring_tool: cleanValues.monitoring_tool || null,
      last_patch_date: cleanValues.last_patch_date || null,
      patch_level: cleanValues.patch_level || null,
      vulnerability_scan_date: cleanValues.vulnerability_scan_date || null,
      vulnerability_status: cleanValues.vulnerability_status || null,
      backup_frequency: cleanValues.backup_frequency || null,
      last_backup_date: cleanValues.last_backup_date || null,
      backup_retention_days: cleanValues.backup_retention_days ? parseInt(cleanValues.backup_retention_days, 10) : null,
      disaster_recovery_plan: cleanValues.disaster_recovery_plan || null,
      isolation_level: cleanValues.isolation_level || null,
      resource_isolation: cleanValues.resource_isolation || null,
      network_isolation: cleanValues.network_isolation || null,
      storage_isolation: cleanValues.storage_isolation || null,
      pci_assessment_date: cleanValues.pci_assessment_date || null,
      pci_compliance_status: cleanValues.pci_compliance_status || null,
      next_assessment_date: cleanValues.next_assessment_date || null,
      compliance_notes: cleanValues.compliance_notes || null,
      power_state: cleanValues.power_state || null,
      creation_date: cleanValues.creation_date || null,
      scheduled_decommission_date: cleanValues.scheduled_decommission_date || null,
      cpu_allocation_percent: cleanValues.cpu_allocation_percent ? parseInt(cleanValues.cpu_allocation_percent, 10) : null,
      memory_allocation_percent: cleanValues.memory_allocation_percent ? parseInt(cleanValues.memory_allocation_percent, 10) : null,
      storage_allocation_percent: cleanValues.storage_allocation_percent ? parseInt(cleanValues.storage_allocation_percent, 10) : null,
      ha_enabled: cleanValues.ha_enabled || null,
      redundancy_level: cleanValues.redundancy_level || null,
      failover_capability: cleanValues.failover_capability || null,
    };

    // Use the mutation hook
    await createVirtualMachineMutation.mutate(requestBody);
  };

  return (
    <React.Fragment>
      <Head>
        <title>{t('forms.virtual_machine.create.title')} - Digi Secure</title>
      </Head>
    <Container size="xl" py="md">
      <Stack>
        {/* Header */}
        <Group align="center">
          <ActionIcon
            variant="light"
            onClick={handleBack}
            aria-label={t('common.back')}
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{t("forms.virtual_machine.create.title")}</Title>
        </Group>

        {/* Dynamic Form */}
        <DynamicForm
          resourceType="virtual_machine"
          onSubmit={handleSubmit}
          isSubmitting={createVirtualMachineMutation.isLoading}
        />
      </Stack>
    </Container>
    </React.Fragment>
  );
} 