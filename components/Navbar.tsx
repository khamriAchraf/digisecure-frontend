import {
  IconAdjustments,
  IconCalendarStats,
  IconChecklist,
  IconComponents,
  IconFile,
  IconFileAnalytics,
  IconGauge,
  IconLock,
  IconNotes,
  IconPresentationAnalytics,
  IconShieldCheck,
} from '@tabler/icons-react';
import { ActionIcon, Code, Group, ScrollArea } from '@mantine/core';
import classes from '@/styles/Navbar.module.css';
import { LinksGroup } from './NavbarLinksGroup';
import Image from 'next/image';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useHasPermission, PERMISSIONS } from '../src/hooks/usePermissions';
import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useSidebar } from '../src/contexts/SidebarContext';

export function Navbar() {
  const { t } = useLanguage();
  const { collapsed: isCollapsed, toggleCollapsed } = useSidebar();
  
  // Permission checks
  const hasComputersList = useHasPermission(PERMISSIONS.COMPUTER_LIST);
  const hasNetworkDevicesList = useHasPermission(PERMISSIONS.NETWORK_DEVICE_LIST);
  const hasVirtualMachinesList = useHasPermission(PERMISSIONS.VIRTUAL_MACHINE_LIST);
  const hasSoftwareList = useHasPermission(PERMISSIONS.SOFTWARE_LIST);
  const hasCertificateKeysList = useHasPermission(PERMISSIONS.CERTIFICATE_KEY_LIST);
  const hasUserList = useHasPermission(PERMISSIONS.USER_LIST);
  const hasRoleList = useHasPermission(PERMISSIONS.ROLE_LIST);
  const hasGroupList = useHasPermission(PERMISSIONS.GROUP_LIST);
  const hasComplianceScopeList = useHasPermission(PERMISSIONS.COMPLIANCE_SCOPE_LIST);
  const hasRecycleBinUserList = useHasPermission(PERMISSIONS.RECYCLE_BIN_USER_LIST);
  const hasDocumentsList = useHasPermission(PERMISSIONS.DOCUMENTS_LIST);

  const adminLinks = [
    // Only show users link if user has user read permission
    ...(hasUserList ? [{ label: t('administration.users'), link: '/admin/users' }] : []),
    ...(hasGroupList ? [{ label: t('administration.groups'), link: '/admin/groups' }] : []),
  ];

  const mockdata = [
    { label: t('navigation.dashboard'), icon: IconGauge, link: '/' },
    // Assets section - only show if user has asset read permission
    ...(hasComputersList || hasNetworkDevicesList || hasVirtualMachinesList || hasSoftwareList ? [{
      label: t('navigation.assets'),
      icon: IconComponents,
      links: [
        ...(hasComputersList ? [{ label: t('assets.computers'), link: '/assets/computers' }] : []),
        ...(hasNetworkDevicesList ? [{ label: t('assets.network_devices'), link: '/assets/network_devices' }] : []),
        ...(hasVirtualMachinesList ? [{ label: t('assets.virtual_machines'), link: '/assets/virtual_machines' }] : []),
        ...(hasSoftwareList ? [{ label: t('assets.software'), link: '/assets/software' }] : []),
        ...(hasCertificateKeysList ? [{ label: t('datatable.certificate_keys'), link: '/assets/certificates_keys' }] : []),
      ],
    }] : []),
    ...(adminLinks.length > 0 ? [{
      label: t('navigation.administration'),
      icon: IconShieldCheck,
      links: adminLinks,
    }] : []),
    ...(hasComplianceScopeList ? [{ label: t('navigation.compliance'), icon: IconChecklist, link: '/compliance' }] : []),
    ...(hasDocumentsList ? [{ label: t('navigation.documents'), icon: IconFile, link: '/documents' }] : []),
    { label: t('navigation.analytics'), icon: IconPresentationAnalytics, link: '/analytics' },
    { label: t('navigation.contracts'), icon: IconFileAnalytics, link: '/contracts' },
    { label: t('navigation.settings'), icon: IconAdjustments, link: '/settings' },

  ];

  const links = mockdata.map((item) => (
    <LinksGroup {...item} key={item.label} collapsed={isCollapsed} />
  ));

  return (
    <nav className={`${classes.navbar} ${isCollapsed ? classes.collapsed : ''}`}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Image src="/logo.png" alt="logo" width={isCollapsed ? 36 : 120} height={isCollapsed ? 36 : 120} />
          <Group gap="xs">
            {!isCollapsed && <Code fw={700}>v0.1.0</Code>}
            <ActionIcon
              variant="light"
              color="primary"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={toggleCollapsed}
            >
              {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>
    </nav>
  );
}