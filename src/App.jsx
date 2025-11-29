import React, { useState, useEffect } from 'react'; // Removed Suspense/lazy
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FaLock, FaExclamationTriangle } from 'react-icons/fa'; // Removed FaSpinner

// --- Authentication and Data Hooks ---
import { AppProvider, useAppContext } from './components/AppContext'; 
import { db } from './firebase';
import { doc, updateDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; 

// --- Analytics ---
import { initAnalytics } from './analytics';

// --- CORE STATIC IMPORTS (Instant Load for App) ---
import AuthenticationPage from './components/AuthenticationPage';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import OilGuard from './components/OilGuard';
import ComparisonPage from './components/ComparisonPage';
import WathiqAdmin from './components/WathiqAdmin';
import AdminPortal from './components/AdminPortal'; 
import LandingPage from './components/LandingPage'; // <--- MOVED TO STATIC IMPORT

// --- UI & UX Components ---
import LoadingOverlay from './components/LoadingOverlay'; 
import GoodbyeOverlay from './components/GoodbyeOverlay';
import WathiqNav from './components/WathiqNav';
import OfflineIndicator from './components/OfflineIndicator'; 
import UpdateManager from './components/UpdateManager';
import AnimatedSplash from './components/AnimatedSplash';
import ErrorBoundary from './components/ErrorBoundary';

// --- Capacitor Imports ---
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

// --- CSS Imports ---
import './App.css';
import 'react-circular-progressbar/dist/styles.css';
import { AnimatePresence } from 'framer-motion';

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// 1. Access Denied Page
const AccessDenied = ({ email }) => (
  <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '20px'
  }}>
      <FaLock style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>تم رفض الوصول</h2>
      <p style={{ opacity: 0.8 }}>أنت مسجل الدخول بـ: <br/> <strong>{email}</strong></p>
      <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', margin: '20px 0', border: '1px solid #ef4444' }}>
          <FaExclamationTriangle style={{ marginLeft: '5px' }}/>
          هذه الصفحة مخصصة للمسؤولين فقط.
      </div>
      <a href="/" style={{ color: '#fff', textDecoration: 'underline' }}>العودة للصفحة الرئيسية</a>
  </div>
);

// 2. Generic Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, userProfile, loading } = useAppContext();
  
  if (loading) return <LoadingOverlay text="جاري التحميل..." />;
  
  const activeAccount = user || userProfile;

  if (!activeAccount) {
      return <AuthenticationPage />;
  }
  
  return children;
};

// 3. Admin Route
const AdminRoute = ({ children }) => {
  const { user, userProfile, loading } = useAppContext();
  const ALLOWED_ADMIN = "ni3yyn@gmail.com";

  if (loading) return <LoadingOverlay text="جاري التحقق..." />;
  
  const activeAccount = user || userProfile;

  if (!activeAccount) {
      return <AuthenticationPage />;
  }

  const email = activeAccount.email;

  if (!email || email.toLowerCase() !== ALLOWED_ADMIN.toLowerCase()) {
      return <AccessDenied email={email} />;
  }

  return children;
};

// 4. Main Layout
const MainLayout = ({ children }) => {
    const location = useLocation();
    
    // Define routes that use the bottom WathiqNav
    const appRoutes = ['/profile', '/oil-guard', '/compare'];
    const isAppRoute = appRoutes.some(path => location.pathname.startsWith(path));

    return (
        <div className="app-root">
            {isAppRoute && <WathiqNav />}
            <main className="main-content">{children}</main>
        </div>
    );
};

// =============================================================================
// MAIN ROUTING LOGIC
// =============================================================================
const WathiqRoutes = () => {
  const { user, userProfile, loading, isLoggingOut } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  
  const [apkLink, setApkLink] = useState(null);
  const [showSplash, setShowSplash] = useState(isNative);

  // --- Styles Fix for Landing Page ---
  // Keeps the background clean for the main page
  useEffect(() => {
    if (!isNative && location.pathname === '/') {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '#ffffff'; 
        document.body.style.overflowY = 'auto'; 
    } else {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = '';
        document.body.style.overflowY = '';
    }
    return () => {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = '';
    };
  }, [location.pathname, isNative]);

  // --- 1. Web: Fetch APK Link (Non-blocking) ---
  useEffect(() => {
    if (!isNative) {
      const q = query(collection(db, "releases"), orderBy("createdAt", "desc"), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) setApkLink(snapshot.docs[0].data().fileUrl);
      });
      return () => unsubscribe();
    }
  }, [isNative]);

  // --- 2. Native: Splash Screen Logic ---
  useEffect(() => {
    const handleSplash = async () => {
        const curtain = document.getElementById('html-splash-curtain');
        if (curtain) curtain.remove();

        if (isNative) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await SplashScreen.hide({ fadeOutDuration: 500 });
            if (!loading) setTimeout(() => setShowSplash(false), 2000);
        } else {
            setShowSplash(false);
        }
    };
    handleSplash();
  }, [isNative, loading]);

  // --- 3. Native: Analytics & Onboarding ---
  useEffect(() => {
    if (loading || !isNative) return;

    if (userProfile) {
        if (userProfile.onboardingComplete === false && location.pathname !== '/welcome') {
            navigate('/welcome', { replace: true });
        }
        const setupAnalytics = async () => {
            try {
                await FirebaseAnalytics.setUserId({ userId: user.uid });
                await FirebaseAnalytics.logEvent({ name: 'session_start', params: { user_type: 'registered' } });
            } catch (err) { console.warn("Analytics Error", err); }
        };
        setupAnalytics();
    }
  }, [userProfile, user, loading, navigate, location.pathname, isNative]);

  // --- 4. Native: Notifications & Back Button ---
  useEffect(() => {
    if (isNative) {
        PushNotifications.createChannel({ id: 'default', name: 'General', importance: 5, visibility: 1 }).catch(console.error);
        PushNotifications.addListener('registration', token => {
            if (user) updateDoc(doc(db, 'profiles', user.uid), { fcmToken: token.value, platform: 'android' }).catch(console.error);
        });
        PushNotifications.addListener('pushNotificationActionPerformed', notification => {
            if (notification.notification.data.route) navigate(notification.notification.data.route);
        });
        const registerPush = async () => {
            let perm = await PushNotifications.checkPermissions();
            if (perm.receive === 'prompt') perm = await PushNotifications.requestPermissions();
            if (perm.receive === 'granted') await PushNotifications.register();
        };
        registerPush();

        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            if (['/', '/login', '/oil-guard', '/welcome'].includes(location.pathname)) {
                 CapacitorApp.exitApp();
            } else {
                navigate(-1);
            }
        });
    }
  }, [user, navigate, isNative]);

  // Routing Constants
  const isProfileComplete = userProfile?.onboardingComplete === true;
  const appHomeRoute = isProfileComplete ? "/oil-guard" : "/welcome";

  // Native Splash Guard
  if (isNative && (showSplash || loading)) {
    return <AnimatedSplash />;
  }

  return (
    <>
      <OfflineIndicator />
      <UpdateManager />
      
      <AnimatePresence>
        {isLoggingOut && <GoodbyeOverlay />}
      </AnimatePresence>
      
      <Routes location={location} key={location.pathname}>
          
          {/* 
             ------------------------------------
             1. WEB BROWSER (LANDING PAGE)
             ------------------------------------
             NO SUSPENSE / NO SPINNER. LOADS INSTANTLY.
          */}
          {!isNative && (
            <Route 
                path="/" 
                element={<LandingPage downloadLink={apkLink} />} 
            />
          )}

          {/* 
             ------------------------------------
             2. AUTH & LOGIN
             ------------------------------------
          */}
          <Route path="/login" element={
              loading ? <LoadingOverlay text="جاري التحقق..." /> : 
              (user || userProfile) ? <Navigate to={appHomeRoute} replace /> : <AuthenticationPage />
          } />

          {/* 
             ------------------------------------
             3. ADMIN ROUTES
             ------------------------------------
          */}
          <Route path="/admin" element={
              <AdminRoute>
                  <AdminPortal user={user} />
              </AdminRoute>
          } />

          <Route path="/wathiq-admin" element={
              <AdminRoute>
                  <WathiqAdmin />
              </AdminRoute>
          } />

          {/* 
             ------------------------------------
             4. MAIN APP ROUTES (Protected)
             Wrapped in MainLayout for Navigation
             ------------------------------------
          */}
          <Route path="/*" element={
            <MainLayout>
                <Routes>
                    
                    {/* Native Root: Redirects based on Auth */}
                    {isNative && (
                        <Route path="/" element={
                            (user || userProfile) ? <Navigate to={appHomeRoute} replace /> : <AuthenticationPage />
                        } />
                    )}
                    
                    <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                    <Route path="/oil-guard" element={<ProtectedRoute><OilGuard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/compare" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </MainLayout>
          } />

      </Routes>
    </>
  );
};

// =============================================================================
// APP WRAPPER
// =============================================================================
function App() {
  useEffect(() => { initAnalytics(); }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <AppProvider>
            <WathiqRoutes />
          </AppProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;