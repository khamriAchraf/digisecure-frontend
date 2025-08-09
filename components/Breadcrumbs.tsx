import { Breadcrumbs as MantineBreadcrumbs, Anchor, CopyButton, Tooltip, ActionIcon, Group } from '@mantine/core';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from '../src/hooks/useTranslation';
import { IconCopy, IconCheck } from '@tabler/icons-react';

export function Breadcrumbs() {
  const router = useRouter();
  const { t } = useTranslation();

  // Generate breadcrumbs from the current path
  const generateBreadcrumbs = () => {
    // Ignore query string when building the segments
    const pathname = router.asPath.split('?')[0];
    const pathSegments = pathname.split('/').filter((segment) => segment !== '');

    if (pathSegments.length === 0) {
      return [{ label: t('breadcrumbs.home'), href: '/' }];
    }

    const breadcrumbs = [{ label: t('breadcrumbs.home'), href: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Try to get translation for the segment, fallback to formatted segment
      const translationKey = `breadcrumbs.${segment}`;
      const label = t(translationKey) !== translationKey
        ? t(translationKey)
        : segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Heuristics to decide if a segment is an ID (numbers or UUID-like)
  const isLikelyId = (value: string) => {
    const numeric = /^\d+$/.test(value);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    return numeric || uuid;
  };

  // Prefer dynamic route param if available, fallback to last segment
  const routeIdParam = (() => {
    const q = router.query?.id;
    if (Array.isArray(q)) return q[0];
    if (typeof q === 'string') return q;
    return undefined;
  })();
  const lastSegment = breadcrumbItems.length > 0 ? breadcrumbItems[breadcrumbItems.length - 1].label : undefined;
  const resolvedId = routeIdParam ?? lastSegment;

  return (
    <MantineBreadcrumbs>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        if (isLast) {
          const showAsId = typeof resolvedId === 'string' && isLikelyId(resolvedId);
          if (!showAsId) {
            return (
              <span
                key={item.href}
                style={{
                  color: 'var(--mantine-color-dimmed)',
                  fontSize: 'var(--mantine-font-size-sm)',
                }}
              >
                {item.label}
              </span>
            );
          }

          return (
            <span
              key={item.href}
            >
              <Group gap="xs">
                <span style={{ color: 'var(--mantine-color-dimmed)', fontSize: 'var(--mantine-font-size-md)' }}>id: {resolvedId}</span>
                <CopyButton value={resolvedId} timeout={1500}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy id'} withArrow position="bottom">
                      <ActionIcon
                        variant="transparent"
                        size="xs"
                        color="gray"
                        onClick={copy}
                        aria-label="Copy id"
                        style={{ color: 'var(--mantine-color-dimmed)' }}
                      >
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>

            </span>
          );
        }

        return (
          <Anchor
            key={item.href}
            component={Link}
            href={item.href}
            size="sm"
            c="dimmed"
          >
            {item.label}
          </Anchor>
        );
      })}
    </MantineBreadcrumbs>
  );
} 