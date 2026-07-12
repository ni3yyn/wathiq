import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Globe, AlertTriangle, FileText, UserCheck, Shield, Edit3 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import wathiqLogo from '../assets/wathiq-logo.png';
import SEO from './SEO';

const TermsOfUse = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      <SEO 
        title="شروط الاستخدام" 
        description="شروط الاستخدام لتطبيق وثيق. تعرف على حقوقك وواجباتك عند استخدام التطبيق." 
        lastUpdated="2026-06-07T12:00:00Z"
      />
      <div className="grid-overlay" />

      {/* Navbar */}
      <nav className="nav-fixed">
        <div className="container nav-flex">
          <Link to="/" className="brand-logo-container" style={{ textDecoration: 'none' }}>
            <img src={wathiqLogo} alt="Wathiq Logo" className="nav-logo"/>
            <h2 className="brand-name">وثيق</h2>
          </Link>
          <Link to="/" className="btn-primary" style={{ padding: '8px 16px', background: 'transparent', color: '#10b981', border: '1px solid #10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px', fontSize: '0.9rem', fontFamily: 'Tajawal, sans-serif', fontWeight: 700 }}>
            العودة للرئيسية <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Content Section */}
      <section className="section-padding" style={{ paddingTop: '120px' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', direction: 'rtl', textAlign: 'right' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '20px 0' }}
          >
            <h1 className="hero-headline" style={{ fontSize: '2.2rem', textAlign: 'right', marginBottom: '10px' }}>شروط الاستخدام</h1>
            <p className="text-mint" style={{ fontWeight: 600, marginBottom: '30px' }}>
              آخر تحديث: <time dateTime="2026-06-07T12:00:00Z">7 يونيو 2026</time>
            </p>

            <div className="legal-text" style={{ lineHeight: '1.8', color: '#cbd5e1', fontSize: '1.05rem' }}>
              <p style={{ marginBottom: '20px' }}>
                مرحباً بك في تطبيق <strong>وثيق</strong>. تحكم هذه الشروط والأحكام استخدامك لتطبيقنا وخدماتنا. باستخدامك لتطبيق وثيق، فإنك توافق على الالتزام بهذه الشروط.
              </p>

              {/* Section 1 */}
              <h2 style={sectionHeaderStyle}><FileText size={20} /> 1. قبول الشروط</h2>
              <p>باستخدام التطبيق، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام بهذه الشروط والأحكام، بالإضافة إلى سياسة الخصوصية الخاصة بنا.</p>

              {/* Section 2 */}
              <h2 style={sectionHeaderStyle}><Shield size={20} /> 2. إخلاء المسؤولية الطبية</h2>
              <p style={noteStyle}>
                تطبيق وثيق ليس بديلاً عن الاستشارة الطبية المتخصصة. المعلومات والتحليلات المقدمة حول مكونات مستحضرات التجميل تهدف إلى التوعية العامة فقط. نوصي دائماً باستشارة طبيب الأمراض الجلدية المختص قبل استخدام أي منتج، خاصة إذا كنت تعاني من حالات طبية معينة، أو أثناء فترة الحمل والرضاعة.
              </p>

              {/* Section 3 */}
              <h2 style={sectionHeaderStyle}><UserCheck size={20} /> 3. حساب المستخدم</h2>
              <ul style={listStyle}>
                <li>أنت مسؤول عن الحفاظ على سرية معلومات حسابك.</li>
                <li>يجب أن تكون المعلومات التي تقدمها عند التسجيل دقيقة وحديثة.</li>
                <li>نحتفظ بالحق في إنهاء أو تعليق حسابك إذا انتهكت أياً من هذه الشروط.</li>
              </ul>

              {/* Section 4 */}
              <h2 style={sectionHeaderStyle}><AlertTriangle size={20} /> 4. الاستخدام المقبول</h2>
              <p>يُحظر عليك:</p>
              <ul style={listStyle}>
                <li>استخدام التطبيق لأي أغراض غير قانونية.</li>
                <li>محاولة التدخل في عمل التطبيق أو اختراق أنظمة الأمان الخاصة به.</li>
                <li>نشر محتوى مسيء، مضلل، أو ينتهك حقوق الآخرين في قسم "مجتمع وثيق".</li>
              </ul>

              {/* Section 5 */}
              <h2 style={sectionHeaderStyle}><Edit3 size={20} /> 5. التعديلات على الشروط</h2>
              <p>نحتفظ بالحق في تعديل أو استبدال هذه الشروط في أي وقت. سنقوم بإشعارك بأي تغييرات جوهرية من خلال التطبيق أو عبر البريد الإلكتروني. استمرارك في استخدام التطبيق بعد أي تعديل يُعد قبولاً منك للشروط الجديدة.</p>

              {/* Section 6 */}
              <h2 style={sectionHeaderStyle}>6. تواصل معنا</h2>
              <div className="bento-card bg-gradient-subtle" style={{ padding: '20px', marginTop: '20px' }}>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                   <Mail size={18} className="text-mint" /> <strong>البريد الإلكتروني:</strong> ni3yyn@gmail.com
                 </p>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Globe size={18} className="text-mint" /> <strong>الموقع الإلكتروني:</strong> wathiq.web.app
                 </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Styles
const sectionHeaderStyle = {
  color: 'var(--primary)',
  fontSize: '1.4rem',
  fontWeight: 800,
  marginTop: '40px',
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
  paddingBottom: '5px'
};

const subHeaderStyle = {
  color: '#fff',
  fontSize: '1.1rem',
  fontWeight: 700,
  marginTop: '25px',
  marginBottom: '10px'
};

const listStyle = {
  paddingRight: '20px',
  marginBottom: '15px'
};

const noteStyle = {
  background: 'rgba(16, 185, 129, 0.05)',
  padding: '15px',
  borderRadius: '12px',
  fontSize: '0.95rem',
  borderRight: '4px solid var(--primary)',
  marginBottom: '15px',
  fontStyle: 'italic',
  color: '#cbd5e1'
};

export default TermsOfUse;
