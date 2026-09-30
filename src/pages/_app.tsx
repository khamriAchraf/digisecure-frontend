import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/nprogress/styles.css';
import 'mantine-contextmenu/styles.layer.css';
import '@mantine/dates/styles.css';
import "react-big-calendar/lib/css/react-big-calendar.css";
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

  primaryColor: 'orange',
  fontFamily: 'Inter, sans-serif',
  components: {
    AppShell: {
      styles: {
        main: {
          background: 'var(--mantine-color-body)',
        },
      },
    },
    DatePickerInput: {
      defaultProps: {
        valueFormat: 'DD-MM-YYYY',
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

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/reset-password','/forgot-password'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    if (!session && !isPublicRoute) {
      // Store the current path as callback URL for after login
      const callbackUrl = encodeURIComponent(router.asPath);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [session, status, router, isPublicRoute]);

  // Show public pages without AppShell layout
  if (isPublicRoute) {
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

      <ThemeProvider>
        <ModalsProvider>
          <NavigationProgress />
          <Notifications position="bottom-right" zIndex={2077} />
          <ContextMenuProvider>
            <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <AppContent {...props} />
            </div>
          </ContextMenuProvider></ModalsProvider>
      </ThemeProvider>
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