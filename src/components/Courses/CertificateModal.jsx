import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import CertificateTemplate from './CertificateTemplate';
import './Courses.css';
const CertificateModal = ({ isOpen, onClose, courseTitle, lang = 'ar' }) => {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [learnerName, setLearnerName] = useState('');
  const [certId, setCertId] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      // Generate a random certificate ID
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const date = new Date();
      setCertId(`WTQ-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${randomId}`);
      setLearnerName(''); // Reset name when opened
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!certificateRef.current || !learnerName.trim()) return;
    setIsGenerating(true);
    try {
      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html-to-image for proper Arabic RTL text rendering
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1.0,
        pixelRatio: 3, // High resolution
        skipFonts: false,
        // Ensure the background is captured correctly
        style: { overflow: 'hidden' }
      });

      // Create PDF in landscape A4
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Wathiq_Certificate_${certId}.pdf`);
    } catch (error) {
      console.error("Error generating certificate", error);
      alert(lang === 'ar' ? "حدث خطأ أثناء استخراج الشهادة" : "Error generating certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const dateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      zIndex: 999999 
    }}>
      <div style={{ 
        position: 'relative', backgroundColor: '#064e3b', 
        padding: '30px', borderRadius: '24px',
        maxWidth: '900px', width: '95%', maxHeight: '95vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'rgba(255, 255, 255, 0.1)', border: 'none',
            color: '#fff', fontSize: '1.5rem', width: '36px', height: '36px',
            borderRadius: '50%', cursor: 'pointer', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 10
          }}
        >×</button>
        
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-primary)' }}>
          {lang === 'ar' ? '🎓 شهادة إتمام الدورة' : '🎓 Course Completion Certificate'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {lang === 'ar' ? 'يرجى إدخال اسمك كما تريد أن يظهر في الشهادة' : 'Please enter your name as you want it to appear on the certificate'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <input 
            type="text" 
            value={learnerName}
            onChange={(e) => setLearnerName(e.target.value)}
            placeholder={lang === 'ar' ? "الاسم الكامل (مثال: سارة أحمد)" : "Full Name (e.g., Sarah Ahmed)"}
            style={{
              padding: '12px 20px',
              width: '100%',
              maxWidth: '400px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              fontSize: '1.1rem',
              textAlign: 'center',
              fontFamily: 'inherit'
            }}
          />
        </div>
        
        {/* Certificate Preview Container */}
        <div style={{ overflowX: 'auto', marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
          <CertificateTemplate 
            ref={certificateRef}
            lang={lang}
            courseTitle={courseTitle}
            learnerName={learnerName}
            certId={certId}
            dateStr={dateStr}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button 
            className="wathiq-btn primary"
            onClick={handleDownload}
            disabled={isGenerating || !learnerName.trim()}
            style={{ minWidth: '220px', opacity: !learnerName.trim() ? 0.5 : 1, cursor: !learnerName.trim() ? 'not-allowed' : 'pointer' }}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-small" style={{borderTopColor: '#000'}}></span>
                {lang === 'ar' ? 'جاري التحضير...' : 'Generating...'}
              </span>
            ) : (
              lang === 'ar' ? '📥 تحميل الشهادة (PDF)' : '📥 Download Certificate (PDF)'
            )}
          </button>
          
          <button 
            className="wathiq-btn outline"
            onClick={onClose}
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
export { CertificateModal };

