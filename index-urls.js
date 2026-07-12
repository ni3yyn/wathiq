import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the service account JSON key file downloaded from Google Cloud Console
const KEY_FILE = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(KEY_FILE)) {
  console.error('\n❌ ERROR: service-account.json was not found in the project root directory.');
  console.error('Please download your Service Account JSON key from Google Cloud Console, rename it to "service-account.json", and place it in this folder:\n' + __dirname + '\n');
  process.exit(1);
}

const key = JSON.parse(fs.readFileSync(KEY_FILE));

const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/indexing']
});

jwtClient.authorize((err, tokens) => {
  if (err) {
    console.error('❌ Google Authentication failed:', err);
    return;
  }
  
  console.log('✅ Google Authentication successful!');

  const urls = [
    'https://wathiq.web.app/',
    'https://wathiq.web.app/how-it-works',
    'https://wathiq.web.app/research',
    'https://wathiq.web.app/faq',
    'https://wathiq.web.app/privacy',
    'https://wathiq.web.app/terms',
    'https://wathiq.web.app/blog',
    // Arabic articles
    'https://wathiq.web.app/blog/kashf-iddiaaat-tasawiqiya',
    'https://wathiq.web.app/blog/zayt-argan-jazairi-tahlil',
    'https://wathiq.web.app/blog/ma-huwa-paraben-wa-hal-huwa-khatir',
    'https://wathiq.web.app/blog/kayfa-taqrai-qaimat-almukawwinat',
    'https://wathiq.web.app/blog/saboun-beldi-muqabila-saboun-tijari',
    'https://wathiq.web.app/blog/tabiyi-miaa-bil-miaa-hal-yayni-amin',
    'https://wathiq.web.app/blog/aftal-murattibat-lil-bashra-aljazairiya-aljaffa',
    'https://wathiq.web.app/blog/al-farq-bayna-spf30-wa-spf50',
    // French articles
    'https://wathiq.web.app/blog/fausses-promesses-cremes-algeriennes',
    'https://wathiq.web.app/blog/huile-argan-algerienne-vraie-ou-falsifiee',
    'https://wathiq.web.app/blog/comment-lire-liste-ingredients-cosmetique',
    'https://wathiq.web.app/blog/ingredients-a-eviter-cosmetiques-bon-marche',
    // English articles
    'https://wathiq.web.app/blog/marketing-lies-algerian-cosmetics',
    'https://wathiq.web.app/blog/how-to-read-inci-ingredient-list'
  ];

  console.log(`Sending indexing requests for ${urls.length} URLs...\n`);

  urls.forEach(url => {
    google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: url,
        type: 'URL_UPDATED' // Requests crawling & indexing/re-indexing
      }
    }, (err, res) => {
      if (err) {
        console.error(`❌ Error indexing ${url}:`, err.message);
      } else {
        console.log(`🚀 Success! Indexing requested for: ${url}`);
      }
    });
  });
});
