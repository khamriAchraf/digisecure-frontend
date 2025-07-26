import React from 'react';
import { ActionIcon, Menu, Text } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useLanguage } from '../src/contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();

  const languages = [
    { code: 'en', name: t('language.english') },
    { code: 'fr', name: t('language.french') },
    { code: 'ar', name: t('language.arabic') }
  ];

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg">
          <IconLanguage size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('language.selectLanguage')}</Menu.Label>
        {languages.map((language) => (
          <Menu.Item
            key={language.code}
            onClick={() => setLocale(language.code as 'en' | 'fr' | 'ar')}
            style={{
              fontWeight: locale === language.code ? 'bold' : 'normal'
            }}
          >
            <Text size="sm">{language.name}</Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}; 