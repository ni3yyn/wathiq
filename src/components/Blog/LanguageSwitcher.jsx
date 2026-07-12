import React from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import './Blog.css';

const LANGS = [
  { code: 'ar', label: 'العربية', sub: 'AR' },
  { code: 'fr', label: 'Français', sub: 'FR' },
  { code: 'en', label: 'English', sub: 'EN' },
];

const LanguageSwitcher = () => {
  const { lang, setLang } = useLang();
  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  const handleToggle = () => {
    const currentIndex = LANGS.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % LANGS.length;
    setLang(LANGS[nextIndex].code);
  };

  return (
    <div className="blog-lang-switcher">
      <button
        className="blog-lang-btn"
        onClick={handleToggle}
        aria-label="تغيير اللغة"
      >
        <Globe size={15} strokeWidth={2.2} />
        <AnimatePresence mode="wait">
          <motion.span
            key={current.sub}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline-block' }}
          >
            {current.sub}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
