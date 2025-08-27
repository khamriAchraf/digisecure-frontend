import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    ActionIcon,
    Badge,
    Box,
    Container,
    Group,
    LoadingOverlay,
    Pagination,
    Paper,
    Select,
    Tabs,
    Table,
    Text,
    TextInput,
    Title,
    Button,
    useMantineTheme,
    Skeleton,
} from '@mantine/core';
import { IconArrowLeft, IconSearch, IconSortAscending, IconSortDescending, IconRefresh } from '@tabler/icons-react';
import { useComplianceScopes, useScopeAssets } from '../../fetchers';
import { t } from '../../../i18n';
import { BsStars } from "react-icons/bs";
import ComplianceControls from '../../../components/ComplianceControls/ComplianceControls';
import ScopeAssetsProgress from '../../../components/ScopeAssetsProgress';

// Mapping for asset type tabs
const TAB_CONFIGS = [
    { value: 'all', label: 'common.all', type: undefined },
    { value: 'computer', label: 'assets.computers', type: 'computer' },
    { value: 'virtual_machine', label: 'assets.virtual_machines', type: 'virtual_machine' },
    { value: 'network_device', label: 'assets.network_devices', type: 'network_device' },
    { value: 'software', label: 'assets.software', type: 'software' },
];

function ScopeAssetsTable({ scopeId, type }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const { data: paginated, isLoading, isError, mutate } = useScopeAssets(scopeId, {
        page: currentPage,
        per_page: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchQuery,
        type,
    });

    const items = paginated?.data || [];
    const totalItems = paginated?.total || 0;
    const totalPages = paginated?.total_pages || 1;

    const handleSort = useCallback((field) => {
        setSortOrder((prev) => (sortBy === field && prev === 'asc' ? 'desc' : 'asc'));
        setSortBy(field);
    }, [sortBy]);

    const renderSortIcon = (field) => {
        if (sortBy !== field) return <IconSortAscending size={16} style={{ opacity: 0.3 }} />;
        return sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />;
    };

    return (
        <Paper p="0">
            {isLoading && (
                <Box mb="md">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <Skeleton height={32} width={320} radius="sm" />
                        </Group>
                    </Group>
                    <Box style={{ overflow: 'auto' }}>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>
                                        <Group gap="xs" wrap="nowrap">
                                            <Skeleton height={16} width={80} />
                                        </Group>
                                    </Table.Th>
                                    <Table.Th>
                                        <Group gap="xs" wrap="nowrap">
                                            <Skeleton height={16} width={80} />
                                        </Group>
                                    </Table.Th>
                                    <Table.Th>
                                        <Group gap="xs" wrap="nowrap">
                                            <Skeleton height={16} width={100} />
                                        </Group>
                                    </Table.Th>
                                    <Table.Th>
                                        <Group gap="xs" wrap="nowrap">
                                            <Skeleton height={16} width={100} />
                                        </Group>
                                    </Table.Th>
                                    <Table.Th>
                                        <Group gap="xs" wrap="nowrap">
                                            <Skeleton height={16} width={100} />
                                        </Group>
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {[...Array(6)].map((_, idx) => (
                                    <Table.Tr key={idx}>
                                        <Table.Td>
                                            <Skeleton height={18} width="80%" />
                                        </Table.Td>
                                        <Table.Td>
                                            <Skeleton height={18} width="60%" />
                                        </Table.Td>
                                        <Table.Td>
                                            <Skeleton height={18} width={80} />
                                        </Table.Td>
                                        <Table.Td>
                                            <Skeleton height={18} width={100} />
                                        </Table.Td>
                                        <Table.Td>
                                            <Skeleton height={18} width={100} />
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Box>
                </Box>
            )}

            {!isLoading && (
                <React.Fragment>
                    <Group justify="space-between" mb="md">
                        <Group>
                            <TextInput
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                leftSection={<IconSearch size={16} />}
                                style={{ width: 320 }}
                                size="sm"
                            />


                        </Group>

                    </Group>

                    <Box style={{ overflow: 'auto' }}>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                        <Group gap="xs" wrap="nowrap">
                                            <Text size="sm" fw={500}>{t('datatable.name')}</Text>
                                            {renderSortIcon('name')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                                        <Group gap="xs" wrap="nowrap">
                                            <Text size="sm" fw={500}>{t('datatable.type')}</Text>
                                            {renderSortIcon('type')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th onClick={() => handleSort('compliant')} style={{ cursor: 'pointer' }}>
                                        <Group gap="xs" wrap="nowrap">
                                            <Text size="sm" fw={500}>{t('navigation.compliance')}</Text>
                                            {renderSortIcon('compliant')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th onClick={() => handleSort('last_review_date')} style={{ cursor: 'pointer' }}>
                                        <Group gap="xs" wrap="nowrap">
                                            <Text size="sm" fw={500}>{t('datatable.last_review')}</Text>
                                            {renderSortIcon('last_review_date')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th onClick={() => handleSort('next_review_date')} style={{ cursor: 'pointer' }}>
                                        <Group gap="xs" wrap="nowrap">
                                            <Text size="sm" fw={500}>{t('datatable.next_review')}</Text>
                                            {renderSortIcon('next_review_date')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th>
                                        <Text size="sm" fw={500}>Notes</Text>
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {items.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={6}>
                                            <Text ta="center" c="dimmed" py="xl">
                                                {isLoading ? 'Loading…' : 'No data found'}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    items.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td>{item.name}</Table.Td>
                                            <Table.Td>{item.type || 'N/A'}</Table.Td>
                                            <Table.Td>
                                                {item.compliant === null || item.compliant === undefined ? (
                                                    <Badge variant="light" color="gray">{t('common.na')}</Badge>
                                                ) : item.compliant ? (
                                                    <Badge variant="light" color="green">{t('datatable.compliant')}</Badge>
                                                ) : (
                                                    <Badge variant="light" color="red">{t('datatable.not_compliant')}</Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td>{item.last_review_date || '—'}</Table.Td>
                                            <Table.Td>{item.next_review_date || '—'}</Table.Td>
                                            <Table.Td>{item.compliance_notes || item.justification || '—'}</Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </Box></React.Fragment>
            )}

            <Group justify="space-between" mt="md">
                <Group>
                    <Select
                        label="Items per page"
                        value={String(pageSize)}
                        onChange={(val) => { setPageSize(parseInt(val || '20')); setCurrentPage(1); }}
                        data={[5, 10, 20, 50, 100].map((s) => ({ value: String(s), label: String(s) }))}
                        size="sm"
                        style={{ width: 140 }}
                    />
                    <Text size="sm" c="dimmed">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
                    </Text>
                </Group>

                {totalPages > 1 && (
                    <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} size="sm" />
                )}
            </Group>
        </Paper>
    );
}

const CompliancePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const idNum = useMemo(() => {
        if (!id) return null;
        return Array.isArray(id) ? Number(id[0]) : Number(id);
    }, [id]);

    const { data: allScopes, isLoading: scopesLoading } = useComplianceScopes();
    const [scope, setScope] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!allScopes || idNum == null || Number.isNaN(idNum)) return;
        const found = allScopes.find((s) => Number(s.id) === Number(idNum));
        if (found) setScope(found);
    }, [allScopes, idNum]);

    const handleBack = () => {
        router.push('/compliance');
    };

    const theme = useMantineTheme();

    return (
        <React.Fragment>
            <Head>
                <title>{scope?.name ? `${scope.name} - Digi Secure` : 'Compliance Scope - Digi Secure'}</title>
            </Head>
            <Container size="xl" py="md">
                <Group justify="space-between" mb="md">
                    <Group>
                        <ActionIcon variant="light" onClick={handleBack} aria-label={t('common.back')} size="lg">
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <Title order={2}>{scope?.name}</Title>
                    </Group>
                    <Button leftSection={<BsStars size={16} />} gradient={{ from: 'grape', to: theme.primaryColor, deg: 90 }} variant="gradient">
                        Run Compliance Check
                    </Button>
                </Group>

                <Tabs defaultValue="assets">
                    <Tabs.List style={{ marginBottom: '20px' }}>
                        <Tabs.Tab value="assets">{t('common.assets')}</Tabs.Tab>
                        <Tabs.Tab value="documents">{t('common.documents')}</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="assets">
                        <Group justify="space-between" mb="md">
                            <Title order={3}>{t('common.assetsWithinScope', { scope: scope?.name })}</Title>
                            <ScopeAssetsProgress scopeId={idNum} />
                        </Group>

                        <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false} orientation="vertical" variant="outline">
                            <Tabs.List style={{ marginRight: '20px' }}>
                                {TAB_CONFIGS.map((tab) => (
                                    <Tabs.Tab key={tab.value} value={tab.value}>{t(tab.label)}</Tabs.Tab>
                                ))}
                            </Tabs.List>

                            {TAB_CONFIGS.map((tab) => (
                                <Tabs.Panel key={tab.value} value={tab.value} pt="md">
                                    {idNum != null && (
                                        <ScopeAssetsTable scopeId={idNum} type={tab.type} />
                                    )}
                                </Tabs.Panel>
                            ))}
                        </Tabs>
                    </Tabs.Panel>
                    <Tabs.Panel value="documents">
                        {idNum != null && (
                            <ComplianceControls scopeId={idNum} />
                        )}
                    </Tabs.Panel>
                </Tabs>


            </Container>
        </React.Fragment>
    );
};

export default CompliancePage;