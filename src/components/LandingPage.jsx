// --- START OF FILE LandingPage.js ---

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, ScanLine, FlaskConical, ShieldCheck,
  CheckCircle, AlertOctagon, XCircle,
  Eye, Fingerprint, TrendingUp, AlertTriangle, FileText,
  Facebook, Instagram, Play, Droplets,
  Sun, Layers, MessageSquare, Award, BookOpen, Clock, Activity, Target, Zap, Headphones, Star, HelpCircle, Hourglass,
  Calendar, Moon, Trash2, Camera, Leaf, Menu, Search, Banknote, Coins
} from 'lucide-react';

import wathiqLogo from '../assets/wathiq-logo.png';
import '../LandingPage.css';
import analyticsService from '../services/analytics';
import SEO from './SEO';
import { LandingTicker } from './NewsTicker';
import articlesAr from '../data/articles/ar/index';
import articlesFr from '../data/articles/fr/index';
import articlesEn from '../data/articles/en/index';
import './Blog/Blog.css';
import { Link } from 'react-router-dom';

import arCourses from '../data/courses/ar';
import enCourses from '../data/courses/en';
import frCourses from '../data/courses/fr';

const COURSES_BY_LANG = {
  ar: arCourses,
  en: enCourses,
  fr: frCourses
};

import { useLang } from '../context/LangContext';
import enLanding from '../data/translations/landing/en';
import frLanding from '../data/translations/landing/fr';
import arLanding from '../data/translations/landing/ar';

const landingTranslations = {
  en: enLanding,
  fr: frLanding,
  ar: arLanding
};

// --- HARDCODED LINKS ---
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.wathiq.app";
const FB_PAGE_URL = "http://facebook.com/wathiqa";
const INSTA_PAGE_URL = "http://instagram.com/wathiq.ai";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.5 }
  }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.15 } }
};


/* --- DEMO COMPONENTS MATCHING ACTUAL APP --- */

const ScannerFlowDemo = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const cycle = setInterval(() => {
      setPhase(prev => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="iphone-mockup" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#14201d' }}>
        <div className="status-bar" style={{ background: '#14201d' }}>
          <span>9:41</span>
          <div className="status-icons">
            <span style={{ fontSize: 11, fontWeight: 900, color: '#2dd4bf', letterSpacing: 1 }}>WATHIQ</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="scanning" className="app-screen camera-mode" style={{ flex: 1, display: 'flex', flexDirection: 'column' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="camera-feed-sim" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div className="blurred-text-bg" style={{ fontSize: '14px', padding: '15px', color: 'rgba(255,255,255,0.2)', lineHeight: '1.4' }}>
                  Ingredients: Aqua, Kaolin, Glycerin, Salicylic Acid, Linalool, Citrus Limon Fruit Extract, Phenoxyethanol...
                </div>
                <div className="scanner-overlay" style={{ inset: '20px' }}>
                  <div className="scan-corner tl"></div><div className="scan-corner tr"></div>
                  <div className="scan-corner bl"></div><div className="scan-corner br"></div>
                  <motion.div className="scan-line" animate={{ top: ['5%', '95%', '5%'] }} transition={{ duration: 2.0, ease: 'linear', repeat: Infinity }} />
                  <div className="scan-hint" style={{ bottom: '15px', fontSize: '0.95rem', fontWeight: 'bold' }}>{t('demo_scan_hint')}</div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div key="analyzing" className="app-screen analysis-mode" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#14201d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: '#1a2b25', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', bottom: '-15px', width: '150px', height: '65px', background: '#619b80', borderRadius: '50%', opacity: 0.9 }} />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'relative', zIndex: 1 }}>
                  <FlaskConical size={36} color="#ffffff" strokeWidth={2} />
                </motion.div>
                <motion.div animate={{ y: [0, -20], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.2 }} style={{ position: 'absolute', width: '4px', height: '4px', background: 'rgba(255,255,255,0.6)', borderRadius: '50%', left: '30px', bottom: '40px' }} />
                <motion.div animate={{ y: [0, -30], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.8 }} style={{ position: 'absolute', width: '6px', height: '6px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', right: '25px', bottom: '30px' }} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: 'inherit' }}>{t('demo_scan_analyzing')}</h3>
              <p style={{ color: '#619b80', fontSize: '0.9rem', margin: 0 }}>{t('demo_scan_subtitle')}</p>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div key="result" className="app-screen result-mode" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflowY: 'auto', background: '#14201d' }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              <div style={{ textAlign: 'center', width: '100%', marginBottom: '20px' }}>
                {/* Circular Score */}
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px auto', borderRadius: '50%', background: 'conic-gradient(#ef4444 43%, rgba(255,255,255,0.05) 43%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '100px', background: '#14201d', borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: '1' }}>43</div>
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontFamily: 'inherit' }}>{t('demo_scan_result_score_subtitle')}</div>
                  </div>
                </div>

                {/* Main Title & Subtitle */}
                <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>{t('demo_scan_result_title')}</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '20px' }}>{t('demo_scan_result_desc')}</p>
              </div>

              {/* Two Cards (Efficacy and Safety) */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', width: '100%', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                {/* Efficacy */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>40%</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{t('demo_scan_efficacy')}</span>
                      <FlaskConical size={14} color="#3b82f6" />
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
                    <div style={{ width: '40%', height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
                  </div>
                </div>
                {/* Safety */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>45%</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{t('demo_scan_safety')}</span>
                      <ShieldCheck size={14} color="#eab308" />
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
                    <div style={{ width: '45%', height: '100%', background: '#eab308', borderRadius: '2px' }}></div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Button */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', width: '100%', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <span style={{ color: '#94a3b8', fontSize: '1rem', transform: isRtl ? 'none' : 'scaleX(-1)' }}>{'<'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{t('demo_scan_detailed_btn')}</span>
                  <Leaf size={16} color="#10b981" />
                </div>
              </div>

              {/* Personal Compatibility Card */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{t('demo_scan_personal_match')}</span>
                  <Fingerprint size={16} color="#cbd5e1" />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: '1.6', flex: 1 }}>
                    {t('demo_scan_personal_alert')}
                  </p>
                  <AlertTriangle size={16} color="#eab308" style={{ marginTop: '2px', flexShrink: 0 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const IngredientTruthDemo = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  return (
    <div className="demo-widget truth-widget" style={{ minWidth: '100%', direction: isRtl ? 'rtl' : 'ltr', padding: '16px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', [isRtl ? 'borderRight' : 'borderLeft']: '2px solid #10b981', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="live-ui-badge"><span className="pulse"></span> {t('demo_truth_badge')}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
        <div style={{ border: '1px solid #10b981', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{t('demo_truth_score')}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{t('demo_truth_score_label')}</div>
        </div>
        <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{t('demo_truth_title')}</div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{t('demo_truth_subtitle')}</div>
        </div>
      </div>

      {/* Claim 1 */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="#10b981" />
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ fontWeight: 'bold', color: '#fff' }}>{t('demo_truth_claim_title')}</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981' }}>{t('demo_truth_claim_status')}</div>
            </div>
          </div>
        </div>
        <div style={{ paddingBottom: '12px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', textAlign: isRtl ? 'right' : 'left' }}>
          {t('demo_truth_claim_desc_1')}

          <div style={{ marginTop: '10px', color: '#10b981', fontWeight: 'bold' }}>{t('demo_truth_claim_active')}</div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px', borderRadius: '6px', marginTop: '4px', textAlign: 'center', color: '#34d399' }}>
            {t('demo_truth_claim_active_item')}
          </div>

          <div style={{ marginTop: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{t('demo_truth_claim_secondary')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            <div style={{ border: '1px solid rgba(251, 191, 36, 0.2)', padding: '6px', borderRadius: '6px', textAlign: 'center', color: '#cbd5e1' }}>{t('demo_truth_claim_sec_item1')}</div>
            <div style={{ border: '1px solid rgba(251, 191, 36, 0.2)', padding: '6px', borderRadius: '6px', textAlign: 'center', color: '#cbd5e1' }}>{t('demo_truth_claim_sec_item2')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IngredientEncyclopediaDemo = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  return (
    <div className="demo-widget routine-widget" style={{ minWidth: '100%', direction: isRtl ? 'rtl' : 'ltr', padding: '16px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', [isRtl ? 'borderRight' : 'borderLeft']: '2px solid #10b981', borderRadius: '16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>
          <FlaskConical size={14} /> {t('demo_enc_badge_type')}
        </div>
        <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{t('demo_enc_title')}</h2>
          <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{t('demo_enc_subtitle')}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '3px', height: '16px', background: '#10b981' }}></div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{t('demo_enc_benefits')}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', width: '40px', textAlign: isRtl ? 'left' : 'right' }}>10/10</span>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
              <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', width: '100px', textAlign: isRtl ? 'right' : 'left' }}>{t('demo_enc_benefit_1')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', width: '40px', textAlign: isRtl ? 'left' : 'right' }}>9/10</span>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
              <div style={{ width: '90%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', width: '100px', textAlign: isRtl ? 'right' : 'left' }}>{t('demo_enc_benefit_2')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', width: '40px', textAlign: isRtl ? 'left' : 'right' }}>9/10</span>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
              <div style={{ width: '90%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', width: '100px', textAlign: isRtl ? 'right' : 'left' }}>{t('demo_enc_benefit_3')}</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '3px', height: '16px', background: '#10b981' }}></div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{t('demo_enc_safety')}</h3>
        </div>
        <div style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '12px', borderRadius: '12px', display: 'flex', gap: '10px' }}>
          <AlertTriangle color="#fbbf24" size={20} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#fbbf24', lineHeight: '1.5', textAlign: isRtl ? 'right' : 'left' }}>
            {t('demo_enc_safety_text')}
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '3px', height: '16px', background: '#10b981' }}></div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{t('demo_enc_interactions')}</h3>
        </div>
        <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
          <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>{t('demo_enc_synergy')}</div>
          <div style={{ color: '#10b981', fontSize: '0.85rem', opacity: 0.8 }}>• hyaluronic-acid</div>
        </div>
      </div>

    </div>
  );
};

const DashboardAlertsDemo = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  return (
    <div className="demo-widget routine-widget" style={{ minWidth: '100%', direction: isRtl ? 'rtl' : 'ltr', padding: '16px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', [isRtl ? 'borderRight' : 'borderLeft']: '2px solid #10b981', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="live-ui-badge"><span className="pulse"></span> {t('demo_dash_badge')}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
        <span style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>{t('demo_dash_hello')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{t('demo_dash_tagline')}</span>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '50%' }}>
            <Target size={16} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      <div style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', padding: '16px', borderRadius: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Droplets color="#fff" size={24} />
        </div>
        <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{t('demo_dash_alert_title')}</h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{t('demo_dash_alert_desc')}</p>
        </div>
      </div>

      <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold', textAlign: isRtl ? 'right' : 'left', marginBottom: '12px' }}>{t('demo_dash_highlights')}</div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
        {/* UV Warning */}
        <div style={{ flex: 1, background: '#ef4444', padding: '16px', borderRadius: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', [isRtl ? 'right' : 'left']: '12px', width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></div>
          <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px', marginLeft: isRtl ? 0 : 'auto', marginRight: isRtl ? 'auto' : 0 }}>
            <Sun color="#fff" size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', lineHeight: '1.4', textAlign: isRtl ? 'right' : 'left' }}>
            {t('demo_dash_warn_uv')}
          </h4>
          <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '12px', display: 'inline-block', color: '#fff', fontSize: '0.75rem', float: isRtl ? 'right' : 'left' }}>
            {t('demo_dash_warn_uv_tag')}
          </div>
        </div>

        {/* Goal Track */}
        <div style={{ flex: 1, background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', [isRtl ? 'right' : 'left']: '12px', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }}></div>
          <div style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px', marginLeft: isRtl ? 0 : 'auto', marginRight: isRtl ? 'auto' : 0 }}>
            <ShieldCheck color="#ef4444" size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', lineHeight: '1.4', textAlign: isRtl ? 'right' : 'left' }}>
            {t('demo_dash_track')}
          </h4>
          <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '0.75rem', textAlign: isRtl ? 'left' : 'right', fontWeight: 'bold' }}>
            {t('demo_dash_track_more')}
          </div>
        </div>
      </div>

      {/* Skin Barrier */}
      <div style={{ padding: '16px', borderRadius: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{t('demo_dash_med')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{t('demo_dash_barrier')}</span>
            <ShieldCheck color="#10b981" size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem' }}>{t('demo_dash_barrier_status')}</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{t('demo_dash_barrier_desc')}</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981' }}>86%</div>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
          <div style={{ width: '86%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
        </div>
        <div style={{ textAlign: isRtl ? 'right' : 'left', marginTop: '8px', fontSize: '0.7rem', color: '#cbd5e1' }}>
          {t('demo_dash_barrier_stats')}
        </div>
      </div>
    </div>
  );
};

const RoutineManagerDemo = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  return (
    <div className="demo-widget routine-app-ui" style={{ minWidth: '100%', direction: isRtl ? 'rtl' : 'ltr', padding: '0', background: 'transparent', border: 'none', color: '#fff', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="live-ui-badge"><span className="pulse"></span> {t('demo_routine_badge')}</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 0 16px' }}>
        <div style={{ display: 'flex', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', overflow: 'hidden', padding: '4px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ flex: 1, color: '#cbd5e1', padding: '10px 0', fontSize: '0.9rem', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <Moon size={16} /> {t('demo_routine_tab_eve')}
          </div>
          <div style={{ flex: 1, background: '#10b981', color: '#14201d', padding: '10px 0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <Sun size={16} fill="#14201d" /> {t('demo_routine_tab_morn')}
          </div>
          <div style={{ flex: 1, color: '#cbd5e1', padding: '10px 0', fontSize: '0.9rem', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} /> {t('demo_routine_tab_week')}
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Step 1 */}
        <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', [isRtl ? 'borderRight' : 'borderLeft']: '2px solid #10b981', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <div style={{ width: '36px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#10b981', fontSize: '1.2rem' }}>1</div>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>{t('demo_routine_step1')}</h3>
                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '2px' }}>{t('demo_routine_step1_prod')}</div>
              </div>
            </div>
            <Trash2 size={18} color="#64748b" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              Neutrogena <div style={{ background: '#10b981', padding: '4px', borderRadius: '6px', display: 'flex' }}><Droplets size={14} color="#14201d" /></div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', [isRtl ? 'borderRight' : 'borderLeft']: '2px solid #10b981', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <div style={{ width: '36px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#10b981', fontSize: '1.2rem' }}>2</div>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>{t('demo_routine_step2')}</h3>
                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '2px' }}>{t('demo_routine_step2_prod')}</div>
              </div>
            </div>
            <Trash2 size={18} color="#64748b" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              Sérum bbrose color <div style={{ background: '#10b981', padding: '4px', borderRadius: '6px', display: 'flex' }}><Droplets size={14} color="#14201d" /></div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', [isRtl ? 'borderRight' : 'borderLeft']: '2px solid #10b981', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <div style={{ width: '36px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#10b981', fontSize: '1.2rem' }}>3</div>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>{t('demo_routine_step3')}</h3>
                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '2px' }}>{t('demo_routine_step3_prod')}</div>
              </div>
            </div>
            <Trash2 size={18} color="#64748b" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              واقي شمس uriage <div style={{ background: '#10b981', padding: '4px', borderRadius: '6px', display: 'flex' }}><Sun size={14} color="#14201d" fill="#14201d" /></div>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', padding: '20px 0 0', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
        <button style={{ flex: 1, background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', padding: '14px', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 'bold', fontFamily: 'inherit' }}>
          <Zap size={18} /> {t('demo_routine_btn_smart')}
        </button>
        <button style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#fff', padding: '14px', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 'bold', fontFamily: 'inherit' }}>
          {t('demo_routine_btn_add')}
        </button>
      </div>

    </div>
  );
};

const CommunityDemo = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  return (
    <div className="demo-widget truth-widget" style={{ minWidth: '100%', direction: isRtl ? 'rtl' : 'ltr', padding: '16px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', [isRtl ? 'borderRight' : 'borderLeft']: '2px solid #10b981', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="live-ui-badge"><span className="pulse"></span> {t('demo_com_badge')}</div>
      </div>

      {/* Top Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>{t('demo_com_title')}</h2>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>{t('demo_com_subtitle')}</p>
      </div>

      {/* Navigation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>

        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Star color="#34d399" size={20} />
            </div>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{t('demo_com_card1_title')}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{t('demo_com_card1_desc')}</div>
            </div>
          </div>
          <div style={{ color: '#cbd5e1' }} dir="ltr">{isRtl ? '<' : '>'}</div>
        </div>

        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Hourglass color="#fbbf24" size={20} />
            </div>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{t('demo_com_card2_title')}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{t('demo_com_card2_desc')}</div>
            </div>
          </div>
          <div style={{ color: '#cbd5e1' }} dir="ltr">{isRtl ? '<' : '>'}</div>
        </div>

        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <HelpCircle color="#34d399" size={20} />
            </div>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{t('demo_com_card3_title')}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{t('demo_com_card3_desc')}</div>
            </div>
          </div>
          <div style={{ color: '#cbd5e1' }} dir="ltr">{isRtl ? '<' : '>'}</div>
        </div>

      </div>

      {/* Sample Post from Ahlem */}
      <div style={{ borderRadius: '16px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <div style={{ width: '36px', height: '36px', background: '#334155', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}>A</div>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Ahlem</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>{t('demo_com_post_badge')}</span>
              </div>
              <div style={{ color: '#34d399', fontSize: '0.75rem' }}>{t('demo_com_post_meta')}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '6px', borderRadius: '6px', marginBottom: '12px', textAlign: 'center' }}>
          <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 'bold' }}>{t('demo_com_post_match')}</span>
        </div>

        <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: '1.6', textAlign: isRtl ? 'right' : 'left', margin: '0 0 12px 0', fontWeight: 'bold' }}>
          {t('demo_com_post_text')}
        </p>

        <div style={{ textAlign: isRtl ? 'right' : 'left', marginBottom: '12px' }}>
          <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{t('demo_com_post_tag')}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <MessageSquare size={16} /> {t('demo_com_post_replies')}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.85rem', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
            <span style={{ color: '#ef4444' }}>❤</span> 6
          </div>
        </div>
      </div>
    </div>
  );
};

const TypewriterText = ({ text, placeholder }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.substring(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [text]);
  return <span style={{ color: displayed ? '#fff' : '#64748b' }}>{displayed || placeholder}</span>;
};

const CatalogBountyDemo = () => {
  const [phase, setPhase] = useState(0);
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="demo-widget personal-widget" style={{ minWidth: '100%', direction: isRtl ? 'rtl' : 'ltr', padding: '16px', background: 'transparent' }}>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>{t('demo_cat_title')}</h2>
      </div>

      {/* Gamified Points Profile Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FlaskConical size={14} /> {t('demo_cat_role')}
          </div>
          <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{t('demo_cat_balance')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
              965 <Star fill="#fbbf24" size={20} />
            </div>
          </div>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '8px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
          <div style={{ width: '45%', height: '100%', background: '#c084fc', borderRadius: '3px' }}></div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
          {t('demo_cat_points_msg')}
        </div>
      </div>

      <div style={{ minHeight: '550px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="product-bounty"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Search Bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <div style={{ fontSize: '0.9rem' }}><TypewriterText text={t('demo_cat_search_typewriter')} placeholder={t('demo_cat_search')} /></div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Search size={16} color="#94a3b8" />
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  <Menu size={16} color="#94a3b8" />
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <div style={{ background: '#10b981', color: '#000', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>{t('demo_cat_filter_all')}</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', flexDirection: isRtl ? 'row' : 'row-reverse' }}><Droplets size={12} /> {t('demo_cat_filter_wash')}</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', flexDirection: isRtl ? 'row' : 'row-reverse' }}><FlaskConical size={12} /> {t('demo_cat_filter_shampoo')}</div>
              </div>

              {/* Product Card */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <div style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                    <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('demo_cat_brand_name')}</span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{t('demo_cat_product_vol')}</span>
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.3' }}>{t('demo_cat_product_name')}</div>
                  <button style={{ fontFamily: 'inherit', background: 'rgba(251, 191, 36, 0.1)', border: '1px dashed #fbbf24', color: '#fbbf24', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                    <Star size={14} fill="#fbbf24" /> {t('demo_cat_btn_price')} +15
                  </button>
                </div>
                <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{ width: '30px', height: '60px', background: '#eab308', borderRadius: '4px' }}></div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ padding: '20px 16px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px' }}
            >
              <div style={{ background: '#fbbf24', color: '#000', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '16px' }}>
                15+ {t('demo_cat_pts')} <Star size={12} fill="#000" style={{ display: 'inline' }} />
              </div>
              <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '1.2rem' }}>{t('demo_cat_upd_price')}</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginBottom: '20px', lineHeight: '1.5' }}>{t('demo_cat_upd_desc')}</p>

              <div style={{ textAlign: isRtl ? 'right' : 'left', marginBottom: '8px', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}>{t('demo_cat_upd_input')}</div>
              <div style={{ border: '1px solid #fbbf24', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'rgba(251, 191, 36, 0.05)', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('demo_cat_currency')}</span>
                <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{t('demo_cat_currency_val')}</span>
              </div>

              <button style={{ fontFamily: 'inherit', width: '100%', background: 'linear-gradient(to right, #10b981, #34d399)', color: '#fff', padding: '12px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', border: 'none' }}>
                {t('demo_cat_btn_save')} ✔
              </button>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="success-bounty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: '32px 16px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px' }}
            >
              <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle size={36} color="#10b981" />
              </div>
              <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '1.3rem' }}>{t('demo_cat_sent')}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>{t('demo_cat_sent_desc')}</p>
              <button style={{ fontFamily: 'inherit', width: '100%', background: '#34d399', color: '#000', padding: '12px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', border: 'none' }}>
                {t('demo_cat_btn_ok')}
              </button>
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="scan-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: '24px 16px', background: '#14201d', border: '1px solid #10b981', borderRadius: '24px', textAlign: 'center' }}
            >
              {/* Circular Score */}
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px auto', borderRadius: '50%', background: 'conic-gradient(#ef4444 43%, rgba(255,255,255,0.05) 43%)', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
                <div style={{ width: '100px', height: '100px', background: '#14201d', borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', lineHeight: '1' }}>{t('demo_cat_res_score')}</div>
                  <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontFamily: 'inherit' }}>{t('demo_cat_brand')}</div>
                </div>
              </div>

              {/* Main Title & Subtitle */}
              <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>{t('demo_cat_res_title')}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '20px' }}>{t('demo_cat_res_desc')}</p>

              {/* Two Cards (Efficacy and Safety) */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                {/* Efficacy */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>40%</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{t('demo_cat_eff')}</span>
                      <FlaskConical size={14} color="#3b82f6" />
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
                    <div style={{ width: '40%', height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
                  </div>
                </div>
                {/* Safety */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: isRtl ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>45%</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{t('demo_cat_safe')}</span>
                      <ShieldCheck size={14} color="#eab308" />
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', transform: isRtl ? 'none' : 'scaleX(-1)' }}>
                    <div style={{ width: '45%', height: '100%', background: '#eab308', borderRadius: '2px' }}></div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Button */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <span style={{ color: '#94a3b8', fontSize: '1rem' }} dir="ltr">{isRtl ? '<' : '>'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{t('demo_cat_details')}</span>
                  <Leaf size={16} color="#10b981" />
                </div>
              </div>

              {/* Personal Compatibility Card */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: isRtl ? 'right' : 'left' }}>
                <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '8px', marginBottom: '12px', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{t('demo_cat_compat')}</span>
                  <Fingerprint size={16} color="#cbd5e1" />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: '1.6', flex: 1, textAlign: isRtl ? 'right' : 'left' }}>
                    {t('demo_cat_alert')}
                  </p>
                  <AlertTriangle size={16} color="#eab308" style={{ marginTop: '2px', flexShrink: 0 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- TREASURE MAP COMPONENTS ---
const MapArrow1to2 = ({ isRtl }) => (
  <svg className={`map-arrow-desktop arrow-1-2 ${isRtl ? 'rtl' : 'ltr'}`} viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-1-2" x1={isRtl ? "100%" : "0%"} y1="0%" x2={isRtl ? "0%" : "100%"} y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
      </linearGradient>
      <marker id="head-1-2" markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
        <path d="M 0 0 L 16 8 L 0 16 z" fill="#10b981" />
      </marker>
      <filter id="glow-1-2" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <motion.path 
      d={isRtl ? "M 140 75 C 100 75, 100 20, 75 20 C 50 20, 50 75, 10 75" : "M 10 75 C 50 75, 50 20, 75 20 C 100 20, 100 75, 140 75"} 
      stroke="url(#grad-1-2)" 
      strokeWidth="4" 
      fill="none" 
      strokeLinecap="round" 
      markerEnd="url(#head-1-2)"
      filter="url(#glow-1-2)"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  </svg>
);

const MapArrow2to3 = ({ isRtl }) => (
  <svg className={`map-arrow-desktop arrow-2-3 ${isRtl ? 'rtl' : 'ltr'}`} viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-2-3" x1={isRtl ? "100%" : "0%"} y1="0%" x2={isRtl ? "0%" : "100%"} y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
      </linearGradient>
      <marker id="head-2-3" markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
        <path d="M 0 0 L 16 8 L 0 16 z" fill="#10b981" />
      </marker>
      <filter id="glow-2-3" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <motion.path 
      d={isRtl ? "M 140 75 C 100 75, 100 130, 75 130 C 50 130, 50 75, 10 75" : "M 10 75 C 50 75, 50 130, 75 130 C 100 130, 100 75, 140 75"} 
      stroke="url(#grad-2-3)" 
      strokeWidth="4" 
      fill="none" 
      strokeLinecap="round" 
      markerEnd="url(#head-2-3)"
      filter="url(#glow-2-3)"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
    />
  </svg>
);

const MapArrowMobile = ({ reverse, isRtl }) => {
  // reverse=false: starts Right (280). reverse=true: starts Left (20).
  const startX = reverse ? 20 : 280;
  const endX = 150;
  // Added a straight vertical line at the end (L endX 68) to perfectly align the arrowhead
  // Ending at 68 ensures the tip of the arrowhead (which extends 8px further) stays inside the viewBox (height 80)
  const dPath = `M ${startX} 5 C ${startX} 40, ${endX} 30, ${endX} 55 L ${endX} 68`;

  const gradId = reverse ? "grad-mob-rev" : "grad-mob";
  return (
    <svg className="map-arrow-mobile" viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
        </linearGradient>
        <marker id={`head-${gradId}`} markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
          <path d="M 0 0 L 16 8 L 0 16 z" fill="#10b981" />
        </marker>
        <filter id={`glow-${gradId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <motion.path 
        d={dPath} 
        stroke={`url(#${gradId})`} 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        markerEnd={`url(#head-${gradId})`}
        filter={`url(#glow-${gradId})`}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
};

const TreasureNode = ({ title, desc, position }) => (
  <motion.div 
    className={`treasure-node node-${position}`}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
  >
    <div className="treasure-content">
      <h3 className="treasure-title">{title}</h3>
      <p className="treasure-desc">{desc}</p>
    </div>
  </motion.div>
);

// --- Custom SVG for the Winged Banknote ---
const WingedMoneySVG = ({ size = 45 }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="winged-money-svg">
    {/* Left Wing */}
    <g className="wing-left">
      <path d="M22 20C10 8 2 12 3 18C10 20 15 23 19 25Z" fill="#ffffff" />
      <path d="M20 22C12 12 5 15 5 19C11 21 15 23 18 25Z" fill="#cbd5e1" opacity="0.8" />
    </g>

    {/* Right Wing */}
    <g className="wing-right">
      <path d="M38 20C50 8 58 12 57 18C50 20 45 23 41 25Z" fill="#ffffff" />
      <path d="M40 22C48 12 55 15 55 19C49 21 45 23 42 25Z" fill="#cbd5e1" opacity="0.8" />
    </g>

    {/* The Banknote */}
    <rect x="16" y="12" width="28" height="16" rx="3" fill="#10b981" />
    <rect x="18" y="14" width="24" height="12" rx="2" fill="#34d399" />
    <circle cx="30" cy="20" r="3.5" fill="#10b981" />
    <path d="M20 16.5H23 M37 16.5H40 M20 23.5H23 M37 23.5H40" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// --- The Emitter that spawns the flying money ---
const WastedMoneyEffect = () => {
  const items = [
    // Sizes reduced, xDrift tightened for a much subtler effect
    { id: 1, left: '10%', delay: '0s', duration: '3.2s', xDrift: '-15px', rotDrift: '-15deg', size: 30 },
    { id: 2, left: '40%', delay: '1.2s', duration: '3.8s', xDrift: '10px', rotDrift: '20deg', size: 24 },
    { id: 3, left: '70%', delay: '0.6s', duration: '3.5s', xDrift: '-12px', rotDrift: '-10deg', size: 32 },
    { id: 4, left: '85%', delay: '2.1s', duration: '3.6s', xDrift: '18px', rotDrift: '15deg', size: 26 },
  ];

  return (
    <div className="money-emitter" aria-hidden="true">
      {items.map((item) => (
        <div
          key={item.id}
          className="money-item winged"
          style={{
            left: item.left,
            '--delay': item.delay,
            '--duration': item.duration,
            '--x-drift': item.xDrift,
            '--rot-drift': item.rotDrift,
          }}
        >
          <WingedMoneySVG size={item.size} />
        </div>
      ))}
    </div>
  );
};

const RotatingText = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;

  const words = [
    t('rotating_serum'),
    t('rotating_moisturizer'),
    t('rotating_cleanser'),
    t('rotating_conditioner')
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Slightly faster interval for a snappier, more engaging feel
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [words.length]);

  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b));

  return (
    <span className="rotating-word-container">
      {/* Invisible spacer dictates the perfect static width */}
      <span className="ghost-word" aria-hidden="true">{longestWord}</span>

      {/* Visible animated text */}
      <AnimatePresence>
        <motion.span
          key={index}
          className="rotating-text-active"
          initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -35, filter: 'blur(8px)' }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 25,
            mass: 0.5
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const LandingPage = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  const allArticles = {
    ar: articlesAr,
    fr: articlesFr,
    en: articlesEn
  };
  const activeArticles = allArticles[lang] || articlesAr;

  const isBot = /bot|googlebot|bingbot|yandex|baidu|slurp|crawler|spider|facebookexternalhit|whatsapp/i.test(navigator.userAgent || '');
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(
    !localStorage.getItem('wathiq_privacy_consent')
  );
  useEffect(() => {
    analyticsService.trackPageView('/');
    const startTime = Date.now();

    // --- WebMCP Tool Registration ---
    if (typeof window !== 'undefined') {
      const modelCtx = document.modelContext || navigator.modelContext;
      if (modelCtx && typeof modelCtx.registerTool === 'function') {
        try {
          modelCtx.registerTool({
            name: 'wathiq_navigate_footer_links',
            description: 'Navigate to one of the secondary pages in Wathiq (How It Works, Scientific Research, FAQ, Privacy Policy, or Terms).',
            inputSchema: {
              type: 'object',
              properties: {
                destination: {
                  type: 'string',
                  enum: ['how-it-works', 'research', 'faq', 'privacy', 'terms'],
                  description: 'The target page slug to navigate to'
                }
              },
              required: ['destination']
            },
            execute: async ({ destination }) => {
              window.location.href = `/${destination}`;
              return { success: true, message: `Navigating to ${destination}` };
            }
          });
        } catch (e) {
          console.error('Failed to register WebMCP tool:', e);
        }
      }
    }

    let maxScroll = 0;
    let scrollTimeout;

    const trackScrollDepth = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

        if (scrollPercentage > maxScroll) {
          maxScroll = scrollPercentage;
          [25, 50, 75, 90].forEach(threshold => {
            if (maxScroll >= threshold && maxScroll - threshold < 5) {
              analyticsService.trackScroll(threshold);
            }
          });
        }
      }, 500);
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      analyticsService.trackTimeOnPage(timeSpent);
      window.removeEventListener('scroll', trackScrollDepth);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // --- DOWNLOAD HANDLER ---
  const handleDownload = (location = 'hero') => {
    analyticsService.trackDownload('play_store', location);
    window.open(PLAY_STORE_URL, '_blank');
  };

  const acceptAnalytics = () => {
    localStorage.setItem('wathiq_privacy_consent', 'accepted');
    setShowPrivacyBanner(false);
    analyticsService.init();
    analyticsService.trackEvent('privacy', 'consent_accepted', 'banner');
  };

  const rejectAnalytics = () => {
    localStorage.setItem('wathiq_privacy_consent', 'rejected');
    setShowPrivacyBanner(false);
    analyticsService.trackEvent('privacy', 'consent_rejected', 'banner');
  };

  const landingSchema = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": t('meta_title'),
      "alternateName": "Wathiq App",
      "url": "https://wathiq.web.app/",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web, Android, iOS",
      "description": t('meta_description'),
      "featureList": [
        "OilGuard AI Engine",
        "Ingredient Scanner (OCR)",
        "Wathiq Score",
        "Smart Routine Architect",
        "Weather Intelligence",
        "Skin Barrier Tracking"
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "SAR"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "150"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "وثيق",
      "url": "https://wathiq.web.app/",
      "logo": "https://wathiq.web.app/wathiq-logo-512.png",
      "image": "https://wathiq.web.app/og-image-compressed.jpg",
      "sameAs": [
        "http://facebook.com/wathiqa",
        "http://instagram.com/wathiq.ai"
      ]
    }
  ];

  return (
    <div className="landing-wrapper">
      <SEO
        description={t('meta_description')}
        schema={landingSchema}
        lastUpdated="2026-06-12T10:00:00Z"
        lang={lang}
      />

      {/* Privacy Consent Banner */}
      <AnimatePresence>
        {showPrivacyBanner && (
          <motion.div
            className="privacy-banner"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="privacy-content">
              <p>
                {t('privacy_message')}
                <a href="/privacy" style={{ color: '#2dd4bf', margin: '0 10px', textDecoration: 'underline' }}>{t('privacy_read_policy')}</a>
              </p>
              <div className="privacy-buttons">
                <button className="privacy-btn accept" onClick={acceptAnalytics}>{t('privacy_accept')}</button>
                <button className="privacy-btn reject" onClick={rejectAnalytics}>{t('privacy_reject')}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid-overlay" />

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="container hero-desktop-layout" dir={isRtl ? 'rtl' : 'ltr'}>
          <motion.div
            className="hero-content"
            initial={isBot ? false : "hidden"} animate="visible" variants={fadeInUp}
          >

            <h1 className="hero-headline">
              {t('hero_headline_1')}<RotatingText />{t('hero_headline_2')}
              <span className="money-peek-container">
                <span style={{ color: 'var(--danger)' }}>{t('hero_headline_waste')}</span>
                <WastedMoneyEffect />
              </span>
            </h1>

            <p className="hero-sub advanced-sub">
              {t('hero_sub')}
            </p>

            <DownloadButtonsGroup onDownload={() => handleDownload('hero')} />
          </motion.div>

          <motion.div
            className="hero-demo-container"
            initial={isBot ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <ScannerFlowDemo />
          </motion.div>
        </div>
      </section>

      {/* 3. Social Proof (Ticker) */}
      <LandingTicker />

      {/* 4. Features Bento Grid */}
      <section className="container section-padding">
        <div className="section-header" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          <h2 className="section-title">{t('bento_title_1')}<span className="text-gold">{t('bento_title_gold')}</span></h2>
          <p className="section-subtitle">{t('bento_subtitle')}</p>
        </div>

        <motion.div
          className="bento-grid"
          initial={isBot ? false : "hidden"}
          whileInView={isBot ? undefined : "visible"}
          animate={isBot ? "visible" : undefined}
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Feature Cards */}
          <motion.div className="bento-card col-span-7" variants={fadeInUp} style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
            <div className="card-top" style={{ marginBottom: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="card-icon gold" style={{ boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)' }}><Eye /></div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Star size={12} fill="#fbbf24" /> {t('card1_badge')}
                  </div>
                  <h3 style={{ margin: 0 }}>{t('card1_title')}</h3>
                </div>
              </div>
            </div>
            <p className="bento-desc">{t('card1_desc')}</p>
            <div className="demo-stage"><IngredientTruthDemo /></div>
          </motion.div>

          <motion.div className="bento-card col-span-5" variants={fadeInUp} style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'nowrap' }}>
              <div className="card-icon mint" style={{ flexShrink: 0 }}><Activity /></div>
              <h3 style={{ margin: 0 }}>{t('card2_title')}</h3>
            </div>
            <p className="bento-desc">{t('card2_desc')}</p>
            <DashboardAlertsDemo />
          </motion.div>

          <motion.div className="bento-card col-span-5" variants={fadeInUp} style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'nowrap' }}>
              <div className="card-icon mint" style={{ flexShrink: 0 }}><BookOpen /></div>
              <h3 style={{ margin: 0 }}>{t('card3_title')}</h3>
            </div>
            <p className="bento-desc">{t('card3_desc')}</p>
            <IngredientEncyclopediaDemo />
          </motion.div>

          <motion.div className="bento-card col-span-7" variants={fadeInUp} style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'nowrap' }}>
              <div className="card-icon blue" style={{ flexShrink: 0 }}><Layers /></div>
              <h3 style={{ margin: 0 }}>{t('card4_title')}</h3>
            </div>
            <p className="bento-desc">{t('card4_desc')}</p>
            <RoutineManagerDemo />
          </motion.div>

          <motion.div className="bento-card col-span-8" variants={fadeInUp} style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'nowrap' }}>
              <div className="card-icon gold" style={{ flexShrink: 0 }}><Award /></div>
              <h3 style={{ margin: 0 }}>{t('card5_title')}</h3>
            </div>
            <p className="bento-desc">{t('card5_desc')}</p>
            <CatalogBountyDemo />
          </motion.div>

          <motion.div className="bento-card col-span-4" variants={fadeInUp} style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'nowrap' }}>
              <div className="card-icon purple" style={{ flexShrink: 0 }}><MessageSquare /></div>
              <h3 style={{ margin: 0 }}>{t('card6_title')}</h3>
            </div>
            <p className="bento-desc">{t('card6_desc')}</p>
            <CommunityDemo />
          </motion.div>
        </motion.div>
      </section>

      {/* 5. How It Works */}
      <section className="container section-padding" style={{ direction: isRtl ? 'rtl' : 'ltr', overflow: 'hidden' }}>
        <h2 className="section-title text-center">{t('hiw_title_1')}<span className="text-mint">{t('hiw_title_mint')}</span></h2>
        
        <div className={`treasure-map-container ${isRtl ? 'map-rtl' : 'map-ltr'}`}>
          <TreasureNode title={t('hiw_step1_title')} desc={t('hiw_step1_desc')} position="1" />
          
          <MapArrow1to2 isRtl={isRtl} />
          <MapArrowMobile isRtl={isRtl} id="1" delay={0.2} reverse={false} />
          
          <TreasureNode title={t('hiw_step2_title')} desc={t('hiw_step2_desc')} position="2" />
          
          <MapArrow2to3 isRtl={isRtl} />
          <MapArrowMobile isRtl={isRtl} id="2" delay={0.6} reverse={true} />
          
          <TreasureNode title={t('hiw_step3_title')} desc={t('hiw_step3_desc')} position="3" />
        </div>
      </section>

      {/* ─── BLOG SECTION ─── */}
      <section className="landing-blog-section" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {t('blog_title_1')}<span className="text-mint">{t('blog_title_mint')}</span>
            </h2>
            <p className="section-subtitle">{t('blog_subtitle')}</p>
          </div>
          <div className="blog-marquee-wrapper">
            <div className={`blog-marquee-track ${isRtl ? 'rtl-track' : 'ltr-track'}`}>
              {[...activeArticles, ...activeArticles].map((article, idx) => {
                const catLabel = article.category === 'claims' ? t('blog_cat_claims') : article.category === 'audit' ? t('blog_cat_audit') : t('blog_cat_science');
                return (
                  <a
                    href={`/blog/${article.slug}`}
                    key={`${article.slug}-${idx}`}
                    className={`blog-card marquee-blog-card ${article.category === 'claims' ? 'cat-claims' : article.category === 'audit' ? 'cat-science' : 'cat-science'}`}
                    style={{ textDecoration: 'none', textAlign: isRtl ? 'right' : 'left', width: '350px', flexShrink: 0 }}
                  >
                    <div className="blog-card-meta-top" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <span className="blog-card-cat-badge-clean">{catLabel}</span>
                      <span className="blog-card-read-clean">
                        {article.readTime} {t('blog_read_min')}
                      </span>
                    </div>
                    <h3 className="blog-card-title">{article.seo.title.split(' | ')[0]}</h3>
                    <p className="blog-card-excerpt">{article.seo.description}</p>
                    <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start', marginTop: 'auto', paddingTop: '10px' }}>
                      <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>
                        {t('blog_read_btn')} {isRtl ? '←' : '→'}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="landing-blog-cta">
            <a href="/blog" className="landing-blog-cta-btn">
              {t('blog_cta_btn')}
            </a>
          </div>
        </div>
      </section>


      {/* 6. Footer CTA - CENTERED */}
      <section className="footer-cta" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className="grid-overlay top-fade" />
        <motion.div
          className="container cta-content"
          initial={isBot ? false : { opacity: 0, scale: 0.95 }}
          whileInView={isBot ? undefined : { opacity: 1, scale: 1 }}
          animate={isBot ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <div className="brand-logo-large">
            <img src={wathiqLogo} alt="Wathiq" />
          </div>
          <h2 className="cta-headline" style={{ color: '#fbbf24' }}>
            {t('footer_headline')}
          </h2>
          <p className="cta-sub">
            {t('footer_sub')}
          </p>

          <DownloadButtonsGroup onDownload={() => handleDownload('footer')} />

          <div className="trust-badges">
            <span className="badge"><CheckCircle size={14} /> {t('footer_badge_safe')} </span>
            <span className="badge"><CheckCircle size={14} /> {t('footer_badge_local')}</span>
            <span className="badge"><CheckCircle size={14} /> {t('footer_badge_free')}</span>
          </div>

          <div className="copyright">
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
              <a href={FB_PAGE_URL} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1' }}><Facebook size={24} /></a>
              <a href={INSTA_PAGE_URL} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1' }}><Instagram size={24} /></a>
            </div>
            <form 
              onSubmit={(e) => e.preventDefault()}
              toolname="wathiq_footer_navigation"
              tooldescription="Provides quick navigation links to Wathiq platform pages: How it Works, Scientific Research, FAQs, Privacy Policy, and Terms."
              style={{ display: 'inline' }}
            >
              <div style={{ marginBottom: '10px' }}>
                <a href="/blog" style={{ color: '#cbd5e1', textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem' }} toolparamdescription="Link to Wathiq scientific articles blog">{t('footer_nav_blog')}</a>
                <span style={{ margin: '0 10px', color: '#cbd5e1' }}>|</span>
                <a href="/how-it-works" style={{ color: '#cbd5e1', textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem' }} toolparamdescription="Link to the page describing how Wathiq works and handles cosmetic ingredient analysis">{t('footer_nav_hiw')}</a>
                <span style={{ margin: '0 10px', color: '#cbd5e1' }}>|</span>
                <a href="/research" style={{ color: '#cbd5e1', textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem' }} toolparamdescription="Link to the scientific research studies relied upon by the Wathiq platform">{t('footer_nav_research')}</a>
                <span style={{ margin: '0 10px', color: '#cbd5e1' }}>|</span>
                <a href="/faq" style={{ color: '#cbd5e1', textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem' }} toolparamdescription="Link to the Frequently Asked Questions page">{t('footer_nav_faq')}</a>
                <span style={{ margin: '0 10px', color: '#cbd5e1' }}>|</span>
                <a href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem' }} toolparamdescription="Link to the Privacy Policy document">{t('footer_nav_privacy')}</a>
                <span style={{ margin: '0 10px', color: '#cbd5e1' }}>|</span>
                <a href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem' }} toolparamdescription="Link to the Terms of Use document">{t('footer_nav_terms')}</a>
              </div>
            </form>
            <br />© {new Date().getFullYear()} {t('footer_copyright')}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

// --- REUSABLE DOWNLOAD BUTTONS COMPONENT ---
const DownloadButtonsGroup = ({ onDownload }) => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';
  
  const [isHovering, setIsHovering] = useState(false);

  const handleFbClick = () => {
    analyticsService.trackEvent('engagement', 'social_click', 'facebook_button');
    window.open(FB_PAGE_URL, '_blank');
  };

  const handleInstaClick = () => {
    analyticsService.trackEvent('engagement', 'social_click', 'instagram_button');
    window.open(INSTA_PAGE_URL, '_blank');
  };

  return (
    <div className="cta-group-modern" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <button
        className="btn-primary large play-store"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => onDownload('main')}
      >
        <Play size={32} fill="currentColor" className="play-icon" />
        <div className="btn-text-stack">
          <span className="btn-sub">{t('download_free')}</span>
          <span className="btn-title play-font">Play Store</span>
        </div>
        {isHovering && <div className="shine-effect" />}
      </button>
    </div>
  );
};

export default LandingPage;
