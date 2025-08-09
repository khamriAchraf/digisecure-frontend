import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  widthExpanded: number;
  widthCollapsed: number;
  width: number;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

const STORAGE_KEY = 'sidebar-collapsed';
const DEFAULT_WIDTH_EXPANDED = 300;
const DEFAULT_WIDTH_COLLAPSED = 72;

export function SidebarProvider({ children }: PropsWithChildren) {
  const [collapsed, setCollapsedState] = useState<boolean>(false);

  // Hydrate state from localStorage on client
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored === '1') {
        setCollapsedState(true);
      } else if (stored === '0') {
        setCollapsedState(false);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
      }
    } catch {
      // ignore storage errors
    }
  }, [collapsed]);

  const setCollapsed = (value: boolean) => setCollapsedState(value);
  const toggleCollapsed = () => setCollapsedState((v) => !v);

  const value = useMemo<SidebarContextValue>(() => {
    const width = collapsed ? DEFAULT_WIDTH_COLLAPSED : DEFAULT_WIDTH_EXPANDED;
    return {
      collapsed,
      setCollapsed,
      toggleCollapsed,
      widthExpanded: DEFAULT_WIDTH_EXPANDED,
      widthCollapsed: DEFAULT_WIDTH_COLLAPSED,
      width,
    };
  }, [collapsed]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return ctx;
}


