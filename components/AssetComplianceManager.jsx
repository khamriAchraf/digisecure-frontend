import React, { useMemo, useState, useCallback } from 'react';
import { Card, Group, Stack, Text, ThemeIcon, Button, SimpleGrid, Collapse, Tooltip, Anchor, Modal, MultiSelect, Loader, Badge, ActionIcon, Switch } from '@mantine/core';
import { useMantineTheme, useComputedColorScheme } from '@mantine/core';
import Link from 'next/link';
import { IconChevronDown, IconExternalLink, IconPlus, IconShieldCheck, IconCreditCard, IconScale, IconTrash } from '@tabler/icons-react';
import { useAllComplianceScopes, useAsset } from '@/fetchers';
import { useAddAssetToComplianceScope, useRemoveAssetFromComplianceScope, useUpdateAssetScopeCompliance } from '@/mutations';
import { PERMISSIONS, useHasPermission, useUserPermissions } from '@/hooks/usePermissions';

// Expects an assetId and fetches asset details internally
const getScopeIcon = (name) => {
    const normalized = (name || '').toLowerCase();
    if (normalized.includes('pci')) return IconCreditCard;
    if (normalized.includes('iso')) return IconShieldCheck;
    return IconScale;
};

const formatDate = (value) => {
    if (!value) return '—';
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString();
    } catch {
        return value;
    }
};

