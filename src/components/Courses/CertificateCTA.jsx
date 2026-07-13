import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Download, ExternalLink, RotateCcw, Award } from 'lucide-react';
import CertificateTemplate from './CertificateTemplate';

/**
 * CertificateCTA — Inline, modal-free certificate download flow.
 *
 * step 0 → CTA button (matches syllabus-start-btn style)
 * step 1 → button morphs into a name input
 * step 2 → input lifts, download button slides in below
 * step 3 → generating… spinner
 * step 4 → done: "View" + "Again" buttons
 */
const CertificateCTA = ({ lang = 'ar', courseTitle }) => {
  const [step, setStep] = useState(0);
  const [learnerName, setLearnerName] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [certId, setCertId] = useState('');
  const inputRef = useRef(null);
  const hiddenCertRef = useRef(null);

  const isAr = lang === 'ar';

  useEffect(() => {
    const rid = Math.random().toString(36).substring(2, 8).toUpperCase();
    const d = new Date();
    setCertId(`WTQ-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${rid}`);
  }, []);

  const dateStr = new Date().toLocaleDateString(isAr ? 'ar-DZ' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleButtonClick = () => {
    setStep(1);
    setTimeout(() => inputRef.current?.focus(), 280);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setLearnerName(val);
    setStep(val.trim().length > 0 ? 2 : 1);
  };

  const handleDownload = async () => {
    if (!hiddenCertRef.current || !learnerName.trim()) return;
    setStep(3);
    try {
      await new Promise(r => setTimeout(r, 600));
      const dataUrl = await toPng(hiddenCertRef.current, {
        quality: 1.0, pixelRatio: 3, skipFonts: false,
      });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(dataUrl, 'PNG', 0, 0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight());

      const blob = pdf.output('blob');
      setPdfUrl(URL.createObjectURL(blob));
      pdf.save(`Wathiq_Certificate_${certId}.pdf`);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert(isAr ? 'حدث خطأ أثناء استخراج الشهادة' : 'Error generating certificate');
      setStep(2);
    }
  };

  const t = {
    btnCert:     isAr ? 'احصلي على الشهادة' : 'Claim Certificate',
    label:       isAr ? 'اسمك على الشهادة' : 'Your name on the certificate',
    placeholder: isAr ? 'اكتبي اسمك كما تريدين...' : 'Type your name…',
    download:    isAr ? 'تحميل الشهادة' : 'Download Certificate',
    loading:     isAr ? 'جارٍ التحضير...' : 'Generating…',
    view:        isAr ? 'عرض الشهادة' : 'View Certificate',
    again:       isAr ? 'تحميل مجدداً' : 'Download Again',
  };

  return (
    <>
      {/* Hidden off-screen certificate — only rendered during export */}
      <div style={{
        position: 'fixed', top: '-9999px', left: '-9999px',
        zIndex: -1, pointerEvents: 'none',
      }}>
        <CertificateTemplate
          ref={hiddenCertRef}
          lang={lang}
          courseTitle={courseTitle}
          learnerName={learnerName}
          certId={certId}
          dateStr={dateStr}
        />
      </div>

      {/* Floating container — same position as .syllabus-start-btn-wrap */}
      <div className="syllabus-start-btn-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <div style={{ display: 'flex', gap: '10px', animation: 'cert-slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <button
              className="syllabus-start-btn"
              onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
              style={{ flex: 1, gap: '8px' }}
            >
              <ExternalLink size={17} />
              {t.view}
            </button>
            <button
              onClick={() => { setStep(0); setLearnerName(''); setPdfUrl(null); }}
              style={{
                padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--courses-border)',
                background: 'var(--courses-card-bg)', color: 'var(--courses-text-secondary)',
                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                backdropFilter: 'blur(10px)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--courses-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--courses-text-secondary)'}
            >
              <RotateCcw size={15} />
              {t.again}
            </button>
          </div>
        )}

        {/* ── Step 2 / 3: Download button ── */}
        {(step === 2 || step === 3) && (
          <button
            className="syllabus-start-btn"
            onClick={handleDownload}
            disabled={step === 3}
            style={{
              gap: '8px', opacity: step === 3 ? 0.7 : 1,
              animation: 'cert-slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              cursor: step === 3 ? 'not-allowed' : 'pointer',
            }}
          >
            {step === 3 ? (
              <>
                <span className="cert-spinner" />
                {t.loading}
              </>
            ) : (
              <>
                <Download size={17} />
                {t.download}
              </>
            )}
          </button>
        )}

        {/* ── Step 1 / 2 / 3: Name input ── */}
        {step >= 1 && step <= 3 && (
          <div style={{
            position: 'relative',
            animation: step === 1 ? 'cert-morph 0.32s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
          }}>
            {/* hint label */}
            <span style={{
              position: 'absolute',
              top: '-22px',
              [isAr ? 'right' : 'left']: '2px',
              fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--courses-primary)',
              letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9,
            }}>
              {t.label}
            </span>

            <input
              ref={inputRef}
              type="text"
              value={learnerName}
              onChange={handleNameChange}
              placeholder={t.placeholder}
              dir={isAr ? 'rtl' : 'ltr'}
              disabled={step === 3}
              style={{
                width: '100%', padding: '15px 18px',
                borderRadius: '14px',
                border: '1.5px solid var(--courses-border)',
                background: 'var(--courses-card-bg)',
                backdropFilter: 'blur(12px)',
                color: 'var(--courses-text-primary)',
                fontFamily: 'inherit', fontSize: '1.05rem',
                textAlign: isAr ? 'right' : 'left',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--courses-primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--courses-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        {/* ── Step 0: Original CTA button ── */}
        {step === 0 && (
          <button className="syllabus-start-btn" onClick={handleButtonClick} style={{ gap: '8px' }}>
            <Award size={18} />
            {t.btnCert}
          </button>
        )}
      </div>

      <style>{`
        @keyframes cert-morph {
          0%   { transform: scaleX(0.5) scaleY(0.2); opacity: 0; }
          100% { transform: scaleX(1)   scaleY(1);   opacity: 1; }
        }
        @keyframes cert-slide-up {
          0%   { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        .cert-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: cert-spin 0.7s linear infinite;
        }
        @keyframes cert-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default CertificateCTA;
