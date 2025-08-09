import { useState, useEffect, useRef } from 'react';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';
import { Box, Collapse, Group, Popover, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import classes from '@/styles/NavbarLinksGroup.module.css';
import { useSidebar } from '../src/contexts/SidebarContext';
import { useRouter } from 'next/router';

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string; // optional direct link for parent when no children
  collapsed?: boolean;
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link, collapsed = false }: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const router = useRouter();
  // If parent didn't pass collapsed, read from global sidebar state for robustness
  const { collapsed: sidebarCollapsed } = useSidebar();
  if (collapsed === undefined) {
    collapsed = sidebarCollapsed;
  }
  const [opened, setOpened] = useState(initiallyOpened || false);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const isHoveringTriggerRef = useRef(false);
  const isHoveringDropdownRef = useRef(false);
  const hoverCloseTimeoutRef = useRef<number | null>(null);

  const clearHoverCloseTimeout = () => {
    if (hoverCloseTimeoutRef.current !== null) {
      window.clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
  };

  const scheduleCloseIfNotHovered = () => {
    clearHoverCloseTimeout();
    hoverCloseTimeoutRef.current = window.setTimeout(() => {
      if (!isHoveringTriggerRef.current && !isHoveringDropdownRef.current) {
        setPopoverOpened(false);
      }
    }, 150);
  };

  // Check if current route matches any of the links in this group
  const isCurrentSection = hasLinks && links.some(link => {
    // Check if current pathname starts with the link path
    // This handles both exact matches and nested routes
    return router.pathname === link.link || router.pathname.startsWith(link.link + '/');
  });

  // Active state for a direct parent link (when no children)
  const isDirectLinkActive = !hasLinks && link
    ? router.pathname === link || router.pathname.startsWith(link + '/')
    : false;

  // Check if a specific link is active
  const isLinkActive = (linkPath: string) => {
    return router.pathname === linkPath || router.pathname.startsWith(linkPath + '/');
  };

  // Auto-open the section if it contains the current page
  useEffect(() => {
    if (isCurrentSection && !collapsed) {
      setOpened(true);
    }
  }, [isCurrentSection, router.pathname, collapsed]);

  useEffect(() => {
    return () => {
      clearHoverCloseTimeout();
    };
  }, []);

  const items = (hasLinks ? links : []).map((child) => (
    <Text<'a'>
      component="a"
      className={`${classes.link} ${isLinkActive(child.link) ? classes.linkActive : ''}`}
      href={child.link}
      key={child.label}
      onClick={(event) => {
        event.preventDefault();
        setPopoverOpened(false);
        router.push(child.link);
      }}
    >
      {child.label}
    </Text>
  ));

  if (collapsed) {
    // Collapsed mode: show only icon; if has children, show them in a Popover; otherwise tooltip and navigate
    const button = (
      <UnstyledButton
        onClick={() => {
          if (hasLinks) {
            setPopoverOpened((o) => !o);
          } else if (link) {
            router.push(link);
          }
        }}
        onMouseEnter={() => {
          if (hasLinks) {
            clearHoverCloseTimeout();
            isHoveringTriggerRef.current = true;
            setPopoverOpened(true);
          }
        }}
        onMouseLeave={() => {
          if (hasLinks) {
            isHoveringTriggerRef.current = false;
            scheduleCloseIfNotHovered();
          }
        }}
        className={`${classes.control} ${(isCurrentSection || isDirectLinkActive) ? classes.controlActive : ''}`}
        aria-label={label}
      >
        <Group justify="center">
          <ThemeIcon variant="light" size={30}>
            <Icon size={18} />
          </ThemeIcon>
        </Group>
      </UnstyledButton>
    );

    if (hasLinks) {
      return (
        <Popover
          opened={popoverOpened}
          onChange={setPopoverOpened}
          withArrow
          withinPortal
          position="right-start"
          offset={8}
          trapFocus={false}
        >
          <Popover.Target>{button}</Popover.Target>
          <Popover.Dropdown
            onMouseEnter={() => {
              clearHoverCloseTimeout();
              isHoveringDropdownRef.current = true;
              setPopoverOpened(true);
            }}
            onMouseLeave={() => {
              isHoveringDropdownRef.current = false;
              scheduleCloseIfNotHovered();
            }}
          >
            <Box>
              <Text fw={600} mb="xs">
                {label}
              </Text>
              {items}
            </Box>
          </Popover.Dropdown>
        </Popover>
      );
    }

    return (
      <Tooltip label={label} position="right" withArrow>
        {button}
      </Tooltip>
    );
  }

  // Expanded mode: default behavior with collapsible section
  return (
    <>
      <UnstyledButton
        onClick={() => {
          if (hasLinks) {
            setOpened((o) => !o);
          } else if (link) {
            router.push(link);
          }
        }}
        className={`${classes.control} ${(isCurrentSection || isDirectLinkActive) ? classes.controlActive : ''}`}
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