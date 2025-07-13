import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Alert } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && status === 'authenticated') {
      router.push('/');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Registration failed');
    }
    
    setLoading(false);
  };

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
      <Title ta="center">Create an account</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Sign up to get started
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mt="md"
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            mt="md"
          />
          
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="md">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert icon={<IconCheck size={16} />} title="Success" color="green" mt="md">
              {success}
            </Alert>
          )}
          
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Create account
          </Button>
        </form>
        
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