import { useUsers } from '../../../fetchers';
import { Container, Text, Loader, Alert, Stack, Paper } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function AdminUsersPage() {
  const { users, isLoading, isError } = useUsers();

  if (isLoading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {isError.message || 'Failed to load users'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack>
        {users && users.length > 0 ? (
          users.map((u: any) => (
            <Paper key={u.id} p="md" shadow="xs">
              <Text fw={500}>{u.full_name || u.username}</Text>
              <Text size="sm" c="dimmed">
                {u.email}
              </Text>
            </Paper>
          ))
        ) : (
          <Text>No users found.</Text>
        )}
      </Stack>
    </Container>
  );
}
