// downloadReport.js
import { generateDownloadHTML } from './reportTemplates';

const downloadReport = (analysisData) => {
  if (!analysisData) return;
  
  const reportHTML = generateDownloadHTML(analysisData);
  
  const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `OilGuard-Report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Download with loading state
export const downloadReportWithLoading = (analysisData, event) => {
  const originalButton = event.target;
  const originalText = originalButton.innerHTML;
  
  // Show loading state
  originalButton.innerHTML = '<div class="spinning">⏳</div> جاري التحميل...';
  originalButton.disabled = true;
  
  setTimeout(() => {
    downloadReport(analysisData);
    // Restore button after a short delay
    setTimeout(() => {
      originalButton.innerHTML = originalText;
      originalButton.disabled = false;
    }, 1000);
  }, 500);
};

export default downloadReport;