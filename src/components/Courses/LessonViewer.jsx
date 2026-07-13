import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, BookOpen, Clock, ChevronLeft, ChevronRight, CheckCircle2, Award } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { ProgressTracker } from '../../utils/ProgressTracker';
import { motion, AnimatePresence } from 'framer-motion';
import BlockRenderer from '../Blog/BlockRenderer';
import QuizEngine from './QuizEngine';
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

const LessonViewer = () => {
  const { courseSlug, lessonSlug } = useParams();
  const { lang } = useLang();
  const navigate = useNavigate();
  
  const [quizActive, setQuizActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const quizRef = useRef(null);
  const nextBtnRef = useRef(null);

  const isRTL = lang === 'ar';

  // Get active language courses or fallback to Arabic
  const rawCourses = COURSES_BY_LANG[lang] || [];
  const coursesList = rawCourses.length > 0 ? rawCourses : arCourses;

  // Find course
  const course = useMemo(() => {
    return coursesList.find(c => c.slug === courseSlug || c.translations?.[lang] === courseSlug || c.translations?.ar === courseSlug);
  }, [courseSlug, coursesList, lang]);

  // Flatten lessons list to find next/prev & indices
  const allLessons = useMemo(() => {
    if (!course) return [];
    const list = [];
    course.modules.forEach(mod => {
      if (mod.lessons) {
        list.push(...mod.lessons.map(l => ({ ...l, moduleTitle: mod.title })));
      }
    });
    return list;
  }, [course]);

  // Find active lesson and index
  const lessonIndex = useMemo(() => {
    return allLessons.findIndex(l => l.slug === lessonSlug);
  }, [allLessons, lessonSlug]);

  const lesson = useMemo(() => {
    return allLessons[lessonIndex];
  }, [allLessons, lessonIndex]);

  // Lock protection: redirect if the lesson is locked
  useEffect(() => {
    if (course && lesson) {
      const isUnlocked = ProgressTracker.isLessonUnlocked(course.slug, lesson.slug, course);
      if (!isUnlocked) {
        navigate(`/courses/${course.slug}`, { replace: true });
      } else {
        // Record last accessed lesson
        ProgressTracker.setLastAccessed(course.slug, lesson.slug);
      }
    }
  }, [course, lesson, navigate]);

  // Reset quiz state when switching lessons
  useEffect(() => {
    setQuizActive(false);
    if (course && lessonSlug) {
      setIsCompleted(ProgressTracker.isLessonCompleted(course.slug, lessonSlug));
    }
    window.scrollTo(0, 0);
  }, [lessonSlug, course]);

  // Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!course || !lesson) {
    return (
      <div className="landing-wrapper" style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>{lang === 'fr' ? 'Leçon non trouvée' : lang === 'en' ? 'Lesson not found' : 'الدرس غير موجود'}</h2>
          <Link to="/courses" style={{ color: '#10b981', marginTop: '20px', display: 'inline-block' }}>
            {lang === 'fr' ? 'Retour aux cours' : lang === 'en' ? 'Back to courses' : 'العودة للدورات'}
          </Link>
        </div>
      </div>
    );
  }

  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  // Handle quiz passing
  const handleQuizPass = (score) => {
    ProgressTracker.completeLesson(course.slug, lesson.slug, score);
    setIsCompleted(true);
    // Auto-scroll to next button
    setTimeout(() => {
      if (nextBtnRef.current) {
        nextBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const handleStartQuiz = () => {
    setQuizActive(true);
    setTimeout(() => {
      if (quizRef.current) {
        quizRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const uiTexts = {
    courses: lang === 'fr' ? 'Cours' : lang === 'en' ? 'Courses' : 'الدورات',
    syllabus: lang === 'fr' ? 'Programme' : lang === 'en' ? 'Syllabus' : 'الفهرس',
    min: lang === 'fr' ? 'min' : lang === 'en' ? 'min' : 'دقائق',
    prev: lang === 'fr' ? 'Précédent' : lang === 'en' ? 'Previous' : 'الدرس السابق',
    next: lang === 'fr' ? 'Suivant' : lang === 'en' ? 'Next' : 'الدرس التالي',
    completeAndQuiz: lang === 'fr' ? 'Compléter & Passer le Quiz' : lang === 'en' ? 'Complete & Start Quiz' : 'أكملت القراءة والذهاب للكويز',
    quizPassed: lang === 'fr' ? 'Quiz réussi ✓' : lang === 'en' ? 'Quiz Passed ✓' : 'اجتزت الكويز بنجاح ✓',
    quizRetake: lang === 'fr' ? 'Repasser le Quiz' : lang === 'en' ? 'Retake Quiz' : 'إعادة اختبار الكويز',
    finishCourse: lang === 'fr' ? 'Terminer le cours' : lang === 'en' ? 'Finish Course' : 'إنهاء الدورة',
  };

  return (
    <div className="landing-wrapper" style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', position: 'relative' }}>
      <Helmet>
        <title>{lang === 'ar' ? `وثيق | ${lesson.title} - ${course.meta.title}` : `Wathiq | ${lesson.title} - ${course.meta.title}`}</title>
        <meta name="description" content={lesson.title} />
      </Helmet>

      {/* Sticky Scroll Progress Bar */}
      <div className="lesson-sticky-progress-container">
        <div className="lesson-sticky-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      <motion.div 
        className="lesson-container" 
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        key={lesson.slug} // Ensures component remounts and re-animates on lesson change
        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        
        {/* Top bar with Breadcrumbs */}
        <div className="lesson-top-bar">
          <div className="lesson-breadcrumbs">
            <Link to="/courses">{uiTexts.courses}</Link>
            <span>/</span>
            <Link to={`/courses/${course.slug}`}>{course.meta.title}</Link>
            <span>/</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{lesson.title}</span>
          </div>
          <div className="lesson-time">
            <Clock size={14} />
            <span>{lesson.readTime} {uiTexts.min}</span>
          </div>
        </div>

        {/* Lesson Header */}
        <header className="lesson-header">
          <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            {lesson.moduleTitle}
          </span>
          <h1 className="lesson-title">{lesson.title}</h1>
        </header>

        {/* Lesson Content Rendered via BlockRenderer */}
        <main className="lesson-body-content">
          <BlockRenderer blocks={lesson.content} />
        </main>

        {/* Quiz Section Trigger or Quiz Block */}
        <section style={{ marginTop: '50px' }} ref={quizRef}>
          <AnimatePresence mode="wait">
            {!quizActive && !isCompleted && (
              <motion.div
                key="start-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <motion.button 
                  className="lesson-nav-btn primary-nav" 
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1.05rem', border: 'none', cursor: 'pointer' }}
                  onClick={handleStartQuiz}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle2 size={18} />
                  <span>{uiTexts.completeAndQuiz}</span>
                </motion.button>
              </motion.div>
            )}

            {(quizActive || isCompleted) && lesson.quiz && (
              <motion.div 
                key="quiz-block"
                className="lesson-quiz-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <QuizEngine 
                  quiz={lesson.quiz} 
                  onPass={handleQuizPass} 
                  initiallyCompleted={isCompleted}
                  onRetake={() => setQuizActive(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Lesson Footer Navigation */}
        <footer className="lesson-footer-nav" style={{ display: 'flex', gap: '12px' }}>
          {prevLesson ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
              <Link 
                to={`/courses/${course.slug}/${prevLesson.slug}`} 
                className="lesson-nav-btn"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                <span>{uiTexts.prev}</span>
              </Link>
            </motion.div>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {nextLesson ? (
            <motion.div whileHover={ProgressTracker.isLessonUnlocked(course.slug, nextLesson.slug, course) ? { scale: 1.03 } : {}} whileTap={ProgressTracker.isLessonUnlocked(course.slug, nextLesson.slug, course) ? { scale: 0.95 } : {}} style={{ flex: 1 }}>
              <Link 
                ref={nextBtnRef}
                to={`/courses/${course.slug}/${nextLesson.slug}`} 
                className={`lesson-nav-btn ${isCompleted ? 'primary-nav pulse-success' : ''}`}
                style={{ width: '100%', textDecoration: 'none', opacity: ProgressTracker.isLessonUnlocked(course.slug, nextLesson.slug, course) ? 1 : 0.5, pointerEvents: ProgressTracker.isLessonUnlocked(course.slug, nextLesson.slug, course) ? 'auto' : 'none' }}
              >
                <span>{uiTexts.next}</span>
                {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </Link>
            </motion.div>
          ) : (
            <motion.div whileHover={isCompleted ? { scale: 1.03 } : {}} whileTap={isCompleted ? { scale: 0.95 } : {}} style={{ flex: 1 }}>
              <Link 
                ref={nextBtnRef}
                to={`/courses/${course.slug}`} 
                className={`lesson-nav-btn ${isCompleted ? 'primary-nav pulse-success' : ''}`}
                style={{ width: '100%', textDecoration: 'none', opacity: isCompleted ? 1 : 0.5, pointerEvents: isCompleted ? 'auto' : 'none' }}
              >
                <span>{uiTexts.finishCourse}</span>
                <Award size={18} />
              </Link>
            </motion.div>
          )}
        </footer>

      </motion.div>
    </div>
  );
};

export default LessonViewer;
