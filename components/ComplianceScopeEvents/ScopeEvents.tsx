import { useScopeEvents } from '@/fetchers';
import { Group, SegmentedControl, Text, Timeline, Title, Badge, Stack, Loader, Alert, useMantineTheme, useComputedColorScheme, Box } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react'
import { t } from '../../i18n';
import { IconCheck, IconAlertCircle, IconClock, IconCircleDashed, IconRepeat } from '@tabler/icons-react';
import { getEventStatusInfo } from '../../types/utils';
import { ComplianceScopeEvent } from '../../types/models';
import EventModal from '../EventModal/EventModal';

const ScopeEvents = ({ scopeId }: { scopeId: number }) => {

    const [displayMode, setDisplayMode] = useState<'timeline' | 'calendar' | 'list'>('timeline');
    const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<ComplianceScopeEvent | null>(null);
    const [modalOpened, setModalOpened] = useState(false);
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    const { data: events, isLoading, isError, mutate } = useScopeEvents(scopeId);

    useEffect(() => {
        console.log(events);
    }, [events]);

    // Sort events: overdue first, then upcoming, then done
    const sortedEvents = useMemo(() => {
        if (!events) return [];

        return [...events].sort((a, b) => {
            const statusA = getEventStatusInfo(a.next_due_date, a.last_done_date);
            const statusB = getEventStatusInfo(b.next_due_date, b.last_done_date);

            const priority: Record<string, number> = {
                'overdue': 1,
                'upcoming': 2,
                'done': 3,
                'unknown': 4
            };

            const priorityDiff = priority[statusA.status] - priority[statusB.status];

            if (priorityDiff !== 0) return priorityDiff;

            // Within same status, sort by date
            if (statusA.status === 'overdue' || statusA.status === 'upcoming') {
                const dateA = a.next_due_date ? new Date(a.next_due_date).getTime() : 0;
                const dateB = b.next_due_date ? new Date(b.next_due_date).getTime() : 0;
                return dateA - dateB;
            }

            return 0;
        });
    }, [events]);

    const getEventIcon = (status: string) => {
        switch (status) {
            case 'overdue':
                return <IconAlertCircle size={16} />;
            case 'upcoming':
                return <IconClock size={16} />;
            case 'done':
                return <IconCheck size={16} />;
            default:
                return <IconCircleDashed size={16} />;
        }
    };

    const handleEventClick = (event: ComplianceScopeEvent) => {
        setSelectedEvent(event);
        setModalOpened(true);
    };

    const handleModalClose = () => {
        setModalOpened(false);
        setSelectedEvent(null);
    };

    const handleEventUpdate = () => {
        mutate(); // Refresh events list
    };

    return (
        <div>
            <Group justify="space-between" mb="md">
                <Title order={3}>{t('common.events')}</Title>
                <SegmentedControl value={displayMode} onChange={(value) => setDisplayMode(value as 'timeline' | 'calendar' | 'list')} data={[
                    { label: 'Timeline', value: 'timeline' },
                    { label: 'Calendar', value: 'calendar' },
                    { label: 'List', value: 'list' },
                ]} />
            </Group>

            {isLoading && <Loader size="sm" />}

            {isError && (
                <Alert color="red" title="Error loading events">
                    Failed to load compliance events. Please try again.
                </Alert>
            )}

            {!isLoading && !isError && sortedEvents.length === 0 && (
                <Text c="dimmed" size="sm">No events scheduled for this scope.</Text>
            )}

            {displayMode === 'timeline' && sortedEvents.length > 0 && (
                <Timeline active={-1} bulletSize={32} lineWidth={4}>
                    {sortedEvents.map((event) => {
                        const statusInfo = getEventStatusInfo(event.next_due_date, event.last_done_date);
                        const isDone = statusInfo.status === 'done';

                        return (
                            <Timeline.Item
                                key={event.id}
                                bullet={getEventIcon(statusInfo.status)}
                                color={statusInfo.color}
                            >
                                <Box
                                    p="md"
                                    style={{
                                        border: '1px solid',
                                        borderColor: hoveredEventId === event.id 
                                            ? theme.colors[theme.primaryColor][colorScheme === 'dark' ? 5 : 6]
                                            : colorScheme === 'dark' 
                                                ? theme.colors.dark[4] 
                                                : theme.colors.gray[3],
                                        borderRadius: theme.radius.md,
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease',
                                        backgroundColor: hoveredEventId === event.id
                                            ? colorScheme === 'dark'
                                                ? theme.colors.dark[6]
                                                : theme.colors.gray[0]
                                            : 'transparent',
                                    }}
                                    onMouseEnter={() => setHoveredEventId(event.id)}
                                    onMouseLeave={() => setHoveredEventId((current) => (current === event.id ? null : current))}
                                    onClick={() => handleEventClick(event)}
                                >
                                    <Stack gap="xs">
                                        <Group gap="xs" align="center">
                                            <Text
                                                size="sm"
                                                fw={isDone ? 400 : 500}
                                                c={isDone ? 'dimmed' : undefined}
                                            >
                                                {event.name}
                                            </Text>
                                            <Badge
                                                size="xs"
                                                variant={isDone ? 'light' : 'filled'}
                                                color={statusInfo.color}
                                            >
                                                {statusInfo.label}
                                            </Badge>
                                        </Group>

                                        {event.description && (
                                            <Text c="dimmed" size="xs" opacity={isDone ? 0.5 : 1}>
                                                {event.description}
                                            </Text>
                                        )}

                                        <Group gap="lg" align="center">
                                            <Text
                                                c={statusInfo.status === 'overdue' ? 'red' : 'dimmed'}
                                                size="xs"
                                                fw={statusInfo.status === 'overdue' ? 500 : 400}
                                                opacity={isDone ? 0.5 : 1}
                                            >
                                                {statusInfo.relativeTime}
                                            </Text>
                                            {event.frequency && (
                                                <Text c="dimmed" size="xs" opacity={isDone ? 0.4 : 0.6}>
                                                    <Group gap="xs" align="center">
                                                        <IconRepeat size={12} /> {event.frequency}
                                                    </Group>
                                                </Text>
                                            )}
                                        </Group>
                                    </Stack>
                                </Box>
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            )}

            <EventModal
                opened={modalOpened}
                onClose={handleModalClose}
                event={selectedEvent}
                scopeId={scopeId}
                onSuccess={handleEventUpdate}
            />
        </div>
    )
}

export default ScopeEvents