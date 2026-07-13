import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import './Courses.css';

// ── Shuffle utility (Fisher-Yates) ─────────────────────
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Build a shuffled copy of a question.
 * Returns { ...question, options: shuffledOptions, correctIndex: newCorrectIdx }
 */
const shuffleQuestion = (q) => {
  const correctText = q.options[q.correct];
  const shuffled = shuffleArray(q.options);
  return {
    ...q,
    options: shuffled,
    correct: shuffled.indexOf(correctText),
  };
};

const QuizEngine = ({ quiz, onPass, initiallyCompleted, onRetake }) => {
  const { lang } = useLang();
  const [active, setActive] = useState(!initiallyCompleted);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [shakeKey, setShakeKey] = useState(0); // triggers shake animation
  const [popKey, setPopKey] = useState(0);     // triggers checkmark pop
  const cardRef = useRef(null);

  const rawQuestions = quiz.questions || [];
  const passingScore = quiz.passingScore || 70;
  const totalQ = rawQuestions.length;

  // ── Shuffle all questions on mount and on restart ──
  const [shuffledQuestions, setShuffledQuestions] = useState(() =>
    rawQuestions.map(shuffleQuestion)
  );

  const activeQuestion = shuffledQuestions[currentIdx];

  // ── Option click handler with micro-interaction triggers ──
  const handleOptionClick = useCallback((optIndex) => {
    if (isAnswered) return;
    setSelectedOpt(optIndex);
    setIsAnswered(true);

    if (optIndex === activeQuestion.correct) {
      setCorrectCount(prev => prev + 1);
      setPopKey(k => k + 1);
    } else {
      setShakeKey(k => k + 1);
    }
  }, [isAnswered, activeQuestion]);

  // ── Next question ──
  const handleNext = useCallback(() => {
    setIsAnswered(false);
    setSelectedOpt(null);

    if (currentIdx < totalQ - 1) {
      // If the user answered wrong, re-shuffle the NEXT question's options
      // (visual refresh so the quiz feels dynamic)
      setShuffledQuestions(prev => {
        const copy = [...prev];
        copy[currentIdx + 1] = shuffleQuestion(rawQuestions[currentIdx + 1]);
        return copy;
      });
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowSummary(true);
      const score = Math.round(((correctCount) / totalQ) * 100);
      if (score >= passingScore) {
        onPass(score);
      }
    }
  }, [currentIdx, totalQ, correctCount, passingScore, onPass, rawQuestions]);

  // ── Restart: full re-shuffle ──
  const handleRestart = useCallback(() => {
    setShuffledQuestions(rawQuestions.map(shuffleQuestion));
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setShowSummary(false);
    setActive(true);
    if (onRetake) onRetake();
  }, [rawQuestions, onRetake]);

  // ── i18n ──
  const uiTexts = {
    quizTitle: lang === 'fr' ? 'Évaluation des connaissances' : lang === 'en' ? 'Knowledge Check' : 'اختبار قصير لمكتسباتك',
    questionOf: lang === 'fr' ? (c, t) => `Question ${c} sur ${t}` : lang === 'en' ? (c, t) => `Question ${c} of ${t}` : (c, t) => `السؤال ${c} من ${t}`,
    correct: lang === 'fr' ? 'Correct !' : lang === 'en' ? 'Correct!' : 'إجابة صحيحة!',
    incorrect: lang === 'fr' ? 'Incorrect' : lang === 'en' ? 'Incorrect' : 'إجابة خاطئة',
    explanation: lang === 'fr' ? 'Explication :' : lang === 'en' ? 'Explanation:' : 'التفسير العلمي:',
    next: lang === 'fr' ? 'Suivant' : lang === 'en' ? 'Next' : 'التالي',
    finish: lang === 'fr' ? 'Terminer' : lang === 'en' ? 'Finish' : 'إنهاء الاختبار',
    passed: lang === 'fr' ? 'Félicitations ! Vous avez réussi.' : lang === 'en' ? 'Congratulations! You passed.' : 'تهانينا! لقد اجتزت الاختبار بنجاح.',
    failed: lang === 'fr' ? 'Vous n\'avez pas atteint le score requis.' : lang === 'en' ? 'You did not reach the passing score.' : 'لم تحقق درجة النجاح المطلوبة هذه المرة.',
    req: lang === 'fr' ? `Requis : ${passingScore}%` : lang === 'en' ? `Required: ${passingScore}%` : `الدرجة المطلوبة: ${passingScore}%`,
    btnRetake: lang === 'fr' ? 'Recommencer' : lang === 'en' ? 'Retake Quiz' : 'إعادة المحاولة',
    completedBadge: lang === 'fr' ? 'Quiz Complété' : lang === 'en' ? 'Quiz Completed' : 'الكويز مكتمل ✓',
    completedDesc: lang === 'fr' ? 'Vous avez déjà réussi ce quiz.' : lang === 'en' ? 'You have already passed this quiz.' : 'لقد قمت باجتياز هذا الاختبار سابقاً بنجاح.',
  };

  // ─── Case 1: Already completed ───
  if (!active && initiallyCompleted && !showSummary) {
    return (
      <div className="quiz-section">
        <div className="quiz-results-card">
          <div className="quiz-badge">{uiTexts.completedBadge}</div>
          <h3 className="quiz-result-status pass">{uiTexts.completedBadge}</h3>
          <p className="quiz-result-text">{uiTexts.completedDesc}</p>
          <button className="lesson-nav-btn" onClick={handleRestart}>
            <RotateCcw size={16} />
            <span>{uiTexts.btnRetake}</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Case 2: Results summary ───
  if (showSummary) {
    const finalScore = Math.round((correctCount / totalQ) * 100);
    const hasPassed = finalScore >= passingScore;

    return (
      <div className="quiz-section">
        <div className="quiz-results-card">
          <div className={`quiz-result-score ${hasPassed ? 'quiz-score-pop' : ''}`}>{finalScore}%</div>
          <h3 className={`quiz-result-status ${hasPassed ? 'pass' : 'fail'}`}>
            {hasPassed ? uiTexts.passed : uiTexts.failed}
          </h3>
          <p className="quiz-result-text">
            {uiTexts.req} • {correctCount} / {totalQ} {lang === 'ar' ? 'إجابات صحيحة' : 'correct answers'}
          </p>
          <div className="quiz-results-btns">
            {!hasPassed && (
              <button className="syllabus-start-btn" onClick={handleRestart} style={{ position: 'static', transform: 'none', width: 'auto' }}>
                <RotateCcw size={16} />
                <span>{uiTexts.btnRetake}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Case 3: Active question ───
  const isCorrectAnswer = isAnswered && selectedOpt === activeQuestion.correct;
  const isWrongAnswer = isAnswered && selectedOpt !== activeQuestion.correct;

  return (
    <div className="quiz-section">
      <div className="quiz-header">
        <span className="quiz-badge">{uiTexts.quizTitle}</span>
        <h3 className="quiz-title">{activeQuestion.question}</h3>
      </div>

      <div
        ref={cardRef}
        className={`quiz-question-card ${isWrongAnswer ? 'quiz-shake' : ''}`}
        key={`card-${currentIdx}-${shakeKey}`}
      >
        {/* Progress dots */}
        <div className="quiz-question-number">
          {uiTexts.questionOf(currentIdx + 1, totalQ)}
          <div className="quiz-progress-dots">
            {shuffledQuestions.map((_, i) => (
              <span
                key={i}
                className={`quiz-dot ${i === currentIdx ? 'active' : i < currentIdx ? 'done' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="quiz-options-list">
          {activeQuestion.options.map((option, oIdx) => {
            let optClass = '';
            let optIcon = null;

            if (isAnswered) {
              if (oIdx === activeQuestion.correct) {
                optClass = 'correct quiz-opt-correct-pop';
                optIcon = (
                  <span className="quiz-check-icon" key={`pop-${popKey}`}>
                    <Check size={16} />
                  </span>
                );
              } else if (oIdx === selectedOpt) {
                optClass = 'wrong quiz-opt-wrong-shake';
                optIcon = (
                  <span className="quiz-x-icon">
                    <X size={16} />
                  </span>
                );
              } else {
                optClass = 'disabled';
              }
            }

            return (
              <button
                key={`${currentIdx}-${oIdx}`}
                className={`quiz-option-btn ${optClass}`}
                onClick={() => handleOptionClick(oIdx)}
                disabled={isAnswered}
              >
                <span>{option}</span>
                {optIcon}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className={`quiz-feedback-box ${isCorrectAnswer ? 'correct' : 'wrong'}`}>
          <div className="quiz-feedback-header">
            {isCorrectAnswer ? uiTexts.correct : uiTexts.incorrect}
          </div>
          <div>{activeQuestion.explanation}</div>
        </div>
      )}

      {isAnswered && (
        <div className="quiz-action-bar">
          <button className="quiz-next-btn" onClick={handleNext}>
            {currentIdx < totalQ - 1 ? uiTexts.next : uiTexts.finish}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizEngine;
export { QuizEngine };
