import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BookOpen, Award, BarChart3, Clock, Sparkles, ShoppingBag, FlaskConical, Microscope, Target, ShieldCheck, Leaf } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { ProgressTracker } from '../../utils/ProgressTracker';
import WathiqHeader from '../WathiqHeader';
import './Courses.css';

// Course data imports
import arCourses from '../../data/courses/ar';
import enCourses from '../../data/courses/en';
import frCourses from '../../data/courses/fr';

const COURSES_BY_LANG = {
  ar: arCourses,
  en: enCourses,
  fr: frCourses
};

const CoursesHome = () => {
  const { lang, t } = useLang();
  const [activeTrack, setActiveTrack] = useState('all');
  const isRTL = lang === 'ar';

  // Get courses. If empty for the current language, fall back to Arabic courses.
  const rawCourses = COURSES_BY_LANG[lang] || [];
  const coursesList = rawCourses.length > 0 ? rawCourses : arCourses;

  // Add track mapping if not present in the data objects
  const courses = coursesList.map(course => {
    let track = 'consumer'; // default
    if (course.slug === 'formulation-basics' || course.slug === 'build-your-brand') {
      track = 'formulator';
    }
    return { ...course, track };
  });

  const filteredCourses = activeTrack === 'all' 
    ? courses.filter(c => c.track !== 'formulator') 
    : courses.filter(c => c.track === activeTrack && c.track !== 'formulator');

  // Helper to translate level names
  const getLevelLabel = (level) => {
    if (level === 'beginner') return lang === 'fr' ? 'Débutant' : lang === 'en' ? 'Beginner' : 'مبتدئ';
    if (level === 'intermediate') return lang === 'fr' ? 'Intermédiaire' : lang === 'en' ? 'Intermediate' : 'متوسط';
    return lang === 'fr' ? 'Avancé' : lang === 'en' ? 'Advanced' : 'متقدم';
  };

  // Translations for course UI elements
  const uiTexts = {
    title: lang === 'fr' ? 'Académie de Cosmétologie Wathiq' : lang === 'en' ? 'Wathiq Cosmetology Academy' : 'أكاديمية وثيق للعناية',
    subtitle: lang === 'fr' ? 'Apprenez la science de la peau et de la formulation cosmétique gratuitement' : lang === 'en' ? 'Learn skin science and cosmetic formulation for free' : 'تعلّمي علم البشرة وتركيب مستحضرات التجميل مجاناً وبمنهجية علمية',
    allTracks: lang === 'fr' ? 'Tous les parcours' : lang === 'en' ? 'All Tracks' : 'جميع المسارات',
    consumerTrack: lang === 'fr' ? 'Soins de la Peau et des Cheveux' : lang === 'en' ? 'Skin & Hair Care' : 'العناية بالبشرة والشعر',
    consumerDesc: lang === 'fr' ? 'Comprenez la peau et décodez les ingrédients' : lang === 'en' ? 'Understand your skin and decode ingredients' : 'افهمي طبيعة بشرتكِ واكشفي ألاعيب التسويق',
    recipesTrack: lang === 'fr' ? 'Recettes Maison' : lang === 'en' ? 'Home Recipes' : 'وصفات منزلية',
    recipesDesc: lang === 'fr' ? 'Bientôt disponible...' : lang === 'en' ? 'Coming soon...' : 'قريباً...',
    formulatorTrack: lang === 'fr' ? 'Fabrication de Cosmétiques' : lang === 'en' ? 'Care Products Manufacturing' : 'صناعة منتجات العناية',
    formulatorDesc: lang === 'fr' ? 'Bientôt disponible...' : lang === 'en' ? 'Coming soon...' : 'قريباً...',
    lessons: lang === 'fr' ? 'leçons' : lang === 'en' ? 'lessons' : 'درس',
    hours: lang === 'fr' ? 'heures' : lang === 'en' ? 'hours' : 'ساعة',
    progress: lang === 'fr' ? 'Progression' : lang === 'en' ? 'Progress' : 'التقدم',
    btnStart: lang === 'fr' ? 'Commencer' : lang === 'en' ? 'Start Course' : 'ابدئي الدورة',
    btnContinue: lang === 'fr' ? 'Continuer' : lang === 'en' ? 'Continue' : 'متابعة التعلم',
    btnCompleted: lang === 'fr' ? 'Terminé' : lang === 'en' ? 'Completed' : 'مكتملة ✓',
  };

  const getCourseIcon = (slug) => {
    const iconProps = { size: 56, strokeWidth: 1.5, color: "rgba(255,255,255,0.85)", style: { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' } };
    if (slug === 'skin-science-101') return <Microscope {...iconProps} />;
    if (slug === 'acne-science') return <ShieldCheck {...iconProps} />;
    if (slug === 'ingredient-mastery') return <Sparkles {...iconProps} />;
    if (slug === 'formulation-basics') return <FlaskConical {...iconProps} />;
    if (slug === 'build-your-brand') return <Target {...iconProps} />;
    return <BookOpen {...iconProps} />;
  };

  return (
    <div className="landing-wrapper" style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh' }}>
      <Helmet>
        <title>{lang === 'fr' ? 'Académie Wathiq | Cours gratuits' : lang === 'en' ? 'Wathiq Academy | Free Courses' : 'أكاديمية وثيق | دورات مجانية'}</title>
        <meta name="description" content={uiTexts.subtitle} />
      </Helmet>

      <div className="grid-overlay" />

      <WathiqHeader />

      <div className="courses-container" style={{ direction: isRTL ? 'rtl' : 'ltr', paddingBottom: '0', minHeight: 'auto' }}>
        
        {/* Hero Section */}
        <header className="courses-hero" role="banner" style={{ paddingTop: '20px', paddingBottom: '0' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="courses-hero-inner"
          >

            <h1 className="courses-hero-title">
              <span className="gradient-text">{uiTexts.title}</span>
            </h1>
            <p className="courses-hero-subtitle">
              {uiTexts.subtitle}
            </p>

            <div className="courses-hero-stats">
              <div className="courses-stat">
                <span className="courses-stat-num text-mint">100%</span>
                <span className="courses-stat-label">{lang === 'fr' ? 'Scientifique' : lang === 'en' ? 'Scientific' : 'محتوى علمي'}</span>
              </div>
              <div className="courses-stat-divider" />
              <div className="courses-stat">
                <span className="courses-stat-num text-mint">{lang === 'fr' ? 'Gratuit' : lang === 'en' ? 'Free' : 'مجانًا'}</span>
                <span className="courses-stat-label">{lang === 'fr' ? 'Pour tous' : lang === 'en' ? 'For everyone' : 'لجميع المستخدمين'}</span>
              </div>
              <div className="courses-stat-divider" />
              <div className="courses-stat">
                <span className="courses-stat-num text-mint">{lang === 'fr' ? 'Sans' : lang === 'en' ? 'No' : 'بدون'}</span>
                <span className="courses-stat-label">{lang === 'fr' ? 'Inscription' : lang === 'en' ? 'Login Needed' : 'تسجيل دخول'}</span>
              </div>
              <div className="courses-stat-divider" />
              <div className="courses-stat">
                <span className="courses-stat-num text-mint">∞</span>
                <span className="courses-stat-label">{lang === 'fr' ? 'À votre rythme' : lang === 'en' ? 'Finish Anytime' : 'بسرعتك الخاصة'}</span>
              </div>
            </div>

          </motion.div>
        </header>
      </div>

      {/* Full-width News Ticker */}
      <div className="news-ticker-fullwidth-wrapper" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="news-ticker-container">
          <div className="news-ticker-scroll">
            <div className="news-ticker-track-container">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="news-ticker-track" aria-hidden={index !== 1 ? "true" : undefined}>
                  <span className="ticker-item"><Award size={14} /> {lang === 'fr' ? 'Certificat de participation PDF gratuit à la fin' : lang === 'en' ? 'Free PDF certificate of participation upon completion' : 'شهادة مشاركة PDF مجانية عند إتمام كل دورة'}</span>
                  <span className="ticker-item"><Clock size={14} /> {lang === 'fr' ? 'Votre progression est sauvegardée, continuez à tout moment' : lang === 'en' ? 'Progress is saved, you can continue anytime' : 'يتم حفظ تقدمك تلقائياً لتعودي متى شئتِ'}</span>
                  <span className="ticker-item"><BookOpen size={14} /> {lang === 'fr' ? 'Nouveau contenu ajouté chaque semaine' : lang === 'en' ? 'New content added weekly' : 'محتوى متجدد ودورات جديدة تضاف باستمرار'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="courses-container" style={{ direction: isRTL ? 'rtl' : 'ltr', paddingTop: '0' }}>
        {/* Track Selector */}
        <section className="tracks-section">
          <div className="tracks-tabs-container" style={{ maxWidth: '850px' }}>
            <div 
              className={`track-tab ${activeTrack === 'consumer' ? 'active-track' : ''}`}
              onClick={() => setActiveTrack(activeTrack === 'consumer' ? 'all' : 'consumer')}
            >
              <Sparkles size={18} color={activeTrack === 'consumer' ? '#fff' : '#cbd5e1'} strokeWidth={2} />
              <span className="track-tab-title">{uiTexts.consumerTrack}</span>
            </div>

            <div 
              className="track-tab disabled-tab"
              title={uiTexts.recipesDesc}
            >
              <Leaf size={18} color="#cbd5e1" strokeWidth={2} />
              <span className="track-tab-title">
                {uiTexts.recipesTrack}
                <span className="track-tab-desc">({uiTexts.recipesDesc})</span>
              </span>
            </div>

            <div 
              className="track-tab disabled-tab"
              title={uiTexts.formulatorDesc}
            >
              <FlaskConical size={18} color="#cbd5e1" strokeWidth={2} />
              <span className="track-tab-title">
                {uiTexts.formulatorTrack}
                <span className="track-tab-desc">({uiTexts.formulatorDesc})</span>
              </span>
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <main className="courses-grid">
          {filteredCourses.map((course) => {
            const progress = ProgressTracker.getCompletionPercentage(course.slug, course);
            const isStarted = ProgressTracker.getCourseProgress(course.slug).startedAt !== null;
            const isCompleted = progress === 100;

            let buttonText = uiTexts.btnStart;
            if (isCompleted) {
              buttonText = uiTexts.btnCompleted;
            } else if (isStarted) {
              buttonText = uiTexts.btnContinue;
            }

            return (
              <article key={course.slug} className="course-card">
                <div className="course-card-banner">
                  {getCourseIcon(course.slug)}
                  <span className={`course-level-badge ${course.level}`}>
                    {getLevelLabel(course.level)}
                  </span>
                </div>

                <div className="course-card-content">
                  <h2 className="course-title">{course.meta.title}</h2>
                  <p className="course-desc">{course.meta.subtitle}</p>

                  <div className="course-meta-row">
                    <div className="course-meta-item">
                      <BookOpen size={14} />
                      <span>{course.totalLessons} {uiTexts.lessons}</span>
                    </div>
                    <div className="course-meta-item">
                      <Clock size={14} />
                      <span>{course.estimatedHours} {uiTexts.hours}</span>
                    </div>
                  </div>

                  {isStarted && (
                    <div className="course-progress-wrap">
                      <div className="course-progress-header">
                        <span>{uiTexts.progress}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="course-progress-bar-bg">
                        <div 
                          className="course-progress-bar" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Link 
                    to={`/courses/${course.slug}`} 
                    style={{ textDecoration: 'none' }}
                  >
                    <button className="course-card-btn">
                      {buttonText}
                    </button>
                  </Link>
                </div>
              </article>
            );
          })}
        </main>
      </div>
    </div>
  );
};

export default CoursesHome;