const AssetComplianceManager = ({ assetId, assetType }) => {
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const { data: allScopes, isLoading: scopesLoading } = useAllComplianceScopes();
    const { data: asset, isLoading: assetLoading, mutate: assetMutate } = useAsset(assetId, assetType);
    const [expanded, setExpanded] = useState({});
    const [hoveredCardId, setHoveredCardId] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedScopeIds, setSelectedScopeIds] = useState([]);
    const canManageCompliance = useHasPermission(PERMISSIONS.ASSET_COMPLIANCE_MANAGE);
    const canCheckCompliance = useHasPermission(PERMISSIONS.ASSET_COMPLIANCE_CHECK);

    const addMutation = useAddAssetToComplianceScope({
        successNotification: {
            message: 'Scope added to asset successfully.',
        },
    });
    const removeMutation = useRemoveAssetFromComplianceScope({
        successNotification: {
            message: 'Scope removed from asset successfully.',
            color: 'red',
        },
    });
    const updateComplianceMutation = useUpdateAssetScopeCompliance({
        successNotification: {
            message: 'Compliance status updated.',
        },
    });

    const activeScopes = useMemo(() => asset?.compliance_scopes || [], [asset]);
    const activeScopeIds = useMemo(() => new Set(activeScopes.map((s) => s.id)), [activeScopes]);

    const availableOptions = useMemo(() => {
        return (allScopes || [])
            .filter((s) => !activeScopeIds.has(s.id))
            .map((s) => ({ value: String(s.id), label: s.name }));
    }, [allScopes, activeScopeIds]);

    const handleToggle = (id, e) => {
        e?.stopPropagation?.();
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAddScopes = useCallback(async () => {
        if (!assetId || selectedScopeIds.length === 0) return;
        const promises = selectedScopeIds.map((sid) =>
            addMutation.mutate({ scopeId: Number(sid), assetId: Number(assetId) })
        );
        await Promise.all(promises);
        setAddModalOpen(false);
        setSelectedScopeIds([]);
        await assetMutate();
    }, [assetId, selectedScopeIds, addMutation, assetMutate]);

    const handleRemoveScope = useCallback(
        async (scopeId) => {
            if (!assetId) return;
            await removeMutation.mutate({ scopeId: Number(scopeId), assetId: Number(assetId) });
            await assetMutate();
        },
        [assetId, removeMutation, assetMutate]
    );

    const handleToggleCompliance = useCallback(
        async (scopeId, nextValue) => {
            if (!assetId) return;
            await updateComplianceMutation.mutate({
                assetId: Number(assetId),
                scopeId: Number(scopeId),
                compliant: !!nextValue,
                assetType,
            });
            await assetMutate();
        },
        [assetId, assetType, updateComplianceMutation, assetMutate]
    );

    const grid = useMemo(() => (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
            {(assetLoading ? [] : activeScopes).map((scope) => {
                const Icon = getScopeIcon(scope.name);
                const isOpen = !!expanded[scope.id];
                return (
                    <Card
                        key={scope.id}
                        withBorder
                        radius="md"
                        padding="lg"
                        onMouseEnter={() => setHoveredCardId(scope.id)}
                        onMouseLeave={() => setHoveredCardId((current) => (current === scope.id ? null : current))}
                            style={{
                            borderColor:
                                hoveredCardId === scope.id
                                    ? theme.colors[theme.primaryColor][colorScheme === 'dark' ? 5 : 6]
                                    : undefined,
                            transition: 'border-color 150ms ease',
                        }}
                    >
                        <Group justify="space-between" align="flex-start">
                            <Group gap="sm">
                                <Group gap="sm" justify="space-between" style={{ width: '100%' }}>
                                    <ThemeIcon radius="md" size="lg" variant="light" color={isOpen ? 'primary' : 'gray'}>
                                        <Icon size={18} />
                                    </ThemeIcon>
                                    
                                {canManageCompliance && (
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        aria-label="Remove scope"
                                        onClick={() => handleRemoveScope(scope.id)}
                                        loading={removeMutation.isLoading}
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                )}
                                </Group>
                                <Stack gap={2}>
                                    <Text fw={600}>{scope.name}</Text>
                                    {scope.description && (
                                        <Text size="sm" c="dimmed" lineClamp={2}>
                                            {scope.description}
                                        </Text>
                                    )}
                                </Stack>
                            </Group>
                            <Badge key={scope.id} variant="light" color={scope.compliant ? 'green' : 'red'} size="sm">{scope.compliant ? 'Compliant' : 'Non-compliant'}</Badge>

                            <Group gap={6} wrap="nowrap" justify="space-between" style={{ width: '100%' }}>
                                {scope.reference_url && (
                                    <Tooltip label="Reference">
                                        <Anchor component={Link} href={scope.reference_url} target="_blank" onClick={(e) => e.stopPropagation?.()}>
                                            <IconExternalLink size={16} />
                                        </Anchor>
                                    </Tooltip>
                                )}

                                <Button
                                    size="xs"
                                    variant="subtle"
                                    rightSection={<IconChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease' }} />}
                                    onClick={(e) => handleToggle(scope.id, e)}
                                >
                                    {isOpen ? 'Hide details' : 'Show more'}
                                </Button>
                                {canCheckCompliance && (
                                    <Tooltip label="Mark compliant">
                                        <Switch
                                            size="xs"
                                            checked={!!scope.compliant}
                                            onClick={(e) => e.stopPropagation?.()}
                                            onChange={(e) => handleToggleCompliance(scope.id, e.currentTarget.checked)}
                                        />
                                    </Tooltip>
                                )}
                            </Group>
                        </Group>
                                
                        <Collapse in={isOpen} transitionDuration={150}>
                            <Stack gap="sm" mt="md">
                                <Group gap="xs">
                                    <Text size="sm" c="dimmed" w={160}>
                                        Last audit date
                                    </Text>
                                    <Text size="sm">{formatDate(scope.last_audit_date)}</Text>
                                </Group>
                                <Group gap="xs">
                                    <Text size="sm" c="dimmed" w={160}>
                                        Last audit result
                                    </Text>
                                    <Badge variant="light" color={scope.last_audit_result ? 'green' : 'gray'}>
                                        {scope.last_audit_result ?? '—'}
                                    </Badge>
                                </Group>
                                <Group gap="xs">
                                    <Text size="sm" c="dimmed" w={160}>
                                        Next audit due
                                    </Text>
                                    <Text size="sm">{formatDate(scope.next_audit_due)}</Text>
                                </Group>
                                <Group gap="xs">
                                    <Text size="sm" c="dimmed" w={160}>
                                        Auditor
                                    </Text>
                                    <Text size="sm">{scope.auditor ?? '—'}</Text>
                                </Group>
                                {scope.notes && (
                                    <Stack gap={4}>
                                        <Text size="sm" c="dimmed">
                                            Notes
                                        </Text>
                                        <Text size="sm">{scope.notes}</Text>
                                    </Stack>
                                )}
                            </Stack>
                        </Collapse>
                    </Card>
                );
            })}

            {/* Add new scope card */}
            {canManageCompliance && (scopesLoading || availableOptions.length === 0 ? <React.Fragment /> : (

                <Card onClick={() => setAddModalOpen(true)} withBorder radius="md" padding="lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140, cursor: 'pointer', backgroundColor: 'transparent' }}>
                    <Stack align="center" gap="xs">
                        <ThemeIcon size="xl" radius="xl" variant="light" color="primary">
                            <IconPlus size={20} />
                        </ThemeIcon>
                        {scopesLoading && <Loader size="sm" />}
                        {!scopesLoading && availableOptions.length === 0 && (
                            <Text size="sm" c="dimmed">No more scopes available</Text>
                        )}
                    </Stack>
                </Card>))}
        </SimpleGrid>
    ), [activeScopes, expanded, hoveredCardId, theme, colorScheme, handleRemoveScope, scopesLoading, availableOptions.length]);

    return (
        <>
            {grid}
            <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add compliance scopes" size="md">
                <Stack>
                    <MultiSelect
                        data={availableOptions}
                        value={selectedScopeIds}
                        onChange={setSelectedScopeIds}
                        placeholder="Select scopes to add"
                        searchable
                        nothingFoundMessage={scopesLoading ? 'Loading…' : 'No scopes'}
                    />
                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddScopes} loading={addMutation.isLoading} disabled={selectedScopeIds.length === 0}>Add</Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
};

export default AssetComplianceManager;