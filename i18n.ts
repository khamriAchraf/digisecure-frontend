// Supported locales
export const locales = ['en', 'fr', 'ar'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Import messages
import enMessages from './messages/en.json';
import frMessages from './messages/fr.json';
import arMessages from './messages/ar.json';

const messages = {
  en: enMessages,
  fr: frMessages,
  ar: arMessages,
};

// Get the current locale (you can store this in localStorage, context, etc.)
export const getCurrentLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('locale') as Locale) || defaultLocale;
  }
  return defaultLocale;
};

// Set the current locale
export const setCurrentLocale = (locale: Locale) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
};

// Get messages for current locale
export const getMessages = () => {
  const currentLocale = getCurrentLocale();
  return messages[currentLocale];
};

// Simple translation function
export const t = (key: string, values?: Record<string, any>): string => {
  const currentMessages = getMessages();
  
  // Navigate through nested object using dot notation
  const keys = key.split('.');
  let message: any = currentMessages;
  
  for (const k of keys) {
    if (message && typeof message === 'object' && k in message) {
      message = message[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  if (typeof message !== 'string') {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  if (values) {
    return message.replace(/\{(\w+)\}/g, (match: string, key: string) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  }
  
  return message;
}; 