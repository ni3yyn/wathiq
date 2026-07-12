import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LangContext';
import LanguageSwitcher from './Blog/LanguageSwitcher';
import wathiqLogo from '../assets/wathiq-logo.png';
import './WathiqHeader.css';

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.wathiq.app";

const NAV_LINKS = [
  { path: '/blog', ar: 'المدونة', fr: 'Blog', en: 'Blog' },
  { path: '/how-it-works', ar: 'كيف يعمل؟', fr: 'Comment ça marche', en: 'How it Works' },
  { path: '/research', ar: 'الأبحاث العلمية', fr: 'Recherches', en: 'Research' },
  { path: '/faq', ar: 'الأسئلة الشائعة', fr: 'FAQ', en: 'FAQ' },
];

const AnimatedText = ({ text }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={text}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.15 }}
      style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
    >
      {text}
    </motion.span>
  </AnimatePresence>
);

const WathiqHeader = () => {
  const { lang } = useLang();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRTL = lang === 'ar';
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      window.open(PLAY_STORE_URL, '_blank');
    }
  };

  return (
    <nav ref={navRef} className={`wathiq-header-nav ${scrolled ? 'scrolled' : ''} ${isOpen ? 'menu-open' : ''} ${isRTL ? '' : 'ltr'}`}>
      <motion.div layout className="wathiq-header-container">
        {/* Brand logo */}
        <motion.div layout>
          <Link to="/" className="brand-logo-container" style={{ textDecoration: 'none' }}>
            <img src={wathiqLogo} alt="Wathiq Logo" className="nav-logo" />
            <h2 className="brand-name">وثيق</h2>
          </Link>
        </motion.div>

        {/* Desktop Links Group */}
        <motion.div layout className="nav-desktop-menu">
          {NAV_LINKS.map(link => (
            <motion.div layout key={link.path}>
              <Link
                to={link.path}
                className={`nav-ghost-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                <AnimatedText text={link[lang] || link.ar} />
              </Link>
            </motion.div>
          ))}
          <motion.div layout className="nav-divider-vertical" />
          <motion.div layout>
            <LanguageSwitcher />
          </motion.div>
          <motion.button layout className="btn-primary nav-btn play-store-nav" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center' }}>
            <Download size={15} style={isRTL ? { marginLeft: '6px' } : { marginRight: '6px' }} />
            <AnimatedText text={lang === 'ar' ? 'تحميل التطبيق' : lang === 'fr' ? 'Télécharger' : 'Download'} />
          </motion.button>
        </motion.div>

        {/* Mobile Hamburger Button */}
        <motion.button layout
          className="nav-mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </motion.div>

      {/* Mobile Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="nav-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 998,
                background: 'transparent'
              }}
            />
            <motion.div 
              className="nav-mobile-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
          <motion.div layout className="nav-mobile-links">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  <motion.div layout>
                    <AnimatedText text={link[lang] || link.ar} />
                  </motion.div>
                </Link>
              ))}
              <motion.div layout className="nav-mobile-divider" />
              <motion.div layout className="nav-mobile-lang-row">
                <AnimatedText text={lang === 'ar' ? 'اللغة:' : lang === 'fr' ? 'Langue:' : 'Language:'} />
                <LanguageSwitcher />
              </motion.div>
              <motion.button layout className="btn-primary nav-btn play-store-nav" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleDownload}>
                <Download size={16} style={isRTL ? { marginLeft: '6px' } : { marginRight: '6px' }} />
                <AnimatedText text={lang === 'ar' ? 'تحميل التطبيق' : lang === 'fr' ? 'Télécharger' : 'Download'} />
              </motion.button>
            </motion.div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default WathiqHeader;
