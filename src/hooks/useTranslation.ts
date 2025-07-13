import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { t, locale, setLocale } = useLanguage();
  
  return {
    t,
    locale,
    setLocale,
    // Helper function for conditional translations
    tIf: (condition: boolean, key: string, fallback: string = '') => {
      return condition ? t(key) : fallback;
    },
    // Helper function for pluralization
    tPlural: (key: string, count: number, values?: Record<string, any>) => {
      return t(key, { count, ...values });
    }
  };
}; 