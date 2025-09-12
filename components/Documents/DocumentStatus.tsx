import React from 'react';
import { Badge } from '@mantine/core';
import { t } from '../../i18n';

export type DocumentReviewStatus = 'Draft' | 'Approved' | 'Rejected' | 'Pending review';

interface DocumentStatusProps {
  status: DocumentReviewStatus | string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const statusToColor: Record<DocumentReviewStatus, string> = {
  Draft: 'gray',
  'Pending review': 'yellow',
  Approved: 'green',
  Rejected: 'red',
};

export const DocumentStatus: React.FC<DocumentStatusProps> = ({ status, size = 'xs' }) => {
  const normalized = (status ?? 'Draft') as DocumentReviewStatus;
  const color = statusToColor[normalized] ?? 'gray';
  const labelKey = `forms.documents.status.${normalized}`;

  return (
    <Badge size={size} color={color} variant="light">
      {t(labelKey)}
    </Badge>
  );
};

export default DocumentStatus;


