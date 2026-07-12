import ReactGA from "react-ga4";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Configuration
const MEASUREMENT_ID = "G-GLHSW4YPZM"; // Your GA4 ID
const STRICT_PRIVACY = false; // Set to TRUE to block analytics until user explicitly accepts

// 🚫 ROUTES TO IGNORE (Internal/Admin Pages)
const IGNORED_ROUTES = [
  '/admin', 
  '/wathiq-admin', 
  '/analytics'
];

class AnalyticsService {
  constructor() {
    this.initialized = false;
    this.sessionStartTime = Date.now();
  }

  // --- Initialization ---
  init() {
    if (!this.initialized) {
      // Initialize Google Analytics 4
      ReactGA.initialize(MEASUREMENT_ID, {
        gaOptions: {
          debug_mode: process.env.NODE_ENV === 'development',
          allowAdFeatures: false
        }
      });
      this.initialized = true;
      console.log("Analytics Service Initialized");
    }
  }

  // --- Helper: Check if current page should be ignored ---
  isIgnoredPath(specificPath = null) {
    // 1. Check the specific path passed (e.g. for PageView events)
    if (specificPath) {
      const lowerPath = specificPath.toLowerCase();
      if (IGNORED_ROUTES.some(route => lowerPath.startsWith(route))) {
        return true;
      }
    }

    // 2. Check the browser's current location (e.g. for Button Clicks on Admin panel)
    const currentBrowserPath = window.location.pathname.toLowerCase();
    if (IGNORED_ROUTES.some(route => currentBrowserPath.startsWith(route))) {
      return true;
    }

    return false;
  }

  // --- Helper: Check Privacy Consent ---
  shouldTrack() {
    if (this.isIgnoredPath()) return false; // Force block on admin pages
    if (!STRICT_PRIVACY) return true; 
    return localStorage.getItem('wathiq_privacy_consent') === 'accepted';
  }

  // --- Helper: Remove undefined values (Fixes Firestore Error) ---
  sanitizeData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  // --- Core: Send to Firebase ---
  async sendToFirebase(eventType, data) {
    // 1. Check Consent & Ignored Paths
    if (!this.shouldTrack()) return;

    // 2. Prepare Common Data
    const sessionId = localStorage.getItem('wathiq_session_id') || 'anonymous';
    const commonPayload = {
      sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
      platform: 'web',
    };

    // 3. Map to Dashboard Collections
    let collectionName = 'analytics_events'; // Default
    let finalPayload = {};

    try {
      switch (eventType) {
        case 'session_start':
        case 'session_update':
          collectionName = 'analytics_sessions';
          finalPayload = { ...commonPayload, ...data };
          break;

        case 'download':
          collectionName = 'analytics_downloads';
          finalPayload = { ...commonPayload, version: data.version || 'latest', ...data };
          break;

        case 'pageview':
          collectionName = 'analytics_events';
          finalPayload = {
            ...commonPayload,
            event: 'pageview',
            data: data
          };
          break;

        case 'event':
        case 'ui_interaction':
        case 'engagement':
          collectionName = 'analytics_events';
          finalPayload = {
            ...commonPayload,
            event: eventType, 
            data: data
          };
          break;
          
        default:
          collectionName = 'analytics_events';
          finalPayload = { ...commonPayload, event: eventType, data };
      }

      // 4. Sanitize & Send
      const cleanPayload = this.sanitizeData(finalPayload);
      await addDoc(collection(db, collectionName), cleanPayload);

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Firebase Analytics Error:', error);
      }
    }
  }

  // --- Public Tracking Methods ---

  // 1. Page Views
  trackPageView(path) {
    if (this.isIgnoredPath(path)) return; // Stop if path is ignored

    if (!this.initialized) this.init();
    
    ReactGA.send({ hitType: "pageview", page: path });
    this.sendToFirebase('pageview', { page: path });
  }

  // 2. Generic Events
  trackEvent(category, action, label = '', value = null) {
    if (this.isIgnoredPath()) return; // Stop if on admin page
    if (!this.initialized) return;

    const eventData = { category, action, label };
    
    if (value !== null && value !== undefined && !isNaN(value)) {
      eventData.value = Number(value);
    }

    ReactGA.event(eventData);
    this.sendToFirebase('event', eventData);
  }

  // 3. Downloads
  trackDownload(version, source = 'landing_page') {
    if (this.isIgnoredPath()) return;

    this.trackEvent('download', 'apk_download', version, 1);
    this.sendToFirebase('download', {
      version,
      source
    });
  }

  // 4. Session Management
  startSession() {
    if (this.isIgnoredPath()) return;

    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('wathiq_session_id', sessionId);
    localStorage.setItem('wathiq_session_start', Date.now().toString());
    
    this.trackEvent('session', 'start', sessionId);
    
    this.sendToFirebase('session_start', {
      sessionId,
      startTime: new Date().toISOString(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      referrer: document.referrer || ''
    });
    
    console.log("Session Started:", sessionId);
    return sessionId;
  }

  // 5. User Engagement
  trackScroll(depth) {
    if (this.isIgnoredPath()) return;
    this.trackEvent('engagement', 'scroll_depth', `depth_${depth}%`);
    this.sendToFirebase('engagement', { type: 'scroll', depth: depth });
  }

  trackTimeOnPage(timeInSeconds) {
    if (this.isIgnoredPath()) return;

    const safeTime = Math.floor(Number(timeInSeconds));
    if (isNaN(safeTime) || safeTime <= 0) return;

    this.trackEvent('engagement', 'time_on_page', '', safeTime);
    
    const sessionId = localStorage.getItem('wathiq_session_id');
    if (sessionId) {
      this.sendToFirebase('session_update', {
        duration: safeTime,
        endTime: new Date().toISOString()
      });
    }
  }

  // 6. UI Interactions
  trackButtonClick(buttonName, section) {
    if (this.isIgnoredPath()) return;

    this.trackEvent('ui_interaction', 'button_click', `${section}_${buttonName}`);
    this.sendToFirebase('ui_interaction', {
      element: 'button',
      name: buttonName,
      section: section
    });
  }
}

const analyticsInstance = new AnalyticsService();
export default analyticsInstance;