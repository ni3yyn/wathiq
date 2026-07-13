import React from 'react';
import { XCircle, AlertOctagon, FlaskConical, ShieldCheck, Award, Clock, BookOpen } from 'lucide-react';
import { useLang } from '../context/LangContext';
import enLanding from '../data/translations/landing/en';
import frLanding from '../data/translations/landing/fr';
import arLanding from '../data/translations/landing/ar';
import './NewsTicker.css';

const landingTranslations = {
  en: enLanding,
  fr: frLanding,
  ar: arLanding
};

const academyTranslations = {
  ar: {
    cert: 'شهادة مشاركة PDF مجانية عند إتمام كل دورة',
    progress: 'يتم حفظ تقدمك تلقائياً لتعودي متى شئتِ',
    content: 'محتوى متجدد ودورات جديدة تضاف باستمرار'
  },
  en: {
    cert: 'Free PDF certificate of participation upon completion',
    progress: 'Progress is saved, you can continue anytime',
    content: 'New content added weekly'
  },
  fr: {
    cert: 'Certificat de participation PDF gratuit à la fin',
    progress: 'Votre progression est sauvegardée, continuez à tout moment',
    content: 'Nouveau contenu ajouté chaque semaine'
  }
};

const TickerBase = ({ items, isRtl, className = '' }) => (
  <div className={`unified-ticker-wrapper ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
    <div className="unified-ticker-content">
      {[...Array(6)].map((_, trackIndex) => (
        <div key={trackIndex} className="ticker-track" aria-hidden={trackIndex !== 0 ? "true" : undefined}>
          {items.map((item, i) => (
            <span key={i} className="unified-ticker-item">
              {item.icon} {item.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const LandingTicker = () => {
  const { lang } = useLang();
  const t = (key) => landingTranslations[lang]?.[key] ?? landingTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  const items = [
    { icon: <XCircle className="ticker-icon-bad" />, text: t('ticker_paraben') },
    { icon: <AlertOctagon className="ticker-icon-warn" />, text: t('ticker_dusting') },
    { icon: <XCircle className="ticker-icon-bad" />, text: t('ticker_fragrance') },
    { icon: <FlaskConical className="ticker-icon-science" />, text: t('ticker_conflict') },
    { icon: <ShieldCheck className="ticker-icon-good" />, text: t('ticker_science') }
  ];

  return <TickerBase items={items} isRtl={isRtl} className="landing-ticker-margin" />;
};

export const AcademyTicker = () => {
  const { lang } = useLang();
  const t = (key) => academyTranslations[lang]?.[key] ?? academyTranslations['ar']?.[key] ?? key;
  const isRtl = lang === 'ar';

  const items = [
    { icon: <Award size={18} className="ticker-icon-academy" />, text: t('cert') },
    { icon: <Clock size={18} className="ticker-icon-academy" />, text: t('progress') },
    { icon: <BookOpen size={18} className="ticker-icon-academy" />, text: t('content') }
  ];

  return <TickerBase items={items} isRtl={isRtl} className="academy-ticker-margin" />;
};
