import React, { useMemo, useState } from 'react'
import { t } from '../../../../i18n';
import Head from 'next/head';
import { Card, Container, Group, SimpleGrid, Stack, Title, useMantineTheme, useComputedColorScheme, Text } from '@mantine/core';
import { IconBook2, IconMap, IconBuildingFactory2 } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useHasPermission, PERMISSIONS } from '../../../hooks/usePermissions';

const index = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const hasLocationList = useHasPermission(PERMISSIONS.LOCATION_LIST);
  const hasManufacturerList = useHasPermission(PERMISSIONS.MANUFACTURER_LIST);
  const hasOperatingSystemList = useHasPermission(PERMISSIONS.OPERATING_SYSTEM_LIST);


  const gridCols = useMemo(() => {
    return <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
      {hasLocationList && (
      <Card withBorder radius="md"
        key="locations"
        padding="lg"
        onClick={() => router.push(`/admin/reference_data/locations`)}
        onMouseEnter={() => setHoveredCardId("locations")}
        onMouseLeave={() => setHoveredCardId((current) => (current === "locations" ? null : current))}
        style={{
          cursor: 'pointer',
          borderColor: hoveredCardId === "locations" ? theme.colors[theme.primaryColor][colorScheme === 'dark' ? 5 : 6] : undefined,
          transition: 'border-color 150ms ease',
        }} >
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <IconMap size={28} />
            <Text fw={600}>{t('navigation.locations')}</Text>
          </Group>
        </Group>
      </Card>
      )}
      {hasManufacturerList && (
      <Card withBorder radius="md"
        key="manufacturers"
        padding="lg"
        onClick={() => router.push(`/admin/reference_data/manufacturers`)}
        onMouseEnter={() => setHoveredCardId("manufacturers")}
        onMouseLeave={() => setHoveredCardId((current) => (current === "manufacturers" ? null : current))}
        style={{
          cursor: 'pointer',
          borderColor: hoveredCardId === "manufacturers" ? theme.colors[theme.primaryColor][colorScheme === 'dark' ? 5 : 6] : undefined,
          transition: 'border-color 150ms ease',
        }} >
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <IconBuildingFactory2 size={28} />
            <Text fw={600}>{t('navigation.manufacturers')}</Text>
          </Group>
        </Group>
      </Card>
      )}
      {hasOperatingSystemList && (
      <Card withBorder radius="md"
        key="operating_systems"
        padding="lg"
        onClick={() => router.push(`/admin/reference_data/operating_systems`)}
        onMouseEnter={() => setHoveredCardId("operating_systems")}
        onMouseLeave={() => setHoveredCardId((current) => (current === "operating_systems" ? null : current))}
        style={{
          cursor: 'pointer',
          borderColor: hoveredCardId === "operating_systems" ? theme.colors[theme.primaryColor][colorScheme === 'dark' ? 5 : 6] : undefined,
          transition: 'border-color 150ms ease',
        }} >
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <IconBuildingFactory2 size={28} />
            <Text fw={600}>{t('navigation.operating_systems')}</Text>
          </Group>
        </Group>
      </Card>
      )}
    </SimpleGrid>
  }, [router, theme, colorScheme, hoveredCardId]);

  return (
    <React.Fragment>
      <Head>
        <title>{t('navigation.reference_data')} - Digi Secure</title>
      </Head>
      <Container size="xl" py="md">
        <Stack gap="lg">
          <Group justify="start" align="center">
            <IconBook2 size={28} />
            <Title order={2}>{t('navigation.reference_data')}</Title>
          </Group>
          {gridCols}
        </Stack>
      </Container>
    </React.Fragment>
  )
}

export default index