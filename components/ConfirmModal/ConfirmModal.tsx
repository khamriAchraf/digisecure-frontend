import React from 'react';
import { Modal, Stack, Text, Group, Button } from '@mantine/core';

export interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  size?: string;
  confirmColor?: string;
}

export function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
  size = 'sm',
  confirmColor = 'red',
}: ConfirmModalProps) {
  return (
    <Modal opened={opened} onClose={onCancel} title={title} size={size}>
      <Stack>
        <Text>{message}</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ConfirmModal;


