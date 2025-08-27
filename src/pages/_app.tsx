import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/nprogress/styles.css';
import 'mantine-contextmenu/styles.layer.css';
import '@mantine/dates/styles.css';
import { SessionProvider } from 'next-auth/react';
import { ContextMenuProvider } from 'mantine-contextmenu';

import type { AppProps } from 'next/app';
import { NavigationProgress } from '@mantine/nprogress';
import { createTheme, MantineProvider, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Header } from '../../components/Header';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ModalsProvider } from '@mantine/modals';

const theme = createTheme({

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
  const { width } = useSidebar();

  useEffect(() => {
    if (!session && router.pathname !== '/login' && router.pathname !== '/register') {
      router.push('/login');
    }
  }, [session, status, router]);

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
          width,
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
}

function AppWithDirection(props: AppProps) {
  const { locale } = useLanguage();

  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <NavigationProgress />
        <Notifications position="bottom-right" zIndex={2077} />
        <ThemeProvider>
          <ContextMenuProvider>
            <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <AppContent {...props} />
            </div>
          </ContextMenuProvider>
        </ThemeProvider></ModalsProvider>
    </MantineProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <LanguageProvider>
      <SessionProvider session={props.pageProps.session}>
        <SidebarProvider>
          <AppWithDirection {...props} />
        </SidebarProvider>
      </SessionProvider>
    </LanguageProvider>
  );
}