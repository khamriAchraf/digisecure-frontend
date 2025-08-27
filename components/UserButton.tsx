import { IconChevronRight, IconLogout } from '@tabler/icons-react';
import { Avatar, Group, Text, UnstyledButton, Menu, ActionIcon } from '@mantine/core';
import classes from '@/styles/UserButton.module.css';

interface UserButtonProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  onSignOut: () => void;
}

export function UserButton({ user, onSignOut }: UserButtonProps) {
  const displayName = user.name || user.email.split('@')[0];
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar
              src={null}
              radius="xl"
              color="primary"
            >
              {initials}
            </Avatar>

            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {displayName}
              </Text>

              <Text c="dimmed" size="xs">
                {user.email}
              </Text>
            </div>

            <IconChevronRight size={14} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconLogout size={14} />}
          onClick={onSignOut}
          color="red"
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}