import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Alert, LoadingOverlay, Modal, Stack, Group, Loader } from '@mantine/core';
import { IconAlertCircle, IconBriefcase } from '@tabler/icons-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoModalOpened, setDemoModalOpened] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoReady, setDemoReady] = useState(false);
  const [demoError, setDemoError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && status === 'authenticated') {
      const callbackUrl = router.query.callbackUrl as string;
      const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/';
      router.push(redirectUrl);
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const callbackUrl = router.query.callbackUrl as string;
    const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/';
    
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl: redirectUrl,
    });
    
    setLoading(false);
    
    if (res?.error) {
      setError(t('auth.invalidCredentials'));
    }
  };

  const handleRecruiterAccess = async () => {
    setDemoModalOpened(true);
    setDemoLoading(true);
    setDemoReady(false);
    setDemoError('');

    try {
      const response = await fetch('/api/demo-credentials', { cache: 'no-store' });
      if (!response.ok) {
        setDemoError(t(
          response.status === 503
            ? 'auth.recruiterDemoUnavailable'
            : 'auth.recruiterDemoLoadFailed'
        ));
        return;
      }

      const credentials: { email: string; password: string } = await response.json();
      setEmail(credentials.email);
      setPassword(credentials.password);
      setError('');
      setDemoReady(true);
    } catch {
      setDemoError(t('auth.recruiterDemoLoadFailed'));
    } finally {
      setDemoLoading(false);
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

          <Text ta="right" mt="md" size='sm'>
            <Link href="/forgot-password" target="_blank" >
              {t('auth.forgotPassword')}
            </Link>
          </Text>
          <Button
            type="button"
            variant="light"
            fullWidth
            mt="md"
            leftSection={<IconBriefcase size={16} />}
            loading={demoLoading}
            onClick={handleRecruiterAccess}
          >
            {t('auth.recruiterAccess')}
          </Button>
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            {t('auth.signIn')}
          </Button>
        </form>
      </Paper>
      <Modal
        opened={demoModalOpened}
        onClose={() => setDemoModalOpened(false)}
        title={t('auth.recruiterDemoTitle')}
        centered
      >
        <Stack gap="md">
          <Text>{t('auth.recruiterDemoGreeting')}</Text>
          <Text>{t('auth.recruiterDemoDescription')}</Text>
          <Text fw={600}>{t('auth.recruiterColdStartNotice')}</Text>
          {demoLoading && (
            <Group gap="sm">
              <Loader size="sm" />
              <Text>{t('auth.recruiterDemoLoading')}</Text>
            </Group>
          )}
          {demoReady && <Alert color="green">{t('auth.recruiterDemoReady')}</Alert>}
          {demoError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {demoError}
            </Alert>
          )}
        </Stack>
      </Modal>
    </Container>
  );
} 