import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const routesToPrerender = [
  '/',
  '/faq',
  '/privacy',
  '/terms',
  '/compare',
  '/how-it-works',
  '/research',
  // Blog
  '/blog',
  // Arabic articles
  '/blog/kashf-iddiaaat-tasawiqiya',
  '/blog/zayt-argan-jazairi-tahlil',
  '/blog/ma-huwa-paraben-wa-hal-huwa-khatir',
  '/blog/kayfa-taqrai-qaimat-almukawwinat',
  '/blog/saboun-beldi-muqabila-saboun-tijari',
  '/blog/tabiyi-miaa-bil-miaa-hal-yayni-amin',
  '/blog/aftal-murattibat-lil-bashra-aljazairiya-aljaffa',
  '/blog/al-farq-bayna-spf30-wa-spf50',
  // French articles
  '/blog/fausses-promesses-cremes-algeriennes',
  '/blog/huile-argan-algerienne-vraie-ou-falsifiee',
  '/blog/comment-lire-liste-ingredients-cosmetique',
  '/blog/ingredients-a-eviter-cosmetiques-bon-marche',
  // English articles
  '/blog/marketing-lies-algerian-cosmetics',
  '/blog/how-to-read-inci-ingredient-list',
];

const app = express();

// Serve the static files from dist
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 3000;
const server = app.listen(PORT, async () => {
  console.log(`[Prerender] Server running on http://localhost:${PORT}`);
  
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Process each route
    for (const route of routesToPrerender) {
      console.log(`[Prerender] Processing ${route}...`);
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
      
      // Wait an extra 2 seconds for React to fully render any async content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const html = await page.content();
      
      // Save the generated HTML
      const routeDir = path.join(distPath, route);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(routeDir, 'index.html'), html);
      console.log(`[Prerender] Saved ${routeDir}/index.html`);
    }
    
    await browser.close();
    console.log('[Prerender] Complete!');
  } catch (err) {
    console.error('[Prerender] Error:', err);
  } finally {
    server.close();
  }
});
