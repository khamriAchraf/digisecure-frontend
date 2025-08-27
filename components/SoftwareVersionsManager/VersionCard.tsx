import React, { useState } from 'react'
import { SoftwareVersion } from '../../types'
import { Badge, Card, Group, Stack, useMantineTheme, useComputedColorScheme, Text } from '@mantine/core'
import { useRouter } from 'next/router';

interface VersionCardProps {
  version: SoftwareVersion;
  setSelectedVersion: (version: SoftwareVersion) => void;
  selected?: boolean;
}

const VersionCard = ({ version, setSelectedVersion, selected = false }: VersionCardProps) => {
    const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
    const router = useRouter();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const hoverBorderColor = colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[4];
    
  return (
    <div style={{ width: '100%' }}>
            <Card
                key={version.id}
                withBorder
                radius="md"
                padding="md"
                onClick={() => setSelectedVersion(version)}
                onMouseEnter={() => setHoveredCardId(version.id)}
                onMouseLeave={() => setHoveredCardId((current) => (current === version.id ? null : current))}
                style={{
                    cursor: 'pointer',
                    borderColor: selected
                        ? theme.colors[theme.primaryColor][colorScheme === 'dark' ? 5 : 6]
                        : hoveredCardId === version.id
                            ? hoverBorderColor
                            : undefined,
                    transition: 'border-color 150ms ease',
                }}
            >
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Badge color="primary" variant="light" size="sm">{version.version}</Badge>
                        <Badge color={version.end_of_support_date ? 'green' : 'red'} variant="light" size="sm">{version.end_of_support_date ?? 0}</Badge>
                    </Group>
                    <Text size="sm" c="dimmed">Released on {version.release_date}</Text>
                </Stack>
            </Card>
        </div>
  )
}

export default VersionCard