import { useState, useEffect } from 'react';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';
import { Box, Collapse, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import classes from '@/styles/NavbarLinksGroup.module.css';
import { useRouter } from 'next/router';

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links }: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const router = useRouter();
  const [opened, setOpened] = useState(initiallyOpened || false);

  // Check if current route matches any of the links in this group
  const isCurrentSection = hasLinks && links.some(link => {
    // Check if current pathname starts with the link path
    // This handles both exact matches and nested routes
    return router.pathname === link.link || router.pathname.startsWith(link.link + '/');
  });

  // Check if a specific link is active
  const isLinkActive = (linkPath: string) => {
    return router.pathname === linkPath || router.pathname.startsWith(linkPath + '/');
  };

  // Auto-open the section if it contains the current page
  useEffect(() => {
    if (isCurrentSection) {
      setOpened(true);
    }
  }, [isCurrentSection, router.pathname]);

  const items = (hasLinks ? links : []).map((link) => (
    <Text<'a'>
      component="a"
      className={`${classes.link} ${isLinkActive(link.link) ? classes.linkActive : ''}`}
      href={link.link}
      key={link.label}
      onClick={(event) => {
        event.preventDefault();
        router.push(link.link);
      }}
    >
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton 
        onClick={() => setOpened((o) => !o)} 
        className={`${classes.control} ${isCurrentSection ? classes.controlActive : ''}`}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={16}
              style={{ transform: opened ? 'rotate(-90deg)' : 'none' }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}

const mockdata = {
  label: 'Releases',
  icon: IconCalendarStats,
  links: [
    { label: 'Upcoming releases', link: '/' },
    { label: 'Previous releases', link: '/' },
    { label: 'Releases schedule', link: '/' },
  ],
};

export function NavbarLinksGroup() {
  return (
    <Box mih={220} p="md">
      <LinksGroup {...mockdata} />
    </Box>
  );
}