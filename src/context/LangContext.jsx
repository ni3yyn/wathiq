import React, { createContext, useContext, useState, useEffect } from 'react';
import ar from '../data/translations/ar';
import fr from '../data/translations/fr';
import en from '../data/translations/en';

const translations = { ar, fr, en };

// Detect browser language, fallback to Arabic (primary Wathiq audience)
const detectLang = () => {
  // 1. Check URL first for SEO/AEO crawlers (e.g. ?lang=en)
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (urlLang && translations[urlLang]) return urlLang;

  // 2. Check saved preference
  const saved = localStorage.getItem('wathiq_lang');
  if (saved && translations[saved]) return saved;

  // 3. Check browser language
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  if (browser === 'fr') return 'fr';
  if (browser === 'en') return 'en';
  
  return 'ar'; // default
};

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState('ar');

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (newLang) => {
    if (!translations[newLang]) return;
    localStorage.setItem('wathiq_lang', newLang);
    setLangState(newLang);
    // Update html lang + dir attributes for accessibility
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  // t(key) — returns translated string, falls back to Arabic then key
  const t = (key) => {
    return translations[lang]?.[key] ?? translations['ar']?.[key] ?? key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, translations }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
};

export default LangContext;
