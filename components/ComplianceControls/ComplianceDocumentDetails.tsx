import React from 'react'
import { ComplianceScopeControl } from '../../types/models';
import { ActionIcon, Badge, Button, Card, Group, Stack, Text, Title, ThemeIcon } from '@mantine/core';
import { IconX, IconFileText } from '@tabler/icons-react';
import { useScopeControl } from '../../src/fetchers';
import { useAttachDocumentsToControl, useDetachDocumentsFromControl } from '../../src/mutations';
import { t } from '../../i18n';
import { openDocumentPicker } from '../Documents/DocumentPicker';


interface ComplianceDocumentDetailsProps {
    control: ComplianceScopeControl;
    setSelectedControl: (control: ComplianceScopeControl | null) => void;
}

const ComplianceDocumentDetails: React.FC<ComplianceDocumentDetailsProps> = ({ control, setSelectedControl }) => {
    const { data: controlData, isLoading: isControlLoading } = useScopeControl(control.scope_id, control.id);
    const { mutate: attachDocuments, isLoading: isAttaching } = useAttachDocumentsToControl({
        onSuccess: () => {}
    });
    const { mutate: detachDocuments, isLoading: isDetaching } = useDetachDocumentsFromControl();

    const openAttachPicker = async () => {
        const picked = await openDocumentPicker({ title: t('compliance.attachDocument') });
        if (picked) {
            attachDocuments({ scopeId: control.scope_id, controlId: control.id, documentIds: [picked] });
        }
    };

    return (
        <React.Fragment>
            <Card p="md" withBorder>
                <Stack gap="lg">
                    <Group gap={2} justify="space-between" style={{ width: '100%' }}>
                        <Badge variant="light" size="sm">{control.code}</Badge>
                        <Title order={4}>{control.title}</Title>
                        <ActionIcon variant="light" size="sm" onClick={() => setSelectedControl(null)}>
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>
                    <Text>{control.description}</Text>
                    
                    <Group justify="center" style={{ width: '100%' }}>
                        <Button size="xs" variant="filled" loading={isAttaching} onClick={openAttachPicker}>{t('compliance.attachDocument')}</Button>
                        <Button size="xs" variant="light" onClick={openAttachPicker}>{t('compliance.changeStatus')}</Button>
                        <Button size="xs" variant="light" onClick={openAttachPicker}>{t('compliance.manageNotifications')}</Button>
               
                    </Group>
                    <Text>{control.last_audit_date}</Text>
                    <Text>{control.last_audit_result}</Text>

                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Title order={6}>{t('compliance.attachedDocuments')}</Title>
                            <Badge variant="light" size="sm" color={controlData?.documents?.length ? 'green' : 'red'}>{controlData?.documents?.length ?? 0}</Badge>
                        </Group>
                        {controlData?.documents && controlData.documents.length > 0 ? (
                            <Stack gap={6}
                                style={{ border: '1px solid var(--mantine-color-dark-5)', borderRadius: 6, padding: 8 }}
                            >
                                {controlData.documents.map((doc) => (
                                    <Group key={`attached-${doc.id}`} gap={8} justify="space-between">
                                        <Group gap={8}>
                                            <ThemeIcon variant="light" color="blue" size="sm">
                                                <IconFileText size={14} />
                                            </ThemeIcon>
                                            <Text size="sm">{doc.name}</Text>
                                        </Group>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            size="sm"
                                            loading={isDetaching}
                                            onClick={() => detachDocuments({ scopeId: control.scope_id, controlId: control.id, documentIds: [doc.id] })}
                                        >
                                            <IconX size={14} />
                                        </ActionIcon>
                                    </Group>
                                ))}
                            </Stack>
                        ) : (
                            <Text size="sm" c="dimmed">{t('compliance.noDocumentsAttached')}</Text>
                        )}
                    </Stack>
                </Stack>
            </Card>

            {/* Document Picker modal now handled via Mantine modals manager */}
        </React.Fragment>
    )
}

export default ComplianceDocumentDetails