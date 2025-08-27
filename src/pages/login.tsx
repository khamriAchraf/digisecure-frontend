import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Alert, LoadingOverlay } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && status === 'authenticated') {
      router.push('/');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl: '/',
    });
    
    setLoading(false);
    
    if (res?.error) {
      setError(t('auth.invalidCredentials'));
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return <LoadingOverlay visible={true} />;
  }

  if (session) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">{t('auth.welcomeBack')}</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t('auth.signInToAccount')}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label={t('common.email')}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
          />
          <PasswordInput
            label={t('common.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mt="md"
          />
          
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title={t('common.error')} color="red" mt="md">
              {error}
            </Alert>
          )}
          
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            {t('auth.signIn')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 