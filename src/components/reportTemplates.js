// reportTemplates.js

// Helper function to translate categories
const translateCategory = (category) => {
    switch (category) {
      case 'oil': return 'زيت';
      case 'serum': return 'سيروم';
      case 'acid': return 'حمض';
      case 'chemical': return 'مادة كيميائية';
      default: return category;
    }
  };
  
  // Helper function to get ingredient benefits
  const getIngredientBenefits = (ingredient) => {
    if (!ingredient || !ingredient.benefits) return [];
    if (typeof ingredient.benefits === 'object' && !Array.isArray(ingredient.benefits)) {
      return Object.keys(ingredient.benefits);
    }
    return Array.isArray(ingredient.benefits) ? ingredient.benefits : [];
  };
  
  // Generate the complete HTML for download
  export const generateDownloadHTML = (data) => {
    const { reliability_score, status, detected_ingredients, marketing_results, timestamp, sunscreen_analysis } = data;
    
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير تحليل OilGuard - حارس الخلطات</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Tajawal', sans-serif;
            direction: rtl;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #2d3748;
            line-height: 1.6;
            padding: 20px;
            min-height: 100vh;
          }
          
          .report-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .report-header {
            background: linear-gradient(135deg, #005f73 0%, #0a9396 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
          }
          
          .header-content {
            position: relative;
            z-index: 2;
          }
          
          .report-title {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .report-subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            font-weight: 300;
          }
          
          .header-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="white" opacity="0.1"><circle cx="20" cy="20" r="2"/><circle cx="50" cy="50" r="3"/><circle cx="80" cy="80" r="2"/><circle cx="30" cy="70" r="1"/><circle cx="70" cy="30" r="1"/></svg>');
          }
          
          .main-content {
            padding: 40px;
          }
          
          .section {
            margin-bottom: 40px;
            background: #f8fafc;
            border-radius: 15px;
            padding: 30px;
            border: 1px solid #e2e8f0;
          }
          
          .section-title {
            font-size: 1.5em;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #0a9396;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-title::before {
            content: "▪";
            color: #0a9396;
            font-size: 1.8em;
          }
          
          .reliability-section {
            background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
            border: 2px solid #68d391;
            text-align: center;
          }
          
          .reliability-score {
            font-size: 4em;
            font-weight: 800;
            margin: 20px 0;
            background: linear-gradient(135deg, #0a9396, #005f73);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .reliability-status {
            font-size: 1.4em;
            font-weight: 600;
            color: #2d3748;
            background: white;
            padding: 10px 30px;
            border-radius: 25px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .ingredients-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .ingredient-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .ingredient-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #f7fafc;
            padding-bottom: 10px;
          }
          
          .ingredient-name {
            font-size: 1.2em;
            font-weight: 700;
            color: #2d3748;
            flex: 1;
          }
          
          .ingredient-category {
            background: #e6fffa;
            color: #234e52;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: 600;
          }
          
          .benefits-list, .warnings-list {
            list-style: none;
            margin-top: 10px;
          }
          
          .benefits-list li {
            background: #f0fff4;
            color: #22543d;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 8px;
            font-size: 0.9em;
            border-right: 3px solid #68d391;
          }
          
          .warnings-list li {
            background: #fed7d7;
            color: #742a2a;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 8px;
            font-size: 0.9em;
            border-right: 3px solid #fc8181;
          }
          
          .marketing-claim-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            border: 1px solid #e2e8f0;
            border-right: 4px solid;
          }
          
          .claim-proven { border-right-color: #68d391; }
          .claim-traditional { border-right-color: #d69e2e; }
          .claim-doubtful { border-right-color: #ed8936; }
          .claim-ineffective { border-right-color: #fc8181; }
          
          .claim-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          
          .claim-title {
            font-size: 1.1em;
            font-weight: 700;
            color: #2d3748;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            background: #2d3748;
            color: white;
            margin-top: 40px;
          }
          
          .footer-content {
            opacity: 0.8;
            font-size: 0.9em;
          }
          
          .timestamp {
            margin-top: 10px;
            font-size: 0.8em;
            opacity: 0.6;
          }
          
          @media print {
            body {
              background: white !important;
              padding: 0;
            }
            .report-container {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <!-- Header -->
          <div class="report-header">
            <div class="header-pattern"></div>
            <div class="header-content">
              <h1 class="report-title">📊 تقرير تحليل OilGuard</h1>
              <p class="report-subtitle">نظام متكامل لتحليل مكونات منتجات العناية بالبشرة والشعر</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="main-content">
            <!-- Reliability Score -->
            <div class="section reliability-section">
              <h2 class="section-title">🎯 درجة الموثوقية العامة</h2>
              <div class="reliability-score">${reliability_score}%</div>
              <div class="reliability-status">${status}</div>
            </div>
            
            <!-- Sunscreen Analysis -->
            ${sunscreen_analysis ? `
              <div class="section">
                <h2 class="section-title">☀️ تحليل واقي الشمس</h2>
                <div style="text-align: center; margin: 20px 0;">
                  <div style="font-size: 2.5em; font-weight: 700; color: #234e52;">${sunscreen_analysis.efficacyScore}%</div>
                  <div style="font-size: 1.3em; font-weight: 600; color: #234e52;">مستوى الحماية: ${sunscreen_analysis.protectionLevel}</div>
                </div>
              </div>
            ` : ''}
            
            <!-- Ingredients -->
            <div class="section">
              <h2 class="section-title">🧪 المكونات المكتشفة (${detected_ingredients.length})</h2>
              <div class="ingredients-grid">
                ${detected_ingredients.map(ing => `
                  <div class="ingredient-card">
                    <div class="ingredient-header">
                      <span class="ingredient-name">${ing.name}</span>
                      <span class="ingredient-category">${translateCategory(ing.mainCategory)}</span>
                    </div>
                    
                    ${getIngredientBenefits(ing).length > 0 ? `
                      <div>
                        <strong style="color: #22543d;">الفوائد:</strong>
                        <ul class="benefits-list">
                          ${getIngredientBenefits(ing).slice(0, 3).map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    
                    ${ing.warnings && ing.warnings.length > 0 ? `
                      <div style="margin-top: 10px;">
                        <strong style="color: #742a2a;">تحذيرات:</strong>
                        <ul class="warnings-list">
                          ${ing.warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- Marketing Claims -->
            <div class="section">
              <h2 class="section-title">📢 تحليل الادعاءات التسويقية</h2>
              ${marketing_results.map(result => {
                const statusClass = result.status.includes('✅') ? 'proven' : 
                                  result.status.includes('🌿') ? 'traditional' :
                                  result.status.includes('⚖️') ? 'doubtful' :
                                  result.status.includes('❌') ? 'ineffective' : 'none';
                return `
                  <div class="marketing-claim-card claim-${statusClass}">
                    <div class="claim-header">
                      <span class="claim-title">${result.claim}</span>
                      <span>${result.status}</span>
                    </div>
                    <p style="color: #4a5568; margin: 10px 0;">${result.explanation}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-content">
              تم إنشاء هذا التقرير بواسطة نظام OilGuard - حارس الخلطات
              <div class="timestamp">
                ${new Date(timestamp).toLocaleString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };