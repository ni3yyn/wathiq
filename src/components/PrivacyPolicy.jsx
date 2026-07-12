import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Mail, Globe, Lock, ShieldAlert, Camera, MapPin, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import wathiqLogo from '../assets/wathiq-logo.png';
import SEO from './SEO';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      <SEO 
        title="سياسة الخصوصية" 
        description="سياسة الخصوصية لتطبيق وثيق. تعرف على كيفية جمع بياناتك، حمايتها واستخدامها لتقديم أفضل تجربة لتحليل مستحضرات التجميل." 
        lastUpdated="2026-01-16T12:00:00Z"
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
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', direction: 'ltr', textAlign: 'left' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '20px 0' }}
          >
            <h1 className="hero-headline" style={{ fontSize: '2.2rem', textAlign: 'left', marginBottom: '10px' }}>Privacy Policy for Wathiq (وثيق)</h1>
            <p className="text-mint" style={{ fontWeight: 600, marginBottom: '30px' }}>
              Last Updated: <time dateTime="2026-01-16T12:00:00Z">January 16, 2026</time>
            </p>

            <div className="legal-text" style={{ lineHeight: '1.8', color: '#cbd5e1', fontSize: '1.05rem' }}>
              <p style={{ marginBottom: '20px' }}>
                <strong>Wathiq</strong> is committed to protecting your privacy. This Privacy Policy explains how Wathiq ("the App") collects, uses, and discloses your information. By using the App, you consent to the data practices described in this policy.
              </p>

              {/* Section 1 */}
              <h2 style={sectionHeaderStyle}><Lock size={20} /> 1. Information We Collect</h2>
              <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
              
              <h3 style={subHeaderStyle}>A. Personal & Health Information</h3>
              <p>To provide personalized skincare analysis ("OilGuard" and "Routine Architect"), we may ask for:</p>
              <ul style={listStyle}>
                <li><strong>Personal Identifiers:</strong> Name or nickname.</li>
                <li><strong>Health & Biological Characteristics:</strong> Skin type (e.g., Oily, Dry), Scalp type, Skin conditions (e.g., Eczema, Rosacea), Allergies, and Pregnancy/Nursing status.</li>
                <li><strong>Usage Goals:</strong> Skincare objectives (e.g., Acne control, Anti-aging).</li>
              </ul>
              <p style={noteStyle}>Why we collect this: This data is processed locally and via our secure backend solely to tailor product safety verdicts (e.g., warning a pregnant user about Retinol) and is never sold to third parties.</p>

              <h3 style={subHeaderStyle}>B. Device & Usage Information</h3>
              <ul style={listStyle}>
                <li><strong>Device Information:</strong> Device model, OS version, and unique device identifiers (Advertising ID).</li>
                <li><strong>App Interaction:</strong> Information about how you interact with the app, features used, and crash logs.</li>
              </ul>

              <h3 style={subHeaderStyle}>C. Location Data</h3>
              <p>We collect your approximate location (coarse location) to provide the "Geo-Dermatology" feature.</p>
              <p style={noteStyle}>Why we collect this: To analyze local weather conditions (UV Index, Humidity, Dew Point) and provide real-time skincare advice.</p>
              <p><strong>Storage:</strong> Location data is processed to fetch weather data and is not historically tracked or stored on our servers.</p>

              <h3 style={subHeaderStyle}>D. User Content (Images)</h3>
              <p><strong>Camera & Photos:</strong> We require access to your camera and photo gallery to scan product ingredients (OCR) and to allow you to upload product photos to your digital shelf.</p>
              <p><strong>Processing:</strong> Images are temporarily processed by our AI servers (Vercel/Gemini) to extract text and are stored via Cloudinary for your user profile.</p>

              {/* Section 2 */}
              <h2 style={sectionHeaderStyle}>2. How We Use Your Information</h2>
              <ul style={listStyle}>
                <li><strong>To Provide Services:</strong> Analyzing cosmetic ingredients against your health profile.</li>
                <li><strong>To Improve the App:</strong> Using analytics to understand user behavior and fix crashes.</li>
                <li><strong>To Show Ads:</strong> Displaying non-personalized or personalized advertisements via Google AdMob.</li>
                <li><strong>Social Features:</strong> Displaying your username and shared reviews in the Wathiq Community section.</li>
              </ul>

              {/* Section 3 */}
              <h2 style={sectionHeaderStyle}>3. Third-Party Service Providers</h2>
              <p>We use trusted third-party services to help us operate the App. These parties may access your data only to perform tasks on our behalf:</p>
              <ul style={listStyle}>
                <li><strong>Google Firebase & Supabase:</strong> Used for authentication, database management, and analytics.</li>
                <li><strong>Google AdMob:</strong> To display advertisements. AdMob may use your device's Advertising ID to show relevant ads.</li>
                <li><strong>Cloudinary:</strong> Used for storing user-uploaded product images.</li>
                <li><strong>Expo:</strong> The framework used to build the app, which may collect anonymous usage data to ensure compatibility.</li>
              </ul>

              {/* Section 4 */}
              <h2 style={sectionHeaderStyle}><ShieldAlert size={20} /> 4. App Permissions</h2>
              <p>The App requests the following sensitive permissions on Android:</p>
              <ul style={listStyle}>
                <li><strong>CAMERA:</strong> Required to scan ingredient lists on product packaging.</li>
                <li><strong>READ_EXTERNAL_STORAGE / WRITE_EXTERNAL_STORAGE:</strong> Required to pick images from your gallery for analysis.</li>
                <li><strong>ACCESS_COARSE_LOCATION / ACCESS_FINE_LOCATION:</strong> Required for the Weather/Environmental analysis feature.</li>
              </ul>

              {/* Section 5 */}
              <h2 style={sectionHeaderStyle}><Trash2 size={20} /> 5. Data Retention and Deletion</h2>
              <p>We retain your personal data only as long as necessary to provide you with our services.</p>
              <p><strong>Account Deletion:</strong> You have the right to delete your account and all associated data at any time directly within the App settings or by contacting us. Upon deletion, your data is removed from our Firebase/Supabase databases.</p>

              {/* Section 6-9 */}
              <h2 style={sectionHeaderStyle}>6. Security</h2>
              <p>We implement reasonable security measures (including HTTPS encryption) to protect your information. However, no method of transmission over the internet is 100% secure.</p>

              <h2 style={sectionHeaderStyle}>7. Children’s Privacy</h2>
              <p>Wathiq does not knowingly collect personal information from children under the age of 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.</p>

              <h2 style={sectionHeaderStyle}>8. Changes to This Policy</h2>
              <p>We may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes.</p>

              <h2 style={sectionHeaderStyle}>9. Contact Us</h2>
              <div className="bento-card bg-gradient-subtle" style={{ padding: '20px', marginTop: '20px' }}>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                   <Mail size={18} className="text-mint" /> <strong>Email:</strong> ni3yyn@gmail.com
                 </p>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Globe size={18} className="text-mint" /> <strong>Website:</strong> wathiq.web.app
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
  paddingLeft: '20px',
  marginBottom: '15px'
};

const noteStyle = {
  background: 'rgba(16, 185, 129, 0.05)',
  padding: '15px',
  borderRadius: '12px',
  fontSize: '0.95rem',
  borderLeft: '4px solid var(--primary)',
  marginBottom: '15px',
  fontStyle: 'italic',
  color: '#cbd5e1'
};

export default PrivacyPolicy;