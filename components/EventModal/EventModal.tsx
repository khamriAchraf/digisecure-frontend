import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Checkbox,
  NumberInput,
  Grid,
  Select,
  Tabs,
  Divider,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { ComplianceScopeEvent } from '../../types/models';
import { useAddgroupToEvent, useAddUserToEvent, useRemovegroupFromEvent, useRemoveUserFromEvent, useUpdateComplianceEvent } from '@/mutations';
import { PERMISSIONS, useHasPermission } from '@/hooks/usePermissions';
import { useTranslation } from '@/hooks/useTranslation';
import { toISODateString, calculateNextDueDate } from '../../types/utils';
import RelationshipWidget from '../RelationshipWidget';
import { useEvent, useGroups, useUsers } from '@/fetchers';
import { User } from 'next-auth';
import { on } from 'events';

interface EventModalProps {
  opened: boolean;
  onClose: () => void;
  eventId: any;
  scopeId: number;
  onSuccess?: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  opened,
  onClose,
  eventId,
  scopeId,
  onSuccess,
}) => {

  const [userSearch, setuserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState(userSearch);
  useEffect(() => { const h = setTimeout(() => setDebouncedUserSearch(userSearch), 300); return () => clearTimeout(h); }, [userSearch]);

  const [groupSearch, setgroupSearch] = useState('');
  const [debouncedGroupSearch, setDebouncedGroupSearch] = useState(userSearch);
  useEffect(() => { const h = setTimeout(() => setDebouncedGroupSearch(groupSearch), 300); return () => clearTimeout(h); }, [groupSearch]);


  const { data: event, isLoading: eventLoading, mutate } = useEvent(eventId);
  const { data: usersData, isLoading: userLoading } = useUsers({ page: 1, per_page: 9999, search: debouncedUserSearch });
  const { data: groupsData, isLoading: groupLoading } = useGroups({ page: 1, per_page: 9999, search: debouncedGroupSearch });



  const { t } = useTranslation();
  const hasUpdatePermission = useHasPermission(PERMISSIONS.COMPLIANCE_EVENT_UPDATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prevValuesRef = useRef<{ lastDoneDate: Date | null; frequency: string }>({ lastDoneDate: null, frequency: '' });

  const updateMutation = useUpdateComplianceEvent({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      console.error('Failed to update event:', error);
    },
  });

  const frequencyOptions = [
    { value: 'Daily', label: t('forms.events.frequencies.daily') },
    { value: 'Weekly', label: t('forms.events.frequencies.weekly') },
    { value: 'Bi-weekly', label: t('forms.events.frequencies.biweekly') },
    { value: 'Monthly', label: t('forms.events.frequencies.monthly') },
    { value: 'Quarterly', label: t('forms.events.frequencies.quarterly') },
    { value: 'Semi-annual', label: t('forms.events.frequencies.semiannual') },
    { value: 'Yearly', label: t('forms.events.frequencies.yearly') },
  ];

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      frequency: '',
      next_due_date: null as Date | null,
      last_done_date: null as Date | null,
      notify: false,
      remind_before_days: 0,
      notes: '',
    },
    validate: {
      name: (value) => (!value?.trim() ? t('forms.errors.required') : null),
    },
  });

  useEffect(() => {
    if (opened && event) {
      const lastDoneDate = event.last_done_date ? new Date(event.last_done_date) : null;
      const frequency = event.frequency || '';

      form.setValues({
        name: event.name || '',
        description: event.description || '',
        frequency,
        next_due_date: event.next_due_date ? new Date(event.next_due_date) : null,
        last_done_date: lastDoneDate,
        notify: event.notify ?? false,
        remind_before_days: event.remind_before_days ?? 0,
        notes: event.notes || '',
      });

      prevValuesRef.current = {
        lastDoneDate,
        frequency,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, event]);

  // Auto-calculate next due date when last done date or frequency changes
  useEffect(() => {
    if (!opened) return;

    const lastDoneDate = form.values.last_done_date;
    const frequency = form.values.frequency;

    // Safely get timestamps, handling null/undefined cases
    const getCurrentTimestamp = (date: Date | null | undefined): number | null => {
      return date instanceof Date ? date.getTime() : null;
    };

    const lastDoneDateTimestamp = getCurrentTimestamp(lastDoneDate);
    const prevLastDoneDateTimestamp = getCurrentTimestamp(prevValuesRef.current.lastDoneDate);

    // Check if values actually changed
    const lastDoneDateChanged = lastDoneDateTimestamp !== prevLastDoneDateTimestamp;
    const frequencyChanged = frequency !== prevValuesRef.current.frequency;

    if ((lastDoneDateChanged || frequencyChanged) && lastDoneDate && frequency) {
      const calculatedNextDueDate = calculateNextDueDate(lastDoneDate, frequency);
      if (calculatedNextDueDate) {
        const currentNextDueDate = form.values.next_due_date;
        // Only update if the calculated date is different
        const currentNextDueDateTimestamp = getCurrentTimestamp(currentNextDueDate);
        const calculatedTimestamp = calculatedNextDueDate.getTime();

        if (currentNextDueDateTimestamp !== calculatedTimestamp) {
          form.setFieldValue('next_due_date', calculatedNextDueDate);
        }
      }
    }

    // Update ref with current values
    prevValuesRef.current = {
      lastDoneDate,
      frequency: frequency || '',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.last_done_date, form.values.frequency, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!event || !hasUpdatePermission) return;

    setIsSubmitting(true);
    try {
      const changedData: any = {};

      if (values.name !== event.name) changedData.name = values.name;
      if (values.description !== event.description) changedData.description = values.description || null;
      if (values.frequency !== event.frequency) changedData.frequency = values.frequency || null;
      if (values.notify !== event.notify) changedData.notify = values.notify;
      if (values.remind_before_days !== event.remind_before_days) changedData.remind_before_days = values.remind_before_days;
      if (values.notes !== event.notes) changedData.notes = values.notes || null;

      const nextDueDateStr = toISODateString(values.next_due_date);
      const eventNextDueDate = toISODateString(event.next_due_date);
      if (nextDueDateStr !== eventNextDueDate) changedData.next_due_date = nextDueDateStr;

      const lastDoneDateStr = toISODateString(values.last_done_date);
      const eventLastDoneDate = toISODateString(event.last_done_date);
      if (lastDoneDateStr !== eventLastDoneDate) changedData.last_done_date = lastDoneDateStr;

      if (Object.keys(changedData).length > 0) {
        await updateMutation.mutate({
          scopeId,
          eventId: event.id,
          data: changedData,
        });
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const addUserMutation = useAddUserToEvent({ onSuccess: mutate });
  const removeUserMutation = useRemoveUserFromEvent({ onSuccess: mutate });

  const addGroupMutation = useAddgroupToEvent({ onSuccess: mutate });
  const removeGroupMutation = useRemovegroupFromEvent({ onSuccess: mutate });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('modals.editEvent')}
      size="lg"
      centered
    >
      <Tabs defaultValue="general">
        <Tabs.List>
          <Tabs.Tab value="general">
            {t('forms.tabs.general')}
          </Tabs.Tab>
          <Tabs.Tab value="notifications">
            {t('modals.notifications')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="notifications" pt="md">
          <RelationshipWidget
            title={t('administration.users')}
            currentItems={event?.notify_users?.map((user) => ({ id: user.id, label: user.username || user.full_name || user.email })) || []}
            availableItems={usersData ? usersData.data.map((user) => ({ id: user.id, label: user.username || user.full_name || user.email })) : []}
            loading={eventLoading}
            onAdd={async (ids) => {
              await Promise.all(ids.map((id) => addUserMutation.mutate({ eventId: eventId, userId: Number(id) })));
            }}
            onRemove={async (id) => {
              await removeUserMutation.mutate({ eventId: eventId, userId: Number(id) });
            }}
            searchValue={userSearch}
            onSearchChange={setuserSearch}
            optionsLoading={userLoading}
          />
          <Divider my="md" />
          <RelationshipWidget
            title={t('administration.groups')}
            currentItems={event?.notify_groups?.map((group) => ({
              id: group.id,
              label: group.name,
            })) || []}
            availableItems={groupsData ? groupsData.data.map((group) => ({
              id: group.id,
              label: group.name,
            })) : []}
            loading={eventLoading}
            onAdd={async (ids) => {
              await Promise.all(ids.map((id) => addGroupMutation.mutate({ eventId: eventId, groupId: Number(id) })));
            }}
            onRemove={async (id) => {
              await removeGroupMutation.mutate({ eventId: eventId, groupId: Number(id) });
            }}
            searchValue={groupSearch}
            onSearchChange={setgroupSearch}
            optionsLoading={groupLoading}
          />
        </Tabs.Panel>

        <Tabs.Panel value="general">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label={t('forms.events.name')}
                    placeholder={t('forms.events.namePlaceholder')}
                    {...form.getInputProps('name')}
                    disabled={!hasUpdatePermission}
                    required
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label={t('forms.events.frequency')}
                    placeholder={t('forms.events.frequencyPlaceholder')}
                    data={frequencyOptions}
                    {...form.getInputProps('frequency')}
                    disabled={!hasUpdatePermission}
                    clearable
                    searchable
                  />
                </Grid.Col>

                <Grid.Col span={12}>
                  <Textarea
                    label={t('forms.events.description')}
                    placeholder={t('forms.events.descriptionPlaceholder')}
                    minRows={3}
                    {...form.getInputProps('description')}
                    disabled={!hasUpdatePermission}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <DatePickerInput
                    label={t('forms.events.nextDueDate')}
                    placeholder={t('forms.events.nextDueDatePlaceholder')}
                    {...form.getInputProps('next_due_date')}
                    disabled={!hasUpdatePermission}
                    clearable
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <DatePickerInput
                    label={t('forms.events.lastDoneDate')}
                    placeholder={t('forms.events.lastDoneDatePlaceholder')}
                    {...form.getInputProps('last_done_date')}
                    disabled={!hasUpdatePermission}
                    clearable
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Checkbox
                    label={t('forms.events.notify')}
                    {...form.getInputProps('notify', { type: 'checkbox' })}
                    disabled={!hasUpdatePermission}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label={t('forms.events.remindBeforeDays')}
                    placeholder="0"
                    {...form.getInputProps('remind_before_days')}
                    disabled={!hasUpdatePermission || !form.values.notify}
                    min={0}
                    max={365}
                  />
                </Grid.Col>

                <Grid.Col span={12}>
                  <Textarea
                    label={t('forms.events.notes')}
                    placeholder={t('forms.events.notesPlaceholder')}
                    minRows={2}
                    {...form.getInputProps('notes')}
                    disabled={!hasUpdatePermission}
                  />
                </Grid.Col>
              </Grid>

              <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={onClose} disabled={isSubmitting}>
                  {t('common.cancel')}
                </Button>
                {hasUpdatePermission && (
                  <Button type="submit" loading={isSubmitting}>
                    {t('common.save')}
                  </Button>
                )}
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

      </Tabs>
    </Modal>
  );
};

export default EventModal;

