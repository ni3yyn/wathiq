// shareReport.js
import { generateShareText, generateShareImage } from './shareUtils';

// Utility function to show toast messages
const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};

// Share as Image function
export const shareAsImage = (analysisData) => {
  showToast('🖼️ جاري إنشاء الصورة...');
  
  setTimeout(() => {
    try {
      const imageUrl = generateShareImage(analysisData);
      
      // Create download link for the image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `OilGuard-Report-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('✅ تم إنشاء الصورة بنجاح');
    } catch (error) {
      console.error('Error generating image:', error);
      showToast('❌ حدث خطأ في إنشاء الصورة');
    }
  }, 1000);
};

// Share via native share API
export const shareViaNative = (analysisData) => {
  const shareText = generateShareText(analysisData);
  const shareData = {
    title: `تقرير OilGuard - ${analysisData.reliability_score}%`,
    text: shareText,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('تمت المشاركة بنجاح'))
      .catch((error) => {
        console.log('تم إلغاء المشاركة:', error);
        showDirectShareModal(analysisData);
      });
  } else {
    showDirectShareModal(analysisData);
  }
};

// Direct share to specific platforms
export const showDirectShareModal = (analysisData) => {
  const shareText = generateShareText(analysisData);
  const encodedText = encodeURIComponent(shareText);
  
  const shareModal = document.createElement('div');
  shareModal.className = 'share-modal-overlay';
  shareModal.innerHTML = `
    <div class="share-modal glassmorphic-card">
      <div class="share-modal-header">
        <h3><i class="fas fa-share-alt"></i> مشاركة التقرير</h3>
        <button class="close-share-modal"><i class="fas fa-times"></i></button>
      </div>
      
      <div class="platforms-grid">
        <div class="platform-item" data-platform="whatsapp">
          <div class="platform-icon">
            <i class="fab fa-whatsapp"></i>
          </div>
          <span>واتساب</span>
        </div>
        
        <div class="platform-item" data-platform="telegram">
          <div class="platform-icon">
            <i class="fab fa-telegram"></i>
          </div>
          <span>تيليجرام</span>
        </div>
        
        <div class="platform-item" data-platform="messenger">
          <div class="platform-icon">
            <i class="fab fa-facebook-messenger"></i>
          </div>
          <span>ماسنجر</span>
        </div>
        
        <div class="platform-item" data-platform="instagram">
          <div class="platform-icon">
            <i class="fab fa-instagram"></i>
          </div>
          <span>انستغرام</span>
        </div>
        
        <div class="platform-item" data-platform="native">
          <div class="platform-icon">
            <i class="fas fa-mobile-alt"></i>
          </div>
          <span>المشاركة</span>
        </div>
        
        <div class="platform-item" data-platform="image">
          <div class="platform-icon">
            <i class="fas fa-image"></i>
          </div>
          <span>كصورة</span>
        </div>
      </div>
      
      <div class="share-preview">
        <div class="preview-header">
          <i class="fas fa-eye"></i>
          <span>معاينة النص</span>
        </div>
        <div class="preview-content">
          ${shareText}
        </div>
      </div>
    </div>
  `;

  // Add Font Awesome
  const fontAwesome = document.createElement('link');
  fontAwesome.rel = 'stylesheet';
  fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
  
  const styles = document.createElement('style');
  styles.textContent = `
    .share-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(7px);
      -webkit-backdrop-filter: blur(7px);
    }
    
    .glassmorphic-card {
      background: rgba(26, 60, 26, 0.25);
      backdrop-filter: blur(7px);
      -webkit-backdrop-filter: blur(7px);
      border-radius: 24px;
      border: 0.5px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .share-modal {
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-50px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .share-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 0.5px solid rgba(255, 255, 255, 0.2);
    }
    
    .share-modal-header h3 {
      margin: 0;
      color: #ffffff;
      font-size: 1.4em;
      font-weight: 600;
      font-family: 'Tajawal', sans-serif;
    }
    
    .share-modal-header i {
      margin-left: 10px;
      color: #a3d9a5;
    }
    
    .close-share-modal {
      background: rgba(255, 255, 255, 0.1);
      border: 0.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      color: #ffffff;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(7px);
    }
    
    .close-share-modal:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
    
    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    
    .platform-item {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(7px);
      border: 0.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 25px 15px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .platform-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    }
    
    .platform-item:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-5px);
      box-shadow: 
        0 10px 25px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .platform-icon {
      font-size: 2.2em;
      margin-bottom: 12px;
      color: #a3d9a5;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    
    .platform-item span {
      font-weight: 600;
      color: #ffffff;
      font-size: 0.9em;
      font-family: 'Tajawal', sans-serif;
    }
    
    .share-preview {
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(7px);
      border-radius: 16px;
      border: 0.5px solid rgba(255, 255, 255, 0.15);
      padding: 20px;
    }
    
    .preview-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      color: #a3d9a5;
      font-family: 'Tajawal', sans-serif;
    }
    
    .preview-header i {
      margin-left: 8px;
    }
    
    .preview-header span {
      font-weight: 600;
      font-size: 0.95em;
    }
    
    .preview-content {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 12px;
      border: 0.5px solid rgba(255, 255, 255, 0.1);
      font-size: 0.85em;
      line-height: 1.6;
      white-space: pre-line;
      max-height: 120px;
      overflow-y: auto;
      color: #e8f5e8;
      font-family: 'Tajawal', sans-serif;
      text-align: right;
      direction: rtl;
    }
    
    .toast-message {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(26, 60, 26, 0.9);
      backdrop-filter: blur(7px);
      color: white;
      padding: 15px 25px;
      border-radius: 25px;
      font-weight: 600;
      z-index: 10001;
      border: 0.5px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      animation: toastSlideIn 0.4s ease-out;
      font-family: 'Tajawal', sans-serif;
    }
    
    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;

  document.head.appendChild(fontAwesome);
  document.head.appendChild(styles);
  document.body.appendChild(shareModal);

  // Platform URLs
  const platformUrls = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?text=${encodedText}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.href)}&app_id=123456789&redirect_uri=${encodeURIComponent(window.location.href)}`,
    instagram: `https://instagram.com/`,
    native: () => shareViaNative(analysisData),
    image: () => shareAsImage(analysisData)
  };

  // Add click handlers
  shareModal.querySelectorAll('.platform-item').forEach(item => {
    const platform = item.dataset.platform;
    item.addEventListener('click', () => {
      if (typeof platformUrls[platform] === 'function') {
        platformUrls[platform]();
      } else {
        window.open(platformUrls[platform], '_blank');
        showToast(`📤 جاري فتح ${item.querySelector('span').textContent}...`);
      }
      closeModal();
    });
  });

  // Close modal
  const closeModal = () => {
    document.body.removeChild(shareModal);
    document.head.removeChild(styles);
    document.head.removeChild(fontAwesome);
  };

  shareModal.querySelector('.close-share-modal').addEventListener('click', closeModal);
  shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) closeModal();
  });
};

// Main share function
export const shareReport = (analysisData) => {
  if (!analysisData) return;
  
  // Try native sharing first
  shareViaNative(analysisData);
};

// Share with loading state
export const shareReportWithLoading = (analysisData, event) => {
  const originalButton = event.target;
  const originalText = originalButton.innerHTML;
  
  // Show loading state
  originalButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التجهيز...';
  originalButton.disabled = true;
  
  setTimeout(() => {
    shareReport(analysisData);
    // Restore button after a short delay
    setTimeout(() => {
      originalButton.innerHTML = originalText;
      originalButton.disabled = false;
    }, 1000);
  }, 500);
};