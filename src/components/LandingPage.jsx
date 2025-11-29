import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, ScanLine, FlaskConical, Scale, ShieldCheck, 
  Smartphone, CheckCircle, AlertOctagon, XCircle,
  Eye, Fingerprint, TrendingUp, AlertTriangle, FileText
} from 'lucide-react';
// IMPORTING LOCAL ASSET
import wathiqLogo from '../assets/wathiq-logo.png';
import '../LandingPage.css';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.15 } }
};

// --- MAIN COMPONENT ---
const LandingPage = ({ downloadLink }) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleDownload = () => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
    } else {
      // Fallback/Loading state feedback
      const btn = document.getElementById('dl-btn');
      if(btn) btn.classList.add('shake');
      setTimeout(() => btn?.classList.remove('shake'), 500);
    }
  };

  const isReady = !!downloadLink;

  return (
    <div className="landing-wrapper">
      <div className="grid-overlay" />
      
      {/* 1. Navbar */}
      <nav className="nav-fixed">
        <div className="container nav-flex">
          <div className="brand-logo-container">
            
            <img 
              src={wathiqLogo} 
              alt="Wathiq Logo" 
              className="nav-logo"
            />
            <h2 className="brand-name">وثيق</h2>
          </div>
          <button 
            id="dl-btn"
            className={`btn-primary nav-btn ${!isReady ? 'loading' : ''}`} 
            onClick={handleDownload}
            disabled={!isReady}
          >
            {isReady ? <><Download size={18} /> تحميل التطبيق</> : "جاري التجهيز..."}
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="container hero-content"
          initial="hidden" animate="visible" variants={fadeInUp}
        >
          <div className="hero-pill">
            <span className="pulse-dot"></span>
            <span>الذكاء الاصطناعي في خدمة بشرتك</span>
          </div>
          
          <h1 className="hero-headline">
            الباركود قد يخدعك.<br />
            <span className="text-mint">المكونات لا تكذب.</span>
          </h1>
          
          <p className="hero-sub">
            لا تكتفي بقراءة "بمكونات طبيعية 100%" على الغلاف. تطبيق <strong>وثيق</strong> يقرأ قائمة المكونات الخلفية المعقدة، يكشف المواد الضارة، ويخبركِ بالحقيقة العلمية في ثوانٍ.
          </p>

          <div className="cta-group">
            <button 
              className="btn-primary large" 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={handleDownload}
              disabled={!isReady}
            >
              <Smartphone size={24} />
              <span>{isReady ? "تحميل النسخة التجريبية (APK)" : "جاري تحضير الرابط..."}</span>
              {isHovering && <motion.div layoutId="shine" className="shine-effect" />}
            </button>
            <p className="apk-note">
              <AlertTriangle size={12} /> التطبيق متاح حاليا فقط لأجهزة أندرويد عبر ملف APK. نسخة iOS قيد التطوير.
            </p>
          </div>
        </motion.div>

        {/* Hero Visual - Simulating OilGuard.js Flow */}
        <motion.div 
          className="container hero-demo-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
           <ScannerFlowDemo />
        </motion.div>
      </section>

      {/* 3. Social Proof / Pain Points Ticker */}
      <div className="ticker-wrapper">
        <div className="ticker-content">
           {[...Array(2)].map((_, i) => (
             <React.Fragment key={i}>
               <span className="ticker-item"><XCircle className="icon-bad" /> بارابين مخفي</span>
               <span className="ticker-item"><AlertOctagon className="icon-warn" /> تسويق مضلل (Angel Dusting)</span>
               <span className="ticker-item"><XCircle className="icon-bad" /> عطور مسببة للحساسية</span>
               <span className="ticker-item"><FlaskConical className="icon-science" /> تضارب كيميائي</span>
               <span className="ticker-item"><ShieldCheck className="icon-good" /> تحليل علمي محايد</span>
             </React.Fragment>
           ))}
        </div>
      </div>

      {/* 4. Features Bento Grid */}
      <section className="container section-padding">
        <div className="section-header">
          <h2 className="section-title">مختبر كيميائي في <span className="text-gold">جيبك</span></h2>
          <p className="section-subtitle">حللنا آلاف المنتجات لتعرفي ما تضعينه على بشرتك وشعرك.</p>
        </div>

        <motion.div 
          className="bento-grid"
          initial="hidden" whileInView="visible" variants={staggerContainer} viewport={{ once: true, margin: "-100px" }}
        >
          {/* Feature 1: Marketing Verification */}
          <motion.div className="bento-card col-span-8 bg-gradient-subtle" variants={fadeInUp}>
            <div className="card-top">
              <div className="card-icon gold"><Eye /></div>
              <div className="card-badge">حصري</div>
            </div>
            <h3>كاشف "الغش التسويقي"</h3>
            <p className="bento-desc">
              هل يزعمون أنه "بزيت الأرغان"؟ خوارزميتنا تحسب ترتيب المكونات. 
              إذا كان المكون الفعال في آخر القائمة (أقل من 1%)، سنخبركِ أنه مجرد "رشة ملح" لا فائدة منها.
            </p>
            <div className="demo-stage">
               <IngredientTruthDemo />
            </div>
          </motion.div>

          {/* Feature 2: Personalization (Profile.js Logic) */}
          <motion.div className="bento-card col-span-4" variants={fadeInUp}>
            <div className="card-icon mint"><Fingerprint /></div>
            <h3>تحليل ملفك الشخصي</h3>
            <p className="bento-desc">
              المنتج "الآمن" لصديقتك قد يكون "كارثيا" لكِ. وثيق يطابق المكونات مع ملفك الشخصي.
            </p>
            <PersonalMatchDemo />
          </motion.div>

          {/* Feature 3: Comparison (ComparisonPage.js Logic) */}
          <motion.div className="bento-card col-span-6" variants={fadeInUp}>
            <div className="card-icon blue"><Scale /></div>
            <h3>ساحة المقارنة</h3>
            <p className="bento-desc">محتارة بين منتج محلي ومنتج مستورد باهظ الثمن؟ السعر لا يعني الجودة دائما. قارني علميا.</p>
            <ComparisonWidgetDemo />
          </motion.div>

          {/* Feature 4: Routine Safety */}
          <motion.div className="bento-card col-span-6" variants={fadeInUp}>
            <div className="card-icon purple"><TrendingUp /></div>
            <h3>منظم الروتين الذكي</h3>
            <p className="bento-desc">
              بعض المكونات تدمر بعضها (مثل فيتامين C + ريتينول). نبني لك روتينا آمنا وننبهكِ للتعارضات.
            </p>
            <RoutineSafetyDemo />
          </motion.div>
        </motion.div>
      </section>

      {/* 5. How It Works (Simplified UX Flow) */}
      <section className="container section-padding">
        <h2 className="section-title text-center">بساطة الاستخدام، <span className="text-mint">دقة النتائج</span></h2>
        
        <div className="steps-container">
           <StepCard 
             num="01" 
             title="صوري المكونات" 
             desc="لا تبحثي عن الباركود. وجهي الكاميرا نحو القائمة المكتوبة بالإنجليزية (Ingredients) أو الفرنسية." 
             icon={<ScanLine />}
           />
           <StepCard 
             num="02" 
             title="التحليل الفوري" 
             desc="يقوم الذكاء الاصطناعي بقراءة النص، وتصنيف كل مكون حسب وظيفته ودرجة أمانه." 
             icon={<FileText />}
           />
           <StepCard 
             num="03" 
             title="القرار الحاسم" 
             desc="احصلي على تقييم نهائي (ممتاز، جيد، سيء) مع شرح مبسط للأسباب." 
             icon={<ShieldCheck />}
           />
        </div>
      </section>

      {/* 6. Footer CTA */}
      <section className="footer-cta">
        <div className="grid-overlay top-fade" />
        <motion.div 
          className="container cta-content"
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="brand-logo-large">
            <img src={wathiqLogo} alt="Wathiq" />
          </div>
          <h2 className="cta-headline">
            انضمي لمجتمع المستهلك الذكي.
          </h2>
          <p className="cta-sub">
          واحمي بشرتكِ وشعركِ، ووفري أموالكِ. التطبيق الجزائري الوحيد الذي يعتمد على الكيمياء، وليس الإعلانات.
          </p>
          <button 
            className="btn-primary large cta-btn-glow" 
            onClick={handleDownload}
            disabled={!isReady}
          >
            <Download className="icon-bounce" />
            {isReady ? "تحميل التطبيق الآن" : "الرابط قيد التحضير..."}
          </button>
          
          <div className="trust-badges">
             <span className="badge"><CheckCircle size={14} /> آمن 100% </span>
             <span className="badge"><CheckCircle size={14} /> تحليل محلي 100%</span>
             <span className="badge"><CheckCircle size={14} /> مجاني تماما</span>
          </div>
          
          <div className="copyright">
            &copy; {new Date().getFullYear()} Wathiq App. Made with Science in Algeria 🇩🇿
          </div>
        </motion.div>
      </section>
    </div>
  );
};

/* --- DEMO COMPONENTS (Mirroring App Logic) --- */

// 1. Scanner Flow Demo (Matches OilGuard.js flow)
const ScannerFlowDemo = () => {
  // States: 0=Scanning, 1=Analyzing(OCR), 2=Result
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhase(prev => (prev + 1) % 3);
    }, 4000); // 4 seconds per phase
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="iphone-mockup">
      <div className="screen-content">
         <div className="status-bar">
            <span>9:41</span>
            <div className="status-icons">
               <span style={{fontSize: 10, fontWeight: 900}}>WATHIQ</span>
               <div className="battery-icon"></div>
            </div>
         </div>

         <AnimatePresence mode="wait">
            {/* PHASE 0: SCANNING (Camera View) */}
            {phase === 0 && (
              <motion.div 
                key="scanning"
                className="app-screen camera-mode"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div className="camera-feed-sim">
                  <div className="blurred-text-bg">
                    Ingredients: Aqua, Glycerin, Niacinamide, Alcohol Denat...
                  </div>
                </div>
                <div className="scanner-overlay">
                  <div className="scan-corner tl"></div>
                  <div className="scan-corner tr"></div>
                  <div className="scan-corner bl"></div>
                  <div className="scan-corner br"></div>
                  <motion.div 
                    className="scan-line"
                    animate={{ top: ['5%', '95%', '5%'] }}
                    transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                  />
                  <div className="scan-hint">وجهي الكاميرا نحو المكونات</div>
                </div>
                <div className="camera-trigger">
                  <div className="trigger-btn"></div>
                </div>
              </motion.div>
            )}

            {/* PHASE 1: ANALYZING (Loader) */}
            {phase === 1 && (
              <motion.div 
                key="analyzing"
                className="app-screen analysis-mode"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div className="loader-container">
                   <div className="flask-anim">
                      <FlaskConical size={40} className="flask-icon" />
                      <motion.div 
                        className="flask-bubble"
                        animate={{ y: -20, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                   </div>
                   <div className="loading-text">جاري تحليل المكونات...</div>
                   <div className="loading-sub">الكشف عن المواد الضارة</div>
                </div>
              </motion.div>
            )}

            {/* PHASE 2: RESULT (Score Card) */}
            {phase === 2 && (
              <motion.div 
                key="result"
                className="app-screen result-mode"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                 <div className="score-header">
                    <div className="product-thumb"></div>
                    <div className="product-meta">
                       <div className="skeleton-text w-60"></div>
                       <div className="skeleton-text w-40"></div>
                    </div>
                 </div>

                 <div className="score-circle-container">
                    <svg viewBox="0 0 100 100" className="score-svg">
                       <circle cx="50" cy="50" r="45" className="score-bg" />
                       <motion.circle 
                          cx="50" cy="50" r="45" 
                          className="score-fg"
                          initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                          animate={{ strokeDashoffset: "40" }} // ~85% score
                          transition={{ duration: 1, delay: 0.2 }}
                       />
                    </svg>
                    <div className="score-value">
                       <span>85</span>
                       <span className="percent">%</span>
                    </div>
                 </div>
                 
                 <div className="verdict-pill safe">
                    <CheckCircle size={14} /> <span>منتج آمن وممتاز</span>
                 </div>

                 <div className="ingredients-list-sim">
                    <div className="ing-item good"><CheckCircle size={12}/> Niacinamide</div>
                    <div className="ing-item neutral">Glycerin</div>
                    <div className="ing-item warning"><AlertTriangle size={12}/> Fragrance</div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
      
      {/* Hardware Buttons */}
      <div className="hw-btn volume-up"></div>
      <div className="hw-btn volume-down"></div>
      <div className="hw-btn power"></div>
    </div>
  );
};

// 2. Ingredient Truth Demo (Updated to use real marketingclaimsdb key: "إصلاح التلف")
const IngredientTruthDemo = () => {
  return (
    <div className="demo-widget truth-widget">
       <div className="claim-box">
          <span className="claim-label">ادعاء العلبة:</span>
          {/* Matches DB category: "إصلاح التلف" where Argan is traditionally proven */}
          <strong className="text-gold">"إصلاح التلف (بزيت الأرغان)"</strong>
       </div>
       
       <div className="analysis-arrow">↓ تحليل وثيق ↓</div>

       <div className="ing-strip">
          <span className="ing base">Aqua</span>
          <span className="ing base">Glycerin</span>
          <span className="ing filler">Phenoxyethanol</span>
          {/* Argan Oil at the end (Angel Dusting logic: claimed ingredient at < 1%) */}
          <motion.span 
            className="ing exposed"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Argan Oil
          </motion.span>
          <span className="ing end">...</span>
       </div>

       <div className="alert-box">
          <AlertOctagon size={16} />
          <span>التركيز أقل من 0.1% (غش تسويقي)</span>
       </div>
    </div>
  );
};

// 3. Personalization Demo (Profile.js Logic)
const PersonalMatchDemo = () => {
  const [profileIndex, setProfileIndex] = useState(0);
  const scenarios = [
    { label: '🤰 حامل', status: 'critical', msg: 'يحتوي على Retinol (خطر)', bg: '#fef2f2', color: '#ef4444' },
    { label: '🌿 بشرة دهنية', status: 'good', msg: 'خالي من الزيوت (Non-Comedogenic)', bg: '#ecfdf5', color: '#10b981' },
    { label: '🥜 حساسية مكسرات', status: 'warning', msg: 'يحتوي على زيت اللوز', bg: '#fffbeb', color: '#f59e0b' },
  ];

  useEffect(() => {
    const t = setInterval(() => setProfileIndex(i => (i+1) % scenarios.length), 3500);
    return () => clearInterval(t);
  }, []);

  const current = scenarios[profileIndex];

  return (
    <div className="demo-widget personal-widget">
       <div className="profile-switcher">
          <span className="switch-label">الملف الشخصي:</span>
          <motion.div 
            key={current.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="profile-badge"
          >
            {current.label}
          </motion.div>
       </div>
       
       <motion.div 
         key={current.msg}
         className="match-result"
         initial={{ scale: 0.95, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         style={{ backgroundColor: current.bg, borderColor: current.color, color: current.color }}
       >
          {current.status === 'good' ? <CheckCircle /> : current.status === 'warning' ? <AlertTriangle /> : <XCircle />}
          <span>{current.msg}</span>
       </motion.div>
    </div>
  );
};

// 4. Comparison Widget Demo
const ComparisonWidgetDemo = () => {
  return (
    <div className="demo-widget vs-widget-container">
      <div className="vs-card loser">
         <div className="vs-img-placeholder">منتج تجاري</div>
         <div className="vs-score poor">45%</div>
         <div className="vs-tag">كحول + عطور</div>
      </div>
      
      <div className="vs-badge">VS</div>

      <div className="vs-card winner">
         <div className="vs-img-placeholder">منتج طبي</div>
         <div className="vs-score good">92%</div>
         <div className="vs-tag">آمن وفعال</div>
      </div>
    </div>
  );
};

// 5. Routine Safety Demo
const RoutineSafetyDemo = () => {
  return (
    <div className="demo-widget routine-widget">
       <div className="routine-row">
          <div className="time-col am"><span className="sun-icon">☀️</span></div>
          <div className="routine-item safe">
             <span>غسول + فيتامين C</span>
             <CheckCircle size={14} className="icon-safe" />
          </div>
       </div>
       <div className="routine-row">
          <div className="time-col pm"><span className="moon-icon">🌙</span></div>
          <div className="routine-item conflict">
             <span>ريتينول + مقشر AHA</span>
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }} 
               transition={{ repeat: Infinity, duration: 1.5 }}
             >
               <AlertOctagon size={14} className="icon-conflict" />
             </motion.div>
          </div>
       </div>
       <div className="conflict-msg">
          تنبيه: استخدام الريتينول مع المقشرات قد يسبب تهيجا!
       </div>
    </div>
  );
};

// Helper for Step Cards
const StepCard = ({ num, title, desc, icon }) => (
  <motion.div 
    className="step-card"
    whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.2)" }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="step-header">
      <div className="step-num">{num}</div>
      <div className="step-icon-circle">{icon}</div>
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </motion.div>
);

export default LandingPage;