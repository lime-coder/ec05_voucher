import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { vi } from '../i18n/vi';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const dictionaries = {
  en,
  vi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('appLanguage');
    return (saved === 'en' || saved === 'vi') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('appLanguage', lang);
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[language] as Record<string, string>;
    let text = dict[key];
    
    if (!text) {
      console.warn(`Translation key missing for ${language}: ${key}`);
      return key; // Fallback to key if translation is missing
    }

    if (params) {
      Object.keys(params).forEach(paramKey => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
