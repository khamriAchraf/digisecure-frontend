import {
  IconAdjustments,
  IconCalendarStats,
  IconFileAnalytics,
  IconGauge,
  IconLock,
  IconNotes,
  IconPresentationAnalytics,
} from '@tabler/icons-react';
import { Code, Group, ScrollArea } from '@mantine/core';
import classes from '@/styles/Navbar.module.css';
import { LinksGroup } from './NavbarLinksGroup';
import Image from 'next/image';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useHasPermission, PERMISSIONS } from '../src/hooks/usePermissions';

export function Navbar() {
  const { t } = useLanguage();
  
  // Permission checks
  const hasComputersRead = useHasPermission(PERMISSIONS.COMPUTER_READ);
  const hasNetworkDevicesRead = useHasPermission(PERMISSIONS.NETWORK_DEVICE_READ);
  const hasVirtualMachinesRead = useHasPermission(PERMISSIONS.VIRTUAL_MACHINE_READ);
  const hasSoftwareRead = useHasPermission(PERMISSIONS.SOFTWARE_READ);
  const hasUserRead = useHasPermission(PERMISSIONS.USER_READ);
  const hasRoleRead = useHasPermission(PERMISSIONS.ROLE_READ);
  const hasGroupRead = useHasPermission(PERMISSIONS.GROUP_READ);
  const hasConfigurationRead = useHasPermission(PERMISSIONS.CONFIGURATION_READ);

  // Build administration links based on permissions
  const adminLinks = [
    // Only show users link if user has user read permission
    ...(hasUserRead ? [{ label: t('administration.users'), link: '/admin/users' }] : []),
    // Only show groups link if user has group read permission
    ...(hasGroupRead ? [{ label: t('administration.groups'), link: '/admin/groups' }] : []),
    // Only show roles link if user has role read permission
    ...(hasRoleRead ? [{ label: t('administration.roles'), link: '/admin/roles' }] : []),
    // Only show dictionaries link if user has configuration read permission
    ...(hasConfigurationRead ? [{ label: t('administration.dictionaries'), link: '/admin/dictionaries' }] : []),
  ];

  // Build navigation data with permission filtering
  const mockdata = [
    { label: t('navigation.dashboard'), icon: IconGauge },
    // Assets section - only show if user has asset read permission
    ...(hasComputersRead || hasNetworkDevicesRead || hasVirtualMachinesRead || hasSoftwareRead ? [{
      label: t('navigation.assets'),
      icon: IconNotes,
      links: [
        ...(hasComputersRead ? [{ label: t('assets.computers'), link: '/assets/computers' }] : []),
        ...(hasNetworkDevicesRead ? [{ label: t('assets.network_devices'), link: '/assets/network_devices' }] : []),
        ...(hasVirtualMachinesRead ? [{ label: t('assets.virtual_machines'), link: '/assets/virtual_machines' }] : []),
        ...(hasSoftwareRead ? [{ label: t('assets.software'), link: '/assets/software' }] : []),
      ],
    }] : []),
    // Administration section - only show if user has any admin read permissions AND there are visible links
    ...(adminLinks.length > 0 ? [{
      label: t('navigation.administration'),
      icon: IconCalendarStats,
      links: adminLinks,
    }] : []),
    // TODO: Add permissions for these sections when backend supports them
    // For now, these are visible to all authenticated users
    { label: t('navigation.analytics'), icon: IconPresentationAnalytics },
    { label: t('navigation.contracts'), icon: IconFileAnalytics },
    { label: t('navigation.settings'), icon: IconAdjustments },
    {
      label: t('navigation.security'),
      icon: IconLock,
      links: [
        { label: t('security.enable2FA'), link: '/' },
        { label: t('security.changePassword'), link: '/' },
        { label: t('security.recoveryCodes'), link: '/' },
      ],
    },
  ];

  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Image src="/logo.png" alt="logo" width={120} height={120} />
          <Code fw={700}>v0.1.0</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>
    </nav>
  );
}