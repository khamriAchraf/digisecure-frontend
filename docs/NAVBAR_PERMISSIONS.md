# Navbar Permission-Based Filtering

The navbar has been updated to show only the sections that the connected user has read access to, improving the user experience by hiding irrelevant navigation items.

## How It Works

The navbar uses the existing permission system to filter navigation items based on the user's permissions. Each section is only displayed if the user has the appropriate read permissions.

## Features

### Permission-Based Filtering
- Sections are only shown if the user has the required read permissions
- Individual links within sections are filtered based on specific permissions

### Automatic Section Opening
- The section containing the current page automatically opens
- Users can still manually open/close any section
- Supports nested routes (e.g., `/admin/users/new` will open the Administration section)

### Active Link Highlighting
- The current page link is highlighted with a blue background and border
- The section containing the current page is also highlighted
- Visual feedback helps users understand their current location

## Permission Requirements

### Assets Section
- **Required Permission**: `asset:read`
- **Shows**: Overview, Forecasts, Outlook, Real-time
- **Hidden if**: User doesn't have asset read permission

### Administration Section
The administration section is only shown if the user has at least one of the following permissions:
- `user:read` - Shows Users link
- `group:read` - Shows Groups link  
- `role:read` - Shows Roles link
- `configuration:read` - Shows Dictionaries link

**Note**: If the user has no admin read permissions, the entire Administration section is hidden.

### Other Sections
Currently, the following sections are visible to all authenticated users (no permission filtering):
- Dashboard
- Analytics
- Contracts
- Settings
- Security

These sections can be permission-controlled in the future by adding the corresponding permissions to the backend and updating the navbar logic.

## Implementation Details

### Permission Checks
The navbar uses the `useHasPermission` hook to check user permissions:

```typescript
const hasAssetRead = useHasPermission(PERMISSIONS.ASSET_READ);
const hasUserRead = useHasPermission(PERMISSIONS.USER_READ);
const hasRoleRead = useHasPermission(PERMISSIONS.ROLE_READ);
const hasGroupRead = useHasPermission(PERMISSIONS.GROUP_READ);
const hasConfigurationRead = useHasPermission(PERMISSIONS.CONFIGURATION_READ);
```

### Conditional Rendering
Sections are conditionally rendered using the spread operator:

```typescript
// Assets section - only show if user has asset read permission
...(hasAssetRead ? [{
  label: t('navigation.assets'),
  icon: IconNotes,
  links: [
    { label: t('assets.overview'), link: '/assets' },
    // ... other links
  ],
}] : []),
```

### Administration Links
Administration links are built dynamically based on permissions:

```typescript
const adminLinks = [
  ...(hasUserRead ? [{ label: t('administration.users'), link: '/admin/users' }] : []),
  ...(hasGroupRead ? [{ label: t('administration.groups'), link: '/admin/groups' }] : []),
  ...(hasRoleRead ? [{ label: t('administration.roles'), link: '/admin/roles' }] : []),
  ...(hasConfigurationRead ? [{ label: t('administration.dictionaries'), link: '/admin/dictionaries' }] : []),
];

// Only show administration section if there are visible links
...(adminLinks.length > 0 ? [{
  label: t('navigation.administration'),
  icon: IconCalendarStats,
  links: adminLinks,
}] : []),
```

### Route-Based Auto-Opening
The navbar automatically opens the section containing the current page:

```typescript
// Check if current route matches any of the links in this group
const isCurrentSection = hasLinks && links.some(link => {
  // Check if current pathname starts with the link path
  // This handles both exact matches and nested routes
  return router.pathname === link.link || router.pathname.startsWith(link.link + '/');
});

// Auto-open the section if it contains the current page
useEffect(() => {
  if (isCurrentSection) {
    setOpened(true);
  }
}, [isCurrentSection, router.pathname]);
```

### Active Link Detection
Links are highlighted based on the current route:

```typescript
// Check if a specific link is active
const isLinkActive = (linkPath: string) => {
  return router.pathname === linkPath || router.pathname.startsWith(linkPath + '/');
};

// Apply active class to links
className={`${classes.link} ${isLinkActive(link.link) ? classes.linkActive : ''}`}
```

## Future Enhancements

### Adding Permission Control to Other Sections
To add permission control to other sections, follow these steps:

1. **Add permissions to the backend** (if not already present)
2. **Add permission constants** to `src/hooks/usePermissions.ts`:

```typescript
// Analytics permissions
ANALYTICS_READ: "analytics:read",
ANALYTICS_CREATE: "analytics:create",
// ... etc

// Contract permissions  
CONTRACT_READ: "contract:read",
CONTRACT_CREATE: "contract:create",
// ... etc

// Settings permissions
SETTINGS_READ: "settings:read",
SETTINGS_UPDATE: "settings:update",

// Security permissions
SECURITY_READ: "security:read",
SECURITY_UPDATE: "security:update",
SECURITY_2FA_MANAGE: "security:2fa:manage",
```

3. **Update the navbar** to use the new permissions:

```typescript
const hasAnalyticsRead = useHasPermission(PERMISSIONS.ANALYTICS_READ);
const hasContractRead = useHasPermission(PERMISSIONS.CONTRACT_READ);
const hasSettingsRead = useHasPermission(PERMISSIONS.SETTINGS_READ);
const hasSecurityRead = useHasPermission(PERMISSIONS.SECURITY_READ);

// Then conditionally render these sections
...(hasAnalyticsRead ? [{ label: t('navigation.analytics'), icon: IconPresentationAnalytics }] : []),
...(hasContractRead ? [{ label: t('navigation.contracts'), icon: IconFileAnalytics }] : []),
// ... etc
```

## Testing

To test different permission scenarios:

1. **User with no permissions**: Only Dashboard, Analytics, Contracts, Settings, and Security should be visible
2. **User with asset read only**: Dashboard, Assets, Analytics, Contracts, Settings, and Security should be visible
3. **User with admin permissions**: All sections should be visible
4. **User with partial admin permissions**: Only the specific admin sections they have access to should be visible

### Testing Auto-Opening and Highlighting

1. **Navigate to `/admin/users`**: Administration section should open automatically, Users link should be highlighted
2. **Navigate to `/assets`**: Assets section should open automatically, Overview link should be highlighted
3. **Navigate to `/admin/users/new`**: Administration section should open, Users link should be highlighted (nested route)
4. **Manually close a section**: Should stay closed until you navigate to a page in that section
5. **Navigate to a different section**: Previous section should close, new section should open

## Benefits

- **Improved UX**: Users only see navigation items they can actually access
- **Reduced confusion**: No broken links or inaccessible pages in navigation
- **Better navigation**: Automatic section opening and link highlighting
- **Security**: Visual indication of user permissions
- **Scalability**: Easy to add new permission-controlled sections
- **Maintainability**: Centralized permission logic in the navbar component 