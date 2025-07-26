import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Group,
  MultiSelect,
  Stack,
  Table,
  Text,
  ActionIcon,
  Loader,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '../src/hooks/useTranslation';

export interface RelationshipItem {
  id: string | number;
  label: string;
  // Additional dynamic fields can be stored here, but only `id` and `label` are required
  [key: string]: any;
}

export interface RelationshipWidgetProps {
  /**
   * Title shown at the top of the widget (e.g. "Groups", "Users", ...)
   */
  title: string;
  /**
   * Items currently assigned to the parent resource
   */
  currentItems: RelationshipItem[];
  /**
   * All selectable items (including the ones already assigned). If you want the widget to look up
   * the remaining choices remotely you can pass a subset and update it from the outside.
   */
  availableItems: RelationshipItem[];
  /**
   * Triggered when the user adds one or multiple items. Receive their ids.
   */
  onAdd: (itemIds: (string | number)[]) => void | Promise<void>;
  /**
   * Triggered when the user removes an item from their relationships.
   */
  onRemove: (itemId: string | number) => void | Promise<void>;
  /** Show loading indicator while external data is being fetched / mutated */
  loading?: boolean;
  /** When true the add input is rendered as disabled */
  disableAdd?: boolean;
  /** When true the list is rendered as read-only (no trash icon) */
  readOnly?: boolean;
  /**
   * The current search value for the available items MultiSelect (controlled from parent)
   */
  searchValue?: string;
  /**
   * Callback to update the search value (controlled from parent)
   */
  onSearchChange?: (value: string) => void;
  /** Show loading indicator for the available items MultiSelect */
  optionsLoading?: boolean;
}

const RelationshipWidget: React.FC<RelationshipWidgetProps> = ({
  title,
  currentItems,
  availableItems,
  onAdd,
  onRemove,
  loading = false,
  disableAdd = false,
  readOnly = false,
  searchValue,
  onSearchChange,
  optionsLoading,
}) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [dropdownOpened, setDropdownOpened] = useState(false);

  // Filter options so the dropdown only shows items not yet assigned
  const selectableOptions = useMemo(() => {
    const currentIds = new Set(currentItems.map((item) => String(item.id)));
    return availableItems
      .filter((item) => !currentIds.has(String(item.id)))
      .map((item) => ({ value: String(item.id), label: item.label }))
  }, [availableItems, currentItems]);

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    await onAdd(selectedIds);
    setSelectedIds([]);
  };

  const handleRemove = async (id: string | number) => {
    await onRemove(id);
  };

  const rightSection = optionsLoading ? <Loader size="xs" /> : undefined;

  return (
    <Box>
      <Text fw={600} mb="xs">
        {title}
      </Text>

      {/* Add relationship section */}
      {!readOnly &&  (
        <Stack gap="xs" mb="sm">
          <Group wrap="nowrap" align="flex-end">
            <MultiSelect
              data={selectableOptions}
              placeholder={t('relationshipWidget.selectPlaceholder', {
                item: title.toLowerCase(),
              })}
              searchable
              value={selectedIds.map(String)}
              onChange={(values) => setSelectedIds(values)}
              disabled={disableAdd}
              clearable
              flex={1}
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              dropdownOpened={dropdownOpened}
              onDropdownOpen={() => setDropdownOpened(true)}
              onDropdownClose={() => setDropdownOpened(false)}
              rightSection={rightSection}
              rightSectionPointerEvents="none"
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAdd}
              disabled={disableAdd || selectedIds.length === 0}
            >
              {t('common.add')}
            </Button>
          </Group>
        </Stack>
      )}

      {/* Current relationships table */}
      <Box>
        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : currentItems.length === 0 ? (
          <Text c="dimmed">
            {t('relationshipWidget.emptyMessage', { item: title.toLowerCase() })}
          </Text>
        ) : (
          <Table striped withTableBorder withColumnBorders>
            <Table.Tbody>
              {currentItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.label}</Table.Td>
                  {!readOnly && (
                    <Table.Td w={50} ta="center">
                      <ActionIcon
                        variant="light"
                        color="red"
                        aria-label={t('common.remove')}
                        onClick={() => handleRemove(item.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default RelationshipWidget; 