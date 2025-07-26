import React from 'react';
import { ActionIcon, Menu, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { 
  IconSun, 
  IconMoon, 
  IconDeviceDesktop,
  IconPalette 
} from '@tabler/icons-react';
import { useTheme } from '../src/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { colorScheme, setColorScheme, resolvedColorScheme } = useTheme();
  const { colorScheme: mantineColorScheme } = useMantineColorScheme();

  const getCurrentIcon = () => {
    if (colorScheme === 'auto') {
      return <IconDeviceDesktop size={20} />;
    }
    return colorScheme === 'dark' ? <IconMoon size={20} /> : <IconSun size={20} />;
  };

  const getCurrentTooltip = () => {
    if (colorScheme === 'auto') {
      return `Auto (${resolvedColorScheme})`;
    }
    return colorScheme === 'dark' ? 'Dark mode' : 'Light mode';
  };

  const themes = [
    { 
      value: 'light' as const, 
      label: 'Light', 
      icon: <IconSun size={16} />,
      description: 'Light theme'
    },
    { 
      value: 'dark' as const, 
      label: 'Dark', 
      icon: <IconMoon size={16} />,
      description: 'Dark theme'
    },
    { 
      value: 'auto' as const, 
      label: 'Auto', 
      icon: <IconDeviceDesktop size={16} />,
      description: 'Follow system preference'
    }
  ];

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label={getCurrentTooltip()} position="bottom">
          <ActionIcon variant="subtle" size="lg">
            {getCurrentIcon()}
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Theme</Menu.Label>
        {themes.map((theme) => (
          <Menu.Item
            key={theme.value}
            onClick={() => setColorScheme(theme.value)}
            leftSection={theme.icon}
            style={{
              fontWeight: colorScheme === theme.value ? 'bold' : 'normal'
            }}
          >
            <div>
              <Text size="sm">{theme.label}</Text>
              <Text size="xs" c="dimmed">{theme.description}</Text>
            </div>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}; 