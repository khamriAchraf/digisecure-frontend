import React from 'react';

// Utility types for the frontend application

// Form types
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

// Validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule;
};

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
}

// Pagination types
export interface PaginationParams {
  page: number;
  per_page: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

// Table types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string | number;
}

export interface TableState<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectedRows: T[];
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  filters: Record<string, any>;
  pagination: PaginationParams;
}

// Modal and dialog types
export interface ModalState {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Route types
export interface Route {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
  title?: string;
  icon?: string;
}

// Breadcrumb types
export interface Breadcrumb {
  label: string;
  path?: string;
  icon?: string;
}

// Menu types
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
  disabled?: boolean;
}

// File upload types
export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Date range types
export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

// Select option types
export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string;
}

// Tree node types
export interface TreeNode<T = any> {
  id: string | number;
  label: string;
  data?: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Table configuration types
export interface PersistedTableConfig {
  table_key: string;          // e.g. 'users', 'groups' …
  columns: string[];          // list of column keys the user chose
} 

export const toDateOnly = (val: any) => {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return val || null;
};

/**
 * Converts a value to ISO date string safely
 */
export const toISODateString = (val: Date | string | null | undefined): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val.split('T')[0];
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return null;
};

/**
 * Parses a frequency string and returns the number of days
 * Supports: Daily, Weekly, Monthly, Quarterly, Yearly, or custom "X days/weeks/months/years"
 */
export const parseFrequencyToDays = (frequency: string | null | undefined): number | null => {
  if (!frequency) return null;
  
  const normalized = frequency.toLowerCase().trim();
  
  // Common frequencies in French and English
  if (/^(daily|quotidien|journalier)$/i.test(normalized)) return 1;
  if (/^(weekly|hebdomadaire)$/i.test(normalized)) return 7;
  if (/^(bi-?weekly|bihebdomadaire)$/i.test(normalized)) return 14;
  if (/^(monthly|mensuel)$/i.test(normalized)) return 30;
  if (/^(bi-?monthly|bimensuel)$/i.test(normalized)) return 60;
  if (/^(quarterly|trimestriel)$/i.test(normalized)) return 90;
  if (/^(semi-?annual|semestriel)$/i.test(normalized)) return 180;
  if (/^(annual|yearly|annuel)$/i.test(normalized)) return 365;
  
  // Parse custom formats like "30 days", "3 months", "2 weeks", etc.
  const customMatch = normalized.match(/(\d+)\s*(day|week|month|year|jour|semaine|mois|année)/i);
  if (customMatch) {
    const value = parseInt(customMatch[1], 10);
    const unit = customMatch[2].toLowerCase();
    
    if (/^(day|jour)/.test(unit)) return value;
    if (/^(week|semaine)/.test(unit)) return value * 7;
    if (/^(month|mois)/.test(unit)) return value * 30;
    if (/^(year|année)/.test(unit)) return value * 365;
  }
  
  return null;
};

/**
 * Calculates the next due date based on last done date and frequency
 */
export const calculateNextDueDate = (
  lastDoneDate: Date | string | null | undefined,
  frequency: string | null | undefined
): Date | null => {
  if (!lastDoneDate || !frequency) return null;
  
  const days = parseFrequencyToDays(frequency);
  if (days === null) return null;
  
  const baseDate = typeof lastDoneDate === 'string' 
    ? new Date(lastDoneDate) 
    : lastDoneDate;
  
  if (isNaN(baseDate.getTime())) return null;
  
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  
  return nextDate;
};

// Event status utilities
export type EventStatus = 'overdue' | 'upcoming' | 'done' | 'unknown';

export interface EventStatusResult {
  status: EventStatus;
  color: string;
  label: string;
  relativeTime: string;
}

/**
 * Determines the status of a compliance event based on dates
 */
export const getEventStatus = (
  nextDueDate?: string | null,
  lastDoneDate?: string | null
): EventStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (nextDueDate) {
    const dueDate = new Date(nextDueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return 'overdue';
    } else {
      return 'upcoming';
    }
  }

  if (lastDoneDate) {
    return 'done';
  }

  return 'unknown';
};

/**
 * Formats relative time in a human-readable format
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const absDays = Math.abs(diffDays);

  if (absDays === 0) {
    return 'Aujourd\'hui';
  } else if (absDays === 1) {
    return diffDays > 0 ? 'Demain' : 'Hier';
  } else if (absDays < 7) {
    return diffDays > 0 ? `dans ${absDays} jours` : `${absDays} jours`;
  } else if (absDays < 30) {
    const weeks = Math.floor(absDays / 7);
    return diffDays > 0 
      ? `dans ${weeks} semaine${weeks > 1 ? 's' : ''}`
      : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (absDays < 365) {
    const months = Math.floor(absDays / 30);
    return diffDays > 0
      ? `dans ${months} mois`
      : `${months}`;
  } else {
    const years = Math.floor(absDays / 365);
    return diffDays > 0
      ? `dans ${years} année${years > 1 ? 's' : ''}`
      : `${years} année${years > 1 ? 's' : ''}`;
  }
};

/**
 * Gets complete event status information including color and relative time
 */
export const getEventStatusInfo = (
  nextDueDate?: string | null,
  lastDoneDate?: string | null
): EventStatusResult => {
  const status = getEventStatus(nextDueDate, lastDoneDate);
  
  let color: string;
  let label: string;
  let relativeTime = '';

  switch (status) {
    case 'overdue':
      color = 'red';
      label = 'En retard';
      if (nextDueDate) {
        relativeTime = `En retard depuis ${getRelativeTime(nextDueDate)}`;
      }
      break;
    case 'upcoming':
      color = 'blue';
      label = 'À faire';
      if (nextDueDate) {
        relativeTime = `À faire ${getRelativeTime(nextDueDate)}`;
      }
      break;
    case 'done':
      color = 'dimmed';
      label = 'Terminé';
      if (lastDoneDate) {
        relativeTime = `Terminé depuis ${getRelativeTime(lastDoneDate)}`;
      }
      break;
    default:
      color = 'gray';
      label = 'Aucun planning';
      relativeTime = 'Aucune date définie';
      break;
  }

  return { status, color, label, relativeTime };
};