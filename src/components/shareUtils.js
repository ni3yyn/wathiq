// shareUtils.js
export const generateShareText = (data) => {
  const { reliability_score, status, detected_ingredients, marketing_results } = data;
  
  let text = `🌿 تقرير تحليل OilGuard\n\n`;
  text += `✨ درجة الموثوقية: ${reliability_score}% - ${status}\n\n`;
  
  text += `🧪 المكونات المكتشفة: ${detected_ingredients.length} مكون\n`;
  detected_ingredients.slice(0, 5).forEach(ing => {
    text += `   • ${ing.name}\n`;
  });
  
  if (detected_ingredients.length > 5) {
    text += `   ... و${detected_ingredients.length - 5} أكثر\n`;
  }
  
  text += `\n📊 أهم النتائج:\n`;
  const significantResults = marketing_results.filter(result => 
    result.status.includes('✅') || result.status.includes('❌')
  ).slice(0, 3);
  
  significantResults.forEach(result => {
    const emoji = result.status.includes('✅') ? '✅' : '❌';
    text += `   ${emoji} ${result.claim}\n`;
  });
  
  text += `\n🔗 تم الإنشاء بواسطة OilGuard - حارس الخلطات الذكي`;
  
  return text;
};

// Generate shareable image
export const generateShareImage = (data) => {
  return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 1200;
      canvas.height = 1000;
      
      
      // Create beautiful gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f2f0f');
      gradient.addColorStop(0.5, '#1a3c1a');
      gradient.addColorStop(1, '#2d5a2d');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add glassmorphic overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);
      
      // Add border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      
      // Add decorative elements
      drawDecorativeElements(ctx, canvas.width, canvas.height);
      
      // Set RTL context
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      
      // Title with icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Tajawal';
      ctx.fillText('🌿 تقرير تحليل OilGuard', canvas.width - 80, 120);
      
      // Score section
      drawScoreSection(ctx, canvas.width, data.reliability_score, data.status);
      
      // Ingredients cards
      drawIngredientsCards(ctx, canvas.width, data.detected_ingredients);
      
      // Marketing results
      drawMarketingResults(ctx, canvas.width, data.marketing_results);
      
      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '24px Tajawal';
      ctx.fillText('تم الإنشاء بواسطة OilGuard - حارس الخلطات الذكي', canvas.width - 80, canvas.height - 60);
      
      // Resolve with data URL
      resolve(canvas.toDataURL('image/png'));
  });
};

function drawDecorativeElements(ctx, width, height) {
  // Add subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 0.5;
  
  for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
  }
  
  for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
  }
  
  // Add corner accents
  ctx.strokeStyle = 'rgba(163, 217, 165, 0.3)';
  ctx.lineWidth = 2;
  
 
  
  // Top left
  ctx.beginPath();
  ctx.moveTo(40, 60);
  ctx.lineTo(40, 40);
  ctx.lineTo(60, 40);
  ctx.stroke();
  
  // Top right
  ctx.beginPath();
  ctx.moveTo(width - 40, 60);
  ctx.lineTo(width - 40, 40);
  ctx.lineTo(width - 60, 40);
  ctx.stroke();
  
  // Bottom left
  ctx.beginPath();
  ctx.moveTo(40, height - 60);
  ctx.lineTo(40, height - 40);
  ctx.lineTo(60, height - 40);
  ctx.stroke();
  
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(width - 40, height - 60);
  ctx.lineTo(width - 40, height - 40);
  ctx.lineTo(width - 60, height - 40);
  ctx.stroke();
}

function drawScoreSection(ctx, width, score, status) {
  const centerX = width / 2;
  const y = 220;
  
  // Score circle background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(centerX, y, 90, 0, 2 * Math.PI);
  ctx.fill();
  
  // Score circle border
  ctx.strokeStyle = 'rgba(163, 217, 165, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, y, 90, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Score text
  ctx.fillStyle = '#a3d9a5';
  ctx.font = 'bold 48px Tajawal';
  ctx.textAlign = 'center';
  ctx.fillText(`${score}%`, centerX, y + 15);
  
  // Status
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px Tajawal';
  ctx.fillText(status, centerX, y + 70);
  ctx.textAlign = 'right';
}

function drawIngredientsCards(ctx, width, ingredients) {
  const startY = 350;
  const cardWidth = 340;
  const cardHeight = 120;
  const gap = 20;
  
  ctx.textAlign = 'right';
  
  // Section title
  ctx.fillStyle = '#a3d9a5';
  ctx.font = 'bold 36px Tajawal';
  ctx.fillText('🧪 المكونات المكتشفة', width - 80, startY - 20);
  
  let x = width - 80;
  let y = startY + 30;
  
  ingredients.slice(0, 6).forEach((ingredient, index) => {
      if (index % 2 === 0 && index !== 0) {
          x = width - 80;
          y += cardHeight + gap;
      } else if (index !== 0) {
          x -= cardWidth + gap;
      }
      
      // Card background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      roundRect(ctx, x - cardWidth, y - cardHeight, cardWidth, cardHeight, 16);
      ctx.fill();
      ctx.stroke();
      
      // Ingredient name
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Tajawal';
      
      // Truncate long names
      let name = ingredient.name;
      if (ctx.measureText(name).width > cardWidth - 40) {
          while (ctx.measureText(name + '...').width > cardWidth - 40 && name.length > 3) {
              name = name.slice(0, -1);
          }
          name = name + '...';
      }
      
      ctx.fillText(name, x - 30, y - cardHeight + 45);
      
      // Confidence indicator
      const confidence = ingredient.confidence || 95;
      ctx.fillStyle = confidence > 80 ? '#4CAF50' : confidence > 60 ? '#FF9800' : '#f44336';
      ctx.font = '18px Tajawal';
      ctx.fillText(`${confidence}% ثقة`, x - 30, y - cardHeight + 80);
  });
}

function drawMarketingResults(ctx, width, results) {
  const startY = 650;
  
  // Section title
  ctx.fillStyle = '#a3d9a5';
  ctx.font = 'bold 36px Tajawal';
  ctx.fillText('📊 أهم النتائج', width - 80, startY - 20);
  
  const significantResults = results.filter(result => 
      result.status.includes('✅') || result.status.includes('❌')
  ).slice(0, 3);
  
  significantResults.forEach((result, index) => {
      const y = startY + (index * 70);
      const icon = result.status.includes('✅') ? '✅' : '❌';
      const color = result.status.includes('✅') ? '#4CAF50' : '#f44336';
      
      ctx.fillStyle = color;
      ctx.font = '28px Tajawal';
      ctx.fillText(icon, width - 80, y + 25);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '22px Tajawal';
      
      // Truncate long claims
      let claim = result.claim;
      if (ctx.measureText(claim).width > width - 200) {
          while (ctx.measureText(claim + '...').width > width - 200 && claim.length > 10) {
              claim = claim.slice(0, -1);
          }
          claim = claim + '...';
      }
      
      ctx.fillText(claim, width - 120, y + 25);
  });
}

// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}