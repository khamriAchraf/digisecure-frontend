import React, { useMemo } from 'react';
import { Group, Progress, Stack, Text, Badge } from '@mantine/core';
import { useScopeAssets } from '../src/fetchers';
import { t } from '../i18n';

interface ScopeAssetsProgressProps {
  scopeId: number | string;
}

const ScopeAssetsProgress: React.FC<ScopeAssetsProgressProps> = ({ scopeId }) => {
  const { data: assets, isLoading } = useScopeAssets(scopeId);

  const { total, compliantCount, percent } = useMemo(() => {
    const list = assets?.data ?? [];
    const totalCount = list.length;
    const compliantCount = list.filter((a) => a.compliant).length;
    const pct = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;
    return { total: totalCount, compliantCount, percent: pct };
  }, [assets]);

  return (
    <React.Fragment>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>{t('compliance.assetsCoverage')}</Text>
          <Badge variant="light" size="sm" color={compliantCount > 0 ? 'green' : 'red'}>
            {compliantCount}/{total}
          </Badge>
        </Group>
        <Progress value={isLoading ? 0 : percent} size="md" striped={isLoading} animated={isLoading}>
          {/* Mantine v7 Progress supports label via sibling; show below for compatibility */}
        </Progress>
      </Stack>
    </React.Fragment>
  );
};

export default ScopeAssetsProgress;


