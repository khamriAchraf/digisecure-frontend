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

export function Navbar() {
  const { t } = useLanguage();

  const mockdata = [
    { label: t('navigation.dashboard'), icon: IconGauge },
    {
      label: t('navigation.assets'),
      icon: IconNotes,
      initiallyOpened: true,
      links: [
        { label: t('assets.overview'), link: '/assets' },
        { label: t('assets.forecasts'), link: '/assets/forecasts' },
        { label: t('assets.outlook'), link: '/assets/outlook' },
        { label: t('assets.realTime'), link: '/assets/real-time' },
      ],
    },
    {
      label: t('navigation.administration'),
      icon: IconCalendarStats,
      links: [
        { label: t('administration.users'), link: '/admin/users' },
        { label: t('administration.groups'), link: '/admin/groups' },
        { label: t('administration.roles'), link: '/admin/roles' },
        { label: t('administration.dictionaries'), link: '/admin/dictionaries' },
      ],
    },
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