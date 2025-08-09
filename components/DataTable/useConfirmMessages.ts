import { DataType } from './config';

interface DeleteConfirmKeys {
  deleteTitleKey: string;
  deleteMessageKey: string;
  confirmKey: string;
  cancelKey: string;
}

/**
 * Returns translation keys for confirmation modals based on the provided data type.
 * Keeps messaging external to the table so the component remains generic.
 */
export function useConfirmMessages(dataType: DataType): DeleteConfirmKeys {
  const mapping: Partial<Record<DataType, { titleKey: string; messageKey: string }>> = {
    users: { titleKey: 'confirm.delete.users.title', messageKey: 'confirm.delete.users.message' },
    roles: { titleKey: 'confirm.delete.roles.title', messageKey: 'confirm.delete.roles.message' },
    groups: { titleKey: 'confirm.delete.groups.title', messageKey: 'confirm.delete.groups.message' },
    network_devices: {
      titleKey: 'confirm.delete.network_devices.title',
      messageKey: 'confirm.delete.network_devices.message',
    },
    computers: { titleKey: 'confirm.delete.computers.title', messageKey: 'confirm.delete.computers.message' },
    software: { titleKey: 'confirm.delete.software.title', messageKey: 'confirm.delete.software.message' },
    virtual_machines: {
      titleKey: 'confirm.delete.virtual_machines.title',
      messageKey: 'confirm.delete.virtual_machines.message',
    },
    asset_types: { titleKey: 'confirm.delete.asset_types.title', messageKey: 'confirm.delete.asset_types.message' },
    manufacturers: {
      titleKey: 'confirm.delete.manufacturers.title',
      messageKey: 'confirm.delete.manufacturers.message',
    },
    locations: { titleKey: 'confirm.delete.locations.title', messageKey: 'confirm.delete.locations.message' },
  };

  const fallback = { titleKey: 'confirm.delete.default.title', messageKey: 'confirm.delete.default.message' };
  const { titleKey, messageKey } = mapping[dataType] ?? fallback;

  return {
    deleteTitleKey: titleKey,
    deleteMessageKey: messageKey,
    // Use common keys for actions to preserve consistency
    confirmKey: 'common.delete',
    cancelKey: 'common.cancel',
  };
}


