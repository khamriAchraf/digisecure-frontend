// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import { SessionProvider } from 'next-auth/react';

import type { AppProps } from 'next/app';
import { createTheme, MantineProvider, AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Header } from '../../components/Header';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

const theme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  components: {
    AppShell: {
      styles: {
        main: {
          background: 'var(--mantine-color-body)',
        },
      },
    },
  },
});

function AppContent({ Component, pageProps }: AppProps) {
  const [opened, { toggle }] = useDisclosure();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = useLanguage();

  // Handle authentication redirects
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    console.log('session', session);
    console.log('status', status);
    console.log('router.pathname', router.pathname);
    // If not authenticated and not on auth pages, redirect to login
    if (!session && router.pathname !== '/login' && router.pathname !== '/register') {
      router.push('/login');
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // Show auth pages without AppShell layout
  if (router.pathname === '/login' || router.pathname === '/register') {
    return <Component {...pageProps} />;
  }

  // Show AppShell layout for authenticated users
  if (session) {
    return (
      <AppShell
        header={{ height: 60 }}
        layout="alt"
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Header opened={opened} toggle={toggle} />
        </AppShell.Header>
        <AppShell.Navbar p="0"><Navbar /></AppShell.Navbar>
        <AppShell.Main>
          <Component {...pageProps} />
        </AppShell.Main>
      </AppShell>
    );
  }

  // Show loading while redirecting
  return <div>Loading...</div>;
}

function AppWithDirection(props: AppProps) {
  const { locale } = useLanguage();
  
  return (
    <MantineProvider theme={theme}>
      <ThemeProvider>
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <AppContent {...props} />
        </div>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <LanguageProvider>
      <SessionProvider session={props.pageProps.session}>
        <AppWithDirection {...props} />
      </SessionProvider>
    </LanguageProvider>
  );
}