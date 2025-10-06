import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Alert, LoadingOverlay } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useResetPassword } from '../../mutations';

export default function ResetPassword() {
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [token, setToken] = useState('');
  const { mutate: resetPassword, isLoading: isResetPasswordLoading } = useResetPassword();

  useEffect(() => {
    setToken(router.query.token as string);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const callbackUrl = router.query.callbackUrl as string;
    const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/';
    
    const res = await resetPassword({
      token,
      password,
    });
    
    setLoading(false);
    
    //@ts-ignore
    if (res?.success === false || res?.message) {
      //@ts-ignore
      setError(res?.message || t('auth.invalidToken'));
    }
  };


  if (!token) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">{t('auth.resetPassword')}</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t('auth.resetPasswordDescription')}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <PasswordInput
            label={t('common.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mt="md"
          />
          <PasswordInput
            label={t('common.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword!=='' && confirmPassword !== password ? t('auth.passwordsDoNotMatch') : ''}
            required
            mt="md"
          />
          
          <Button type="submit" fullWidth mt="xl" loading={isResetPasswordLoading}>
            {t('common.send')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 