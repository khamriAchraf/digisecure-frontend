import React, { useMemo } from 'react'
import { useComplianceDashboard } from '../../src/fetchers'
import { ScopeComplianceBreakdown, ScopesComplianceSummary } from '../../types/models'
import { Grid, Paper, Title, Text, Group, Stack, Progress, ScrollArea, RingProgress, Box, Divider, SemiCircleProgress, Tabs } from '@mantine/core'
import { BarChart } from '@mantine/charts'

const clampPercent = (value?: number) => {
    const num = Number(value ?? 0);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
};

const getProgressColor = (value: number) => {
    if (value < 25) return 'red';
    if (value < 50) return 'orange';
    return 'green';
};

const ComplianceDashboard = () => {
    const { data, isLoading, isError } = useComplianceDashboard();



    const summary = (data) as ScopesComplianceSummary;

    const scopes: ScopeComplianceBreakdown[] = useMemo(() => {
        if (!summary || !summary.scopes) return [];
        return Object.values(summary.scopes);
    }, [summary]);

    const documentControlsData = useMemo(
        () =>
            scopes.map((s) => {
                const compliant = clampPercent(s.document_control_percentage);
                const remaining = clampPercent(100 - compliant);
                return {
                    scope: s.scope_name,
                    Compliance: compliant,
                    Remaining: remaining,
                };
            }),
        [scopes]
    );

    const overall = clampPercent(summary?.overall_progress_percentage);

    return (
        <React.Fragment>
            <Title order={2}>Compliance Dashboard</Title>
            <Tabs>
                <Tabs.List defaultValue="all" mt="md">
                    <Tabs.Tab value="all">Overview</Tabs.Tab>
                    {scopes.map((s) => (
                        <Tabs.Tab key={s.scope_name} value={s.scope_name}>{s.scope_name}</Tabs.Tab>
                    ))}
                </Tabs.List>
                <Tabs.Panel value="all" pt="md">
                    <Stack gap="md">

                        {/* Top row */}
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Paper p="md" radius="md" withBorder>
                                    <Title order={4}>Overall compliance progress</Title>
                                    <Group justify="center" mt="md">
                                        <SemiCircleProgress
                                            value={overall}
                                            size={180}
                                            thickness={16}
                                            label={<Text fw={800} size="lg">{overall}%</Text>}
                                        />
                                    </Group>
                                </Paper>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 8 }}>
                                <Paper p="md" radius="md" withBorder>
                                    <Title order={4}>Progress for active compliance scopes</Title>
                                    <ScrollArea type="auto" mt="md">
                                        <Group wrap="nowrap" gap="lg" align="center">
                                            {scopes.map((s, idx) => {
                                                const total = clampPercent(s.total_compliance_percentage);
                                                return (
                                                    <Group key={s.scope_name} align="center" gap="md" style={{ minWidth: 280 }}>
                                                        <Box w="100%">
                                                            <Text fw={600} mb={4}>{s.scope_name}</Text>
                                                            <Group align="center" gap="md">
                                                                <Text fw={900} size="xl" style={{ minWidth: 64, textAlign: 'left' }}>{total}%</Text>
                                                                <Progress value={total} color={getProgressColor(total)} size="lg" radius="xl" style={{ flex: 1 }} />
                                                            </Group>
                                                        </Box>
                                                        {/* Vertical separator to mimic the sketch and hint more content */}
                                                        {idx < scopes.length - 1 && (
                                                            <Divider orientation="vertical" style={{ alignSelf: 'stretch' }} />
                                                        )}
                                                    </Group>
                                                );
                                            })}
                                            {scopes.length === 0 && (
                                                <Text c="dimmed">No active compliance scopes</Text>
                                            )}
                                        </Group>
                                    </ScrollArea>
                                </Paper>
                            </Grid.Col>
                        </Grid>

                        {/* Bottom row */}
                        <Grid gutter="md">
                            {/* Upcoming reviews intentionally omitted for now */}
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                {/* Reserved */}
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Paper p="md" radius="md" withBorder>
                                    <Title order={4}>Assigned controls for compliance scopes</Title>
                                    <Box mt="md">
                                        <BarChart
                                            h={240}
                                            data={documentControlsData}
                                            dataKey="scope"
                                            series={[
                                                { name: 'Compliance', color: 'blue.4' },
                                                { name: 'Remaining', color: 'blue.9' },
                                            ]}
                                            type="stacked"
                                            withLegend={false}
                                            withTooltip={false}
                                            withXAxis
                                            withYAxis={false}
                                            gridAxis='none'
                                            xAxisProps={{ tickLine: false, axisLine: false }}
                                            barProps={{ barSize: 30, radius: [2, 2, 0, 0] }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid.Col>
                        </Grid>

                        {isLoading && <Text c="dimmed">Loading...</Text>}
                        {isError && <Text c="red">Error loading compliance dashboard</Text>}
                    </Stack>
                </Tabs.Panel>
            </Tabs>

        </React.Fragment>

    )
}

export default ComplianceDashboard