import React, { createContext, useContext, useState, useCallback } from 'react';

import { translations, Language, Translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

/**
 * I18n Provider component
 * Wraps the app to provide translations
 */
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>('ja');

  const contextValue: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return React.createElement(
    I18nContext.Provider,
    { value: contextValue },
    children,
  );
};

/**
 * Hook to use translations
 * @returns Translation context
 *
 * @example
 * const { t, language, setLanguage } = useTranslation();
 *
 * <Text>{t.common.appName}</Text>
 * <Button onPress={() => setLanguage('en')}>English</Button>
 */
export const useTranslation = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }

  return context;
};

/**
 * Get translated string by key path
 * @param key - Dot-notation key path (e.g., 'common.appName')
 * @returns Translated string
 */
export const translate = (key: string, language: Language = 'ja'): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
};

export { translations, Language, Translations };
