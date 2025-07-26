# Multilingual Support

This app supports multiple languages (currently English, French, and Arabic) with a simple translation system that doesn't affect routing.

## How it works

The multilingual system uses:
- **next-intl** for translation management
- **React Context** for state management
- **localStorage** for persisting language preference
- **JSON files** for translation keys

## File Structure

```
├── messages/
│   ├── en.json          # English translations
│   └── fr.json          # French translations
│   └── ar.json          # Arabic translations
├── src/
│   ├── contexts/
│   │   └── LanguageContext.tsx  # Language state management
│   └── hooks/
│       └── useTranslation.ts    # Translation hook
├── components/
│   └── LanguageSwitcher.tsx     # Language selector component
└── i18n.ts                      # Configuration
```

## Usage

### 1. Using translations in components

```tsx
import { useTranslation } from '../src/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### 2. Adding new translations

1. Add the translation key to both language files:

**messages/en.json:**
```json
{
  "mySection": {
    "newKey": "English text"
  }
}
```

**messages/fr.json:**
```json
{
  "mySection": {
    "newKey": "Texte français"
  }
}
```

2. Use it in your component:
```tsx
const { t } = useTranslation();
return <div>{t('mySection.newKey')}</div>;
```

### 3. Adding a new language

1. Create a new translation file: `messages/es.json`
2. Add the locale to the configuration in `i18n.ts`:
```tsx
export const locales = ['en', 'fr', 'ar', 'es'] as const;
```
3. Update the LanguageSwitcher component to include the new language
4. For RTL languages (like Arabic), the app automatically handles text direction

### 4. Translation with variables

```tsx
// In translation file
{
  "greeting": "Hello, {name}!"
}

// In component
const { t } = useTranslation();
return <div>{t('greeting', { name: 'John' })}</div>;
```

### 5. Conditional translations

```tsx
const { tIf } = useTranslation();
return <div>{tIf(isLoading, 'common.loading', 'Ready')}</div>;
```

### 6. Breadcrumbs

The breadcrumbs component automatically uses translations for common route segments:

```tsx
// URLs like /admin/users will show translated breadcrumbs
// Home > Administration > Users (English)
// Accueil > Administration > Utilisateurs (French)
// الرئيسية > الإدارة > المستخدمون (Arabic)
```

To add new breadcrumb translations, add them to the `breadcrumbs` section in both language files:

```json
{
  "breadcrumbs": {
    "new-route": "New Route"
  }
}
```

## Components

### LanguageSwitcher

The language switcher is automatically included in the header. Users can click the language icon to switch between available languages.

### LanguageProvider

The app is wrapped with `LanguageProvider` in `_app.tsx` to provide translation context throughout the application.

## Best Practices

1. **Use nested keys** for organization: `navigation.dashboard` instead of `dashboard`
2. **Keep translations consistent** across all language files
3. **Use descriptive keys** that make sense in context
4. **Test all languages** when adding new features
5. **Consider cultural differences** in translations (date formats, number formats, etc.)
6. **For RTL languages**, ensure proper text direction and layout considerations

## Adding More Languages

To add a new language (e.g., Spanish):

1. Create `messages/es.json` with all translations
2. Update `src/contexts/LanguageContext.tsx`:
```tsx
import esMessages from '../../messages/es.json';

const messages = {
  en: enMessages,
  fr: frMessages,
  ar: arMessages,
  es: esMessages, // Add this
};
```
3. Update `i18n.ts`:
```tsx
export const locales = ['en', 'fr', 'ar', 'es'] as const;
```
4. Update `LanguageSwitcher.tsx` to include Spanish option
5. For RTL languages, the app automatically handles text direction via the `dir` attribute

The system is designed to be easily extensible for future languages! 