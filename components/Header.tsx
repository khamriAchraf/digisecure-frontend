import { Group, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSession, signOut } from 'next-auth/react';
import { Breadcrumbs } from './Breadcrumbs';
import { UserButton } from './UserButton';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <Group justify="space-between" h="100%" px="md" w="100%">
      <Group>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Breadcrumbs />
      </Group>
      <Group>
        <LanguageSwitcher />
        <div>
          {session && (
            <UserButton
              user={session.user}
              onSignOut={handleSignOut}
            />
          )}
        </div>

      </Group>
    </Group>
  );
} 