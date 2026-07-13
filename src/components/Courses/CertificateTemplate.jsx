import React, { forwardRef } from 'react';
import { Award, Hexagon, Sparkles } from 'lucide-react';

const CertificateTemplate = forwardRef(({ lang, courseTitle, learnerName, certId, dateStr }, ref) => {
  const isAr = lang === 'ar';

  return (
    <div 
      id="certificate-content"
      ref={ref}
      style={{
        width: '842px', // Strict A4 Landscape constraints
        height: '595px', 
        minWidth: '842px',
        backgroundColor: '#022c22', // Deep, rich premium forest/emerald green
        // Soft glowing radial background for depth
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 60%),
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px',
        position: 'relative',
        color: '#f5f5f5',
        textAlign: 'center',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        direction: isAr ? 'rtl' : 'ltr',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0', // Removed the padding so the inner glass layer fills the screen
        borderRadius: '36px', 
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)' // Soft inner vignette
      }}
    >
      {/* Centered Glowing Watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.04, pointerEvents: 'none', zIndex: 1 }}>
        <Hexagon size={450} stroke="#10b981" strokeWidth={0.5} />
      </div>

      {/* Intricate Rounded Academic Border System - REMOVED to prevent conflicting layers */}
      {/* Main Glassmorphism Content Box (Soft Rounded) */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.5) 0%, rgba(2, 44, 34, 0.7) 100%)', // Semi-transparent deep greens
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
        borderRight: '1px solid rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
        boxShadow: 'none', // Removed shadow since it now touches the edges
        borderRadius: '36px', // Match the outer frame
        padding: '25px 50px', // Restored a bit of inner padding since outer is gone
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>

        {/* Header: Centered Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <img 
            src="/wathiq-logo-512.png" 
            alt="Wathiq Logo" 
            style={{ width: '70px', height: '70px', objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(16,185,129,0.4))' }} 
            crossOrigin="anonymous" 
          />
        </div>

        {/* Certificate Title Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ height: '1px', width: '40px', background: 'rgba(16, 185, 129, 0.5)' }}></div>
              <Sparkles size={14} color="#10b981" />
              <p style={{ color: '#34d399', fontSize: '0.85rem', margin: '0', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700 }}>
                {isAr ? 'أكاديمية وثيق للعلوم التجميلية' : 'Wathiq Academy for Cosmetic Science'}
              </p>
              <Sparkles size={14} color="#10b981" />
              <div style={{ height: '1px', width: '40px', background: 'rgba(16, 185, 129, 0.5)' }}></div>
            </div>
            
            <h1 style={{ 
              fontSize: '3.2rem', 
              margin: '0', 
              fontWeight: 900, 
              letterSpacing: isAr ? '0' : '4px',
              color: '#ffffff', // Solid white — gradient text breaks in canvas rendering
              textShadow: '0 0 20px rgba(16,185,129,0.6), 0 4px 30px rgba(16,185,129,0.3)'
            }}>
              {isAr ? 'شهادة إتمام' : 'CERTIFICATE OF COMPLETION'}
            </h1>
          </div>

          {/* Recipient Name Section */}
          <div style={{ margin: '10px 0' }}>
            <p style={{ fontSize: '1rem', color: '#a7f3d0', marginBottom: '5px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {isAr ? 'تُمنح هذه الشهادة بكل فخر إلى' : 'Is hereby proudly presented to'}
            </p>
            <h2 style={{ 
              fontFamily: "'Amiri', 'Times New Roman', serif",
              fontSize: '3.4rem', 
              color: '#ffffff', 
              margin: '0',
              lineHeight: '1.2',
              textShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 10px rgba(255, 255, 255, 0.3)',
              fontWeight: 700
            }}>
              {learnerName || (isAr ? 'الاسم الكامل' : 'Full Name')}
            </h2>
            {/* Elegant Rounded Divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '18px' }}>
              <div style={{ width: '35%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
              <div style={{ width: '35%', height: '1px', background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.3))' }}></div>
            </div>
          </div>

          {/* Course Details */}
          <div>
            <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '700px', margin: '0 auto', lineHeight: '1.9' }}>
              {isAr ? 
                `لإتمامه(ا) بنجاح جميع متطلبات دورة ` : 
                `For successfully completing all requirements of the `}
              <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '1.2rem', padding: '0 6px' }}>"{courseTitle}"</span>
              {isAr ? 
                ` واجتياز التقييمات العلمية التي تثبت الفهم العميق للمحتوى.` : 
                ` course and passing the scientific assessments demonstrating a deep understanding of the content.`}
            </p>
          </div>
        </div>

        {/* Footer: Date, Advanced Seal, Signature */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end',
          padding: '0 20px',
        }}>
          {/* Date Block */}
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '4px', marginBottom: '6px', fontSize: '1.1rem', color: '#f5f5f5' }}>
              {dateStr}
            </div>
            <div style={{ color: '#6ee7b7', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
              {isAr ? 'تاريخ الإصدار' : 'Date of Issue'}
            </div>
          </div>
          
          {/* Soft Rounded Multi-Layered Seal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(0)' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {/* Outer Metallic Conic Ring */}
              <div style={{ position: 'absolute', inset: 0, background: 'conic-gradient(from 0deg, transparent, rgba(16, 185, 129, 0.6), transparent, rgba(16, 185, 129, 0.6), transparent)', borderRadius: '50%', animation: 'spin 10s linear infinite' }}></div>
              <div style={{ position: 'absolute', inset: '2px', background: '#022c22', borderRadius: '50%' }}></div>
              {/* Dashed Orbit */}
              <div style={{ position: 'absolute', inset: '6px', border: '1px dashed rgba(255, 255, 255, 0.4)', borderRadius: '50%' }}></div>
              {/* Inner Solid Core */}
              <div style={{ position: 'absolute', inset: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.6)', borderRadius: '50%', boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <Award size={32} color="#34d399" strokeWidth={1.5} />
              </div>
              
              {/* Layered Rounded Ribbon */}
              <div style={{ 
                position: 'absolute', bottom: '-10px', 
                background: '#064e3b', 
                border: '1px solid #10b981', 
                padding: '4px 16px', 
                borderRadius: '24px', // Fully rounded pill shape
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                color: '#34d399', 
                letterSpacing: '2px', 
                textTransform: 'uppercase', 
                zIndex: 3, 
                boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap'
              }}>
                {isAr ? 'إتـمـام' : 'Completed'}
              </div>
            </div>
          </div>
          
          {/* Signature Block */}
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '4px', marginBottom: '6px', fontSize: '1.4rem', fontFamily: isAr ? "'Amiri', serif" : "'Dancing Script', 'Brush Script MT', cursive", fontStyle: isAr ? 'italic' : 'normal', color: '#ffffff' }}>
              {isAr ? 'فريق وثيق' : 'Wathiq Team'}
            </div>
            <div style={{ color: '#6ee7b7', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
              {isAr ? 'الفريق العلمي' : 'Science Team'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default CertificateTemplate;
