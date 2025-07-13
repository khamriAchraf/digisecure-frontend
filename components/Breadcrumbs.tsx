import { Breadcrumbs as MantineBreadcrumbs, Anchor } from '@mantine/core';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from '../src/hooks/useTranslation';

export function Breadcrumbs() {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Generate breadcrumbs from the current path
  const generateBreadcrumbs = () => {
    const pathSegments = router.asPath.split('/').filter(segment => segment !== '');
    
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

  return (
    <MantineBreadcrumbs>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        if (isLast) {
          return (
            <span key={item.href} style={{ color: 'var(--mantine-color-gray-6)' }}>
              {item.label}
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