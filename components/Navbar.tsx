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
import { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useSidebar } from '../src/contexts/SidebarContext';
import { useRouter } from 'next/router';

export function Navbar() {
  const { t } = useLanguage();
  const { collapsed: isCollapsed, toggleCollapsed } = useSidebar();
  const router = useRouter();
  const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(null);
  
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
  const hasAnalyticsList = useHasPermission(PERMISSIONS.ANALYTICS_LIST);
  const hasOperatingSystemList = useHasPermission(PERMISSIONS.OPERATING_SYSTEM_LIST);
  const hasManufacturerList = useHasPermission(PERMISSIONS.MANUFACTURER_LIST);
  const hasLocationList = useHasPermission(PERMISSIONS.LOCATION_LIST);
  const hasDataRegisterList = useHasPermission(PERMISSIONS.DATA_REGISTER_LIST);

  const adminLinks = [
    // Only show users link if user has user read permission
    ...(hasUserList ? [{ label: t('administration.users'), link: '/admin/users' }] : []),
    ...(hasGroupList ? [{ label: t('administration.groups'), link: '/admin/groups' }] : []),
    ...(hasOperatingSystemList || hasManufacturerList || hasLocationList ? [{ label: t('administration.reference_data'), link: '/admin/reference_data' }] : []),
  ];

  const complianceLinks = [
    ...(hasComplianceScopeList ? [{ label: t('navigation.scopes'), icon: IconChecklist, link: '/compliance/scopes' }] : []),
    ...(hasDataRegisterList ? [{ label: t('navigation.data_register'), icon: IconFile, link: '/compliance/data_register' }] : []),
  ];

  const mockdata = [
    ...(hasAnalyticsList ? [{ label: t('navigation.dashboards'), icon: IconGauge, links: [{ label: t('navigation.complianceDashboard'), link: '/' }, { label: t('navigation.assetsDashboard'), link: '/assets' }] }] : []),
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
    ...(complianceLinks.length > 0 ? [{ label: t('navigation.compliance'), icon: IconChecklist, links: complianceLinks }] : []),
    ...(hasDocumentsList ? [{ label: t('navigation.documents'), icon: IconFile, link: '/documents' }] : []),
    { label: t('navigation.settings'), icon: IconAdjustments, link: '/settings' },

  ];

  useEffect(() => {
    if (isCollapsed) {
      setOpenGroupLabel(null);
      return;
    }
    const currentPath = router.pathname;
    const matched = mockdata.find((item: any) => {
      if (Array.isArray(item.links)) {
        return item.links.some((l: any) => l.link === currentPath);
      }
      return item.link === currentPath;
    });
    setOpenGroupLabel(matched ? matched.label : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, isCollapsed]);

  const links = mockdata.map((item) => (
    <LinksGroup
      {...item}
      key={item.label}
      collapsed={isCollapsed}
      opened={openGroupLabel === item.label}
      onToggle={() =>
        setOpenGroupLabel((prev) => (prev === item.label ? null : item.label))
      }
    />
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