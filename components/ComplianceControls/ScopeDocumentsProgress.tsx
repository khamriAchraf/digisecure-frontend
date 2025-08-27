import React, { useMemo } from 'react';
import { Group, Progress, Stack, Text, Badge } from '@mantine/core';
import { useScopeControls } from '../../src/fetchers';
import { t } from '../../i18n';

interface ScopeDocumentsProgressProps {
  scopeId: number | string;
}

const ScopeDocumentsProgress: React.FC<ScopeDocumentsProgressProps> = ({ scopeId }) => {
  const { data: controls, isLoading } = useScopeControls(scopeId);

  const { total, withDocs, percent } = useMemo(() => {
    const list = controls ?? [];
    const totalCount = list.length;
    const withDocuments = list.filter((c) => {
      const count = (c as any).document_count as number | undefined;
      if (typeof count === 'number') return count > 0;
      const docs = (c as any).documents as any[] | undefined;
      return Array.isArray(docs) && docs.length > 0;
    }).length;
    const pct = totalCount > 0 ? Math.round((withDocuments / totalCount) * 100) : 0;
    return { total: totalCount, withDocs: withDocuments, percent: pct };
  }, [controls]);

  return (
    <React.Fragment>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>{t('compliance.documentsCoverage')}</Text>
          <Badge variant="light" size="sm" color={withDocs > 0 ? 'green' : 'red'}>
            {withDocs}/{total}
          </Badge>
        </Group>
        <Progress value={isLoading ? 0 : percent} size="md" striped={isLoading} animated={isLoading}>
          {/* Mantine v7 Progress supports label via sibling; show below for compatibility */}
        </Progress>
      </Stack>
    </React.Fragment>
  );
};

export default ScopeDocumentsProgress;


