import { PERMISSIONS, useHasPermission } from '@/hooks/usePermissions';
import { Button, Group, Table, Checkbox, Menu, ActionIcon, TextInput, LoadingOverlay, Loader } from '@mantine/core';
import { IconChevronDown, IconDotsVertical, IconRestore, IconSearch, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useState, useMemo } from 'react';

interface RecycleBinTableProps {
    data: any;
    isLoading: boolean;
    isError: boolean;
    mutate: () => void;
    dataType: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
}

const RecycleBinTable = ({ data, isLoading, isError, mutate, dataType, searchQuery, setSearchQuery, currentPage, setCurrentPage, pageSize, setPageSize }: RecycleBinTableProps) => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const canRestore = useHasPermission(PERMISSIONS.RECYCLE_BIN_USER_RESTORE);
    const canPurge = useHasPermission(PERMISSIONS.RECYCLE_BIN_USER_PURGE);
    const seeActions = canRestore || canPurge;

    // Reset selection if data changes
    useEffect(() => {
        setSelectedRows([]);
    }, [data]);

    const items = data?.data || [];

    const allSelected = items.length > 0 && selectedRows.length === items.length;
    const someSelected = selectedRows.length > 0 && selectedRows.length < items.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(items);
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (item: any, checked: boolean) => {
        if (checked) {
            setSelectedRows((prev) => [...prev, item]);
        } else {
            setSelectedRows((prev) => prev.filter((row) => row.id !== item.id));
        }
    };

    const handleRestore = () => {
        // Implement restore logic here
        alert(`Restore item`);
    };

    const handlePurge = () => {
        // Implement purge logic here
        alert(`Purge item`);
    };

    // Dummy handlers for Restore/Purge actions
    const handleRestoreAll = () => {
        // Implement bulk restore logic here
        alert(`Restore ${selectedRows.length} items`);
    };

    const handlePurgeAll = () => {
        // Implement bulk purge logic here
        alert(`Purge ${selectedRows.length} items`);
    };

    return (
        <React.Fragment>
            <Group mb="sm" justify="space-between">
                <TextInput
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    leftSection={<IconSearch size={16} />}
                    size="sm"
                />
                    <Menu withinPortal>
                        <Menu.Target>
                            <Button
                                leftSection={<IconChevronDown size={16} />}
                                variant="filled"
                                disabled={selectedRows.length < 2}
                            >
                                Bulk Actions ({selectedRows.length})
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item onClick={handleRestoreAll} leftSection={<IconRestore size={16} />}>Restore All</Menu.Item>
                            <Menu.Item color="red" onClick={handlePurgeAll} leftSection={<IconTrash size={16} />}>Purge All</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
            </Group>
            {isLoading ? (
                <Loader />
            ) : (
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ width: 40 }}>
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                                disabled={items.length === 0}
                                aria-label="Select all rows"
                            />
                        </Table.Th>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Created At</Table.Th>
                        <Table.Th>Deleted At</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map((item: any) => (
                        <Table.Tr key={item.id}>
                            <Table.Td>
                                <Checkbox
                                    checked={selectedRows.some((row) => row.id === item.id)}
                                    onChange={(e) => handleSelectRow(item, e.currentTarget.checked)}
                                    aria-label={`Select row ${item.id}`}
                                />
                            </Table.Td>
                            <Table.Td>{item.id}</Table.Td>
                            <Table.Td>{item.name}</Table.Td>
                            <Table.Td>{item.email}</Table.Td>
                            <Table.Td>{item.created_at}</Table.Td>
                            <Table.Td>{item.deleted_at}</Table.Td>
                            <Table.Td>
                                {seeActions && (
                                    <Menu>
                                        <Menu.Target>
                                            <ActionIcon variant="light" size="sm" onClick={(e) => e.stopPropagation()}>
                                                <IconDotsVertical size={14} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {canRestore && <Menu.Item onClick={handleRestore} leftSection={<IconRestore size={16} />}>Restore</Menu.Item>}
                                            {canPurge && <Menu.Item color="red" onClick={handlePurge} leftSection={<IconTrash size={16} />}>Purge</Menu.Item>}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Table.Td>
                        </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </React.Fragment>
    );
};

export default RecycleBinTable;