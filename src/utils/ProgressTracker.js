// Wathiq Courses Progress Tracker Utility
// Saves and loads course progression from localStorage

const STORAGE_KEY = 'wathiq_courses';

const getRawProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading course progress from localStorage', e);
    return {};
  }
};

const saveRawProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving course progress to localStorage', e);
  }
};

export const ProgressTracker = {
  // Get progress for a specific course
  getCourseProgress(courseSlug) {
    const progress = getRawProgress();
    return progress[courseSlug] || {
      completedLessons: [],
      quizScores: {},
      startedAt: null,
      lastAccessedLesson: null,
    };
  },

  // Mark a lesson as completed
  completeLesson(courseSlug, lessonSlug, quizScore = null) {
    const progress = getRawProgress();
    if (!progress[courseSlug]) {
      progress[courseSlug] = {
        completedLessons: [],
        quizScores: {},
        startedAt: new Date().toISOString().split('T')[0],
        lastAccessedLesson: lessonSlug,
      };
    }

    if (!progress[courseSlug].completedLessons.includes(lessonSlug)) {
      progress[courseSlug].completedLessons.push(lessonSlug);
    }

    if (quizScore !== null) {
      progress[courseSlug].quizScores[lessonSlug] = quizScore;
    }

    progress[courseSlug].lastAccessedLesson = lessonSlug;
    saveRawProgress(progress);
    return progress[courseSlug];
  },

  // Save the last accessed lesson
  setLastAccessed(courseSlug, lessonSlug) {
    const progress = getRawProgress();
    if (!progress[courseSlug]) {
      progress[courseSlug] = {
        completedLessons: [],
        quizScores: {},
        startedAt: new Date().toISOString().split('T')[0],
        lastAccessedLesson: lessonSlug,
      };
    } else {
      progress[courseSlug].lastAccessedLesson = lessonSlug;
    }
    saveRawProgress(progress);
  },

  // Check if a lesson is completed
  isLessonCompleted(courseSlug, lessonSlug) {
    const courseProgress = this.getCourseProgress(courseSlug);
    return courseProgress.completedLessons.includes(lessonSlug);
  },

  // Check if a lesson is unlocked (sequential completion check)
  isLessonUnlocked(courseSlug, lessonSlug, courseData) {
    if (!courseData || !courseData.modules) return false;

    // Flatten all lessons into an ordered array
    const allLessons = [];
    courseData.modules.forEach(mod => {
      if (mod.lessons) {
        allLessons.push(...mod.lessons);
      }
    });

    const index = allLessons.findIndex(l => l.slug === lessonSlug);
    if (index === -1) return false;
    if (index === 0) return true; // First lesson is always unlocked

    // Previous lesson must be completed
    const prevLesson = allLessons[index - 1];
    return this.isLessonCompleted(courseSlug, prevLesson.slug);
  },

  // Get percentage completion (0 to 100)
  getCompletionPercentage(courseSlug, courseData) {
    if (!courseData || !courseData.modules) return 0;
    
    // Count total lessons
    let total = 0;
    courseData.modules.forEach(mod => {
      if (mod.lessons) {
        total += mod.lessons.length;
      }
    });

    if (total === 0) return 0;

    const courseProgress = this.getCourseProgress(courseSlug);
    const completed = courseProgress.completedLessons.length;
    return Math.round((completed / total) * 100);
  },

  // Check if entire course is completed
  isCourseCompleted(courseSlug, courseData) {
    if (!courseData || !courseData.modules) return false;
    const percentage = this.getCompletionPercentage(courseSlug, courseData);
    return percentage === 100;
  },

  // Reset course progress
  resetCourseProgress(courseSlug) {
    const progress = getRawProgress();
    if (progress[courseSlug]) {
      delete progress[courseSlug];
      saveRawProgress(progress);
    }
  }
};
