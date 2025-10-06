import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Alert, LoadingOverlay } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useForgotPassword } from '@/mutations';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { mutate: forgotPassword, isLoading: isForgotPasswordLoading } = useForgotPassword();

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
    setInfo('');
    setLoading(true);
    
    const callbackUrl = router.query.callbackUrl as string;
    const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/';
    
    const res = await forgotPassword({
      email,
      callbackUrl: redirectUrl,
    });
    
    setLoading(false);
    
    //@ts-ignore
    if (res) {
      //@ts-ignore
      setInfo(t('auth.resetPasswordEmailSent'));
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
      <Title ta="center">{t('auth.forgotPassword')}</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t('auth.sendResetPasswordEmailDescription')}
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
          
          {info && (
            <Alert icon={<IconAlertCircle size={16} />} title={t('common.info')} color="gray" mt="md">
              {info}
            </Alert>
          )}

          <Text ta="right" mt="md" size='sm'>
            <Link href="/login" target="_blank" >
              {t('auth.signIn')}
            </Link>
          </Text>
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            {t('common.send')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 