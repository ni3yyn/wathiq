import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, BookOpen, Clock, Award, Star, ListChecks } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { ProgressTracker } from '../../utils/ProgressTracker';
import { motion } from 'framer-motion';
import CertificateCTA from './CertificateCTA';
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

const CourseSyllabus = () => {
  const { courseSlug } = useParams();
  const { lang } = useLang();
  const navigate = useNavigate();

  const isRTL = lang === 'ar';

  // Get active language courses or fallback to Arabic
  const rawCourses = COURSES_BY_LANG[lang] || [];
  const coursesList = rawCourses.length > 0 ? rawCourses : arCourses;

  // Find course matching the slug
  const course = useMemo(() => {
    return coursesList.find(c => c.slug === courseSlug || c.translations?.[lang] === courseSlug || c.translations?.ar === courseSlug);
  }, [courseSlug, coursesList, lang]);

  if (!course) {
    return (
      <div className="landing-wrapper" style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>{lang === 'fr' ? 'Cours non trouvé' : lang === 'en' ? 'Course not found' : 'الدورة غير موجودة'}</h2>
          <Link to="/courses" style={{ color: '#10b981', marginTop: '20px', display: 'inline-block' }}>
            {lang === 'fr' ? 'Retour aux cours' : lang === 'en' ? 'Back to courses' : 'العودة للدورات'}
          </Link>
        </div>
      </div>
    );
  }

  // Get progress
  const progressPercent = ProgressTracker.getCompletionPercentage(course.slug, course);
  const isStarted = ProgressTracker.getCourseProgress(course.slug).startedAt !== null;
  const isCompleted = ProgressTracker.isCourseCompleted(course.slug, course);

  // Flatten lessons to find the first incomplete lesson for the CTA button
  const allLessons = useMemo(() => {
    const list = [];
    course.modules.forEach(mod => {
      if (mod.lessons) {
        list.push(...mod.lessons);
      }
    });
    return list;
  }, [course]);

  const firstIncompleteLesson = useMemo(() => {
    return allLessons.find(l => !ProgressTracker.isLessonCompleted(course.slug, l.slug)) || allLessons[0];
  }, [allLessons, course.slug]);

  const handleCtaClick = () => {
    if (!isCompleted) {
      navigate(`/courses/${course.slug}/${firstIncompleteLesson.slug}`);
    }
    // If completed, CertificateCTA handles the click directly
  };

  const getLevelLabel = (level) => {
    if (level === 'beginner') return lang === 'fr' ? 'Débutant' : lang === 'en' ? 'Beginner' : 'مبتدئ';
    if (level === 'intermediate') return lang === 'fr' ? 'Intermédiaire' : lang === 'en' ? 'Intermediate' : 'متوسط';
    return lang === 'fr' ? 'Avancé' : lang === 'en' ? 'Advanced' : 'متقدم';
  };

  const uiTexts = {
    back: lang === 'fr' ? 'Retour aux cours' : lang === 'en' ? 'Back to Courses' : 'العودة إلى الدورات',
    learnTitle: lang === 'fr' ? "Ce que vous allez apprendre" : lang === 'en' ? "What you'll learn" : "ماذا ستتعلمين في هذه الدورة؟",
    duration: lang === 'fr' ? 'Durée estimée' : lang === 'en' ? 'Est. Duration' : 'المدة المقدرة',
    level: lang === 'fr' ? 'Niveau' : lang === 'en' ? 'Level' : 'المستوى',
    progress: lang === 'fr' ? 'Votre Progression' : lang === 'en' ? 'Your Progress' : 'تقدمك في الدورة',
    lessons: lang === 'fr' ? 'leçons' : lang === 'en' ? 'lessons' : 'درس',
    hours: lang === 'fr' ? 'heures' : lang === 'en' ? 'hours' : 'ساعة',
    btnStart: lang === 'fr' ? 'Commencer la Dourse' : lang === 'en' ? 'Start Course' : 'ابدئي الدورة الآن',
    btnContinue: lang === 'fr' ? 'Reprendre' : lang === 'en' ? 'Resume' : 'إكمال:',
    btnCert: lang === 'fr' ? 'Voir le Certificat' : lang === 'en' ? 'Claim Certificate' : 'احصلي على الشهادة 🎓',
  };

  return (
    <div className="landing-wrapper" style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh' }}>
      <Helmet>
        <title>{lang === 'ar' ? `وثيق | ${course.meta.title}` : `Wathiq | ${course.meta.title}`}</title>
        <meta name="description" content={course.meta.subtitle} />
      </Helmet>

      <motion.div 
        className="syllabus-container" 
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        
        {/* Back Link */}
        <Link to="/courses" className="syllabus-back-btn">
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{uiTexts.back}</span>
        </Link>

        {/* Syllabus Header Card */}
        <header className="syllabus-header">
          <div className="syllabus-header-top">
            <div>
              <h1 className="syllabus-title">{course.meta.title}</h1>
              <p className="syllabus-subtitle">{course.meta.subtitle}</p>
            </div>
            <span style={{ fontSize: '3.5rem' }}>{course.coverEmoji}</span>
          </div>

          <div className="syllabus-stats-row">
            <div className="syllabus-stat-box">
              <div className="syllabus-stat-label">{uiTexts.duration}</div>
              <div className="syllabus-stat-value">{course.estimatedHours} {uiTexts.hours}</div>
            </div>
            <div className="syllabus-stat-box">
              <div className="syllabus-stat-label">{uiTexts.lessons}</div>
              <div className="syllabus-stat-value">{course.totalLessons}</div>
            </div>
          </div>

          {isStarted && (
            <div className="course-progress-wrap" style={{ marginTop: '24px' }}>
              <div className="course-progress-header">
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{uiTexts.progress}</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>{progressPercent}%</span>
              </div>
              <div className="course-progress-bar-bg">
                <div 
                  className="course-progress-bar" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </header>

        {/* What You'll Learn Checklist */}
        <section className="syllabus-learn-card">
          <h3 className="syllabus-learn-title">
            <ListChecks size={18} />
            <span>{uiTexts.learnTitle}</span>
          </h3>
          <div className="syllabus-learn-list">
            {course.meta.whatYoullLearn.map((item, i) => (
              <div key={i} className="syllabus-learn-item">
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Modules Accordion */}
        <section className="syllabus-modules-list">
          {course.modules.map((mod, mi) => (
            <div key={mod.id} className="syllabus-module-wrap">
              <div className="syllabus-module-header">
                <h3 className="syllabus-module-title">{mod.title}</h3>
              </div>
              <div className="syllabus-lessons-list">
                {mod.lessons.map((lesson) => {
                  const isCompleted = ProgressTracker.isLessonCompleted(course.slug, lesson.slug);
                  const isUnlocked = ProgressTracker.isLessonUnlocked(course.slug, lesson.slug, course);

                  return (
                    <motion.div
                      key={lesson.slug}
                      whileHover={isUnlocked ? { scale: 1.02, x: isRTL ? -5 : 5 } : {}}
                      whileTap={isUnlocked ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Link
                        to={isUnlocked ? `/courses/${course.slug}/${lesson.slug}` : '#'}
                        onClick={(e) => {
                          if (!isUnlocked) {
                            e.preventDefault();
                          }
                        }}
                        className={`syllabus-lesson-row ${!isUnlocked ? 'locked' : ''}`}
                        style={{ display: 'flex', textDecoration: 'none' }}
                      >
                        <div className="syllabus-lesson-info">
                          <div className={`syllabus-lesson-status ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'}`}>
                            {isCompleted ? <CheckCircle2 size={18} /> : !isUnlocked ? <Lock size={16} /> : null}
                          </div>
                          <span className="syllabus-lesson-title">{lesson.title}</span>
                        </div>

                        <div className="syllabus-lesson-meta">
                          <Clock size={12} />
                          <span>{lesson.readTime} {lang === 'ar' ? 'دقائق' : 'min'}</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* CTA: Certificate flow (inline) or Start/Continue button */}
        {isCompleted ? (
          <CertificateCTA
            lang={lang}
            courseTitle={course.meta.title}
            courseSlug={course.slug}
          />
        ) : (
          <div className="syllabus-start-btn-wrap">
            <motion.button 
              className="syllabus-start-btn"
              onClick={handleCtaClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isStarted ? (
                <>
                  <BookOpen size={18} />
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: isRTL ? 'right' : 'left' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: 1 }}>{uiTexts.btnContinue}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{firstIncompleteLesson.title}</span>
                  </span>
                </>
              ) : (
                <>
                  <PlayCtaIcon isRTL={isRTL} />
                  <span>{uiTexts.btnStart}</span>
                </>
              )}
            </motion.button>
          </div>
        )}

      </motion.div>
    </div>
  );
};

// Play icon component based on direction
const PlayCtaIcon = ({ isRTL }) => {
  return isRTL ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor"></polygon>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
    </svg>
  );
};

export default CourseSyllabus;
