import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Paper, Title, Container, Text } from '@mantine/core';

export default function Register() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && status === 'authenticated') {
      router.push('/');
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // Don't show register form if already authenticated
  if (session) {
    return <div>Redirecting...</div>;
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">Registration unavailable</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Public account registration is disabled. Contact your administrator to request an account.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Text ta="center" mt="md">
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--mantine-color-blue-6)' }}>
            Sign in
          </Link>
        </Text>
      </Paper>
    </Container>
  );
} 