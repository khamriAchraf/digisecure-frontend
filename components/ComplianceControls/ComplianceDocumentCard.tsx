import React, { useState } from 'react'
import { ComplianceScopeControl } from '../../types/models';
import { Badge, Card, Group, Stack, Text, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import { useRouter } from 'next/router';
import ComplianceDocumentDetails from './ComplianceDocumentDetails';

interface ComplianceDocumentCardProps {
    control: ComplianceScopeControl;
    searchQuery: string;
    setSelectedControl: (control: ComplianceScopeControl) => void;
    selected?: boolean;
}

const ComplianceDocumentCard: React.FC<ComplianceDocumentCardProps> = ({ control, searchQuery, setSelectedControl, selected = false }) => {
    const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
    const router = useRouter();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const hoverBorderColor = colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[4];

    const isMatch = control.title.toLowerCase().includes(searchQuery.toLowerCase());


    return (
        <div style={{ width: '100%' }}>
            <Card
                key={control.code}
                withBorder
                radius="md"
                padding="md"
                onClick={() => setSelectedControl(control)}
                onMouseEnter={() => setHoveredCardId(control.id)}
                onMouseLeave={() => setHoveredCardId((current) => (current === control.id ? null : current))}
                style={{
                    cursor: 'pointer',
                    borderColor: selected
                        ? theme.colors[theme.primaryColor][colorScheme === 'dark' ? 5 : 6]
                        : hoveredCardId === control.id
                            ? hoverBorderColor
                            : undefined,
                    transition: 'border-color 150ms ease',
                }}
            >
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Badge color="primary" variant="light" size="sm">{control.code}</Badge>
                        <Badge color={control.document_count ? 'green' : 'red'} variant="light" size="sm">{control.document_count ?? 0}</Badge>
                    </Group>
                    <Text>{control.title}</Text>
                </Stack>
            </Card>
        </div>
    )
}

export default ComplianceDocumentCard