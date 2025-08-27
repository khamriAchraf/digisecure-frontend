import { useScopeControls } from '@/fetchers';
import React, { useState } from 'react'
import ComplianceDocumentCard from './ComplianceDocumentCard';
import { Group, Title, Stack, Button, TextInput, Grid } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import ComplianceDocumentDetails from './ComplianceDocumentDetails';
import { ComplianceScopeControl } from '../../types/models';
import ScopeDocumentsProgress from './ScopeDocumentsProgress';

interface ComplianceControlsProps {
  scopeId: number;
}

const ComplianceControls: React.FC<ComplianceControlsProps> = ({ scopeId }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControl, setSelectedControl] = useState<ComplianceScopeControl | null>(null);
  const { data: controls, isLoading, isError } = useScopeControls(scopeId);
  console.log(controls);

  return (
    <React.Fragment>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); }}
          leftSection={<IconSearch size={16} />}
          style={{ width: 320 }}
          size="sm"
        />
        <ScopeDocumentsProgress scopeId={scopeId} />
      </Group>
      <Grid gutter="md">
        <Grid.Col span={4}>
          <Stack gap="md">
            {controls?.map((control) => (
              <ComplianceDocumentCard
                key={control.id}
                control={control}
                searchQuery={searchQuery}
                setSelectedControl={setSelectedControl}
                selected={selectedControl?.id === control.id}
              />
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={8}>
          {selectedControl && <ComplianceDocumentDetails control={selectedControl} setSelectedControl={setSelectedControl} />}
        </Grid.Col>
      </Grid>
    </React.Fragment>
  );
}

export default ComplianceControls