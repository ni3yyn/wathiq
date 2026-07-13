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

  // 3. Timezone / Location heuristic check
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const arabTimezones = [
      'Africa/Algiers', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Khartoum', 
      'Africa/Tripoli', 'Africa/Tunis', 'Africa/Djibouti', 'Africa/Mogadishu', 
      'Africa/Nouakchott', 'Africa/El_Aaiun', 'Indian/Comoro', 'Asia/Amman', 
      'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Beirut', 'Asia/Damascus', 'Asia/Dubai', 
      'Asia/Gaza', 'Asia/Hebron', 'Asia/Jerusalem', 'Asia/Kuwait', 'Asia/Muscat', 
      'Asia/Qatar', 'Asia/Riyadh', 'Asia/Aden', 'Europe/London', 'Europe/Paris'
    ];
    
    // If timezone is in an Arab country (or common North African fallback), force Arabic default
    if (arabTimezones.includes(tz)) {
      return 'ar';
    }
    
    // If entering from Europe, USA, or non-Arab country:
    const browser = navigator.language?.slice(0, 2).toLowerCase();
    if (browser === 'ar') return 'ar'; // respect strict browser setting
    if (browser === 'fr') return 'fr';
    
    // Default to English for non-Arab regions
    return 'en';
  } catch (e) {
    // Fallback if Intl is unsupported
    const browser = navigator.language?.slice(0, 2).toLowerCase();
    if (browser === 'fr') return 'fr';
    if (browser === 'en') return 'en';
    return 'ar';
  }
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
