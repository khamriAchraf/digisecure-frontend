import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  Center,
  Anchor,
  Container,
  useMantineTheme,
  useComputedColorScheme,
} from '@mantine/core';
import { IconChevronDown, IconCreditCard, IconScale, IconShieldCheck, IconExternalLink, IconPlus, IconChecklist } from '@tabler/icons-react';
import { useComplianceScopes } from '../../fetchers';
import type { ComplianceScope } from '../../../types/models';
import { useHasPermission, PERMISSIONS } from '../../hooks/usePermissions';
import Head from 'next/head';
import { useTranslation } from '@/hooks/useTranslation';

const getScopeIcon = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('pci')) return IconCreditCard;
  if (normalized.includes('iso')) return IconShieldCheck;
  return IconScale;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  } catch {
    return value;
  }
};

export default function CompliancePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const { data: scopes, isLoading, isError, totalItems } = useComplianceScopes();
  const canCreate = useHasPermission(PERMISSIONS.COMPLIANCE_SCOPE_CREATE);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  const handleToggle = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const gridCols = useMemo(
    () => (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {(scopes ?? []).map((scope: ComplianceScope) => {
          const Icon = getScopeIcon(scope.name);
          const isOpen = !!expanded[scope.id];
          return (
            <Card
              key={scope.id}
              withBorder
              radius="md"
              padding="lg"
              onClick={() => router.push(`/compliance/${scope.id}`)}
              onMouseEnter={() => setHoveredCardId(scope.id)}
              onMouseLeave={() => setHoveredCardId((current) => (current === scope.id ? null : current))}
              style={{
                cursor: 'pointer',
                borderColor: hoveredCardId === scope.id ? theme.colors.blue[colorScheme === 'dark' ? 5 : 6] : undefined,
                transition: 'border-color 150ms ease',
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Group gap="sm">
                  <ThemeIcon radius="md" size="lg" variant="light" color={isOpen ? 'blue' : 'gray'}>
                    <Icon size={18} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={600}>{scope.name}</Text>
                    {scope.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {scope.description}
                      </Text>
                    )}
                  </Stack>
                </Group>
                <Group gap={6} wrap="nowrap">
                  {scope.reference_url && (
                    <Tooltip label="Reference">
                      <Anchor
                        component={Link}
                        href={scope.reference_url}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                </Group>
              </Group>

              <Collapse in={isOpen} transitionDuration={150}>
                <Stack gap="sm" mt="md">
                  <Group gap="xs">
                    <Text size="sm" c="dimmed" w={160}>
                      Last audit date
                    </Text>
                    <Text size="sm">{formatDate(scopes ? scope.last_audit_date : null)}</Text>
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
      </SimpleGrid>
    ),
    [expanded, router, scopes, hoveredCardId]
  );

  return (
    <React.Fragment>
      <Head>
        <title>{t('navigation.compliance')} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group>
              <IconChecklist size={28} />
              <Title order={2}>{t('navigation.compliance')}</Title>
              {totalItems && totalItems > 0 && (
                <Badge variant="light" color="blue">
                  {totalItems} {totalItems === 1 ? t('compliance.scope') : t('compliance.scopes')}
                </Badge>
              )}
            </Group>
            {canCreate && (
              <Button component={Link} href="/compliance/new" leftSection={<IconPlus size={16} />}>{t('common.create')}</Button>
            )}
          </Group>

          {isLoading && (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} withBorder radius="md" padding="lg">
                  <Skeleton height={22} width="60%" mb="sm" />
                  <Skeleton height={12} width="90%" mb="xs" />
                  <Skeleton height={12} width="80%" />
                </Card>
              ))}
            </SimpleGrid>
          )}

          {isError && (
            <Alert color="red" title="Failed to load compliance scopes">
              Please try again later.
            </Alert>
          )}

          {!isLoading && !isError && (scopes?.length ?? 0) === 0 && (
            <Center>
              <Text c="dimmed">No compliance scopes found.</Text>
            </Center>
          )}

          {!isLoading && !isError && (scopes?.length ?? 0) > 0 && gridCols}
        </Stack>
      </Container>
    </React.Fragment>
  );
}

