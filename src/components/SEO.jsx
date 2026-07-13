import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';

const SEO = ({ title, description, keywords, image, schema, lastUpdated, lang }) => {
    const { lang: contextLang } = useLang();
    const currentLang = lang || contextLang || 'ar';

    const brandPrefix = currentLang === 'ar' ? 'وثيق | ' : 'Wathiq | ';

    // Homepage descriptions per language
    const defaultDescriptions = {
        ar: "تطبيق وثيق: المنصة الجزائرية الأولى لتحليل مكونات مستحضرات التجميل، مقارنة المنتجات، وبناء روتين العناية المثالي بالذكاء الاصطناعي. حمّله مجاناً على Play Store.",
        fr: "Wathiq: La première plateforme algérienne pour analyser les ingrédients cosmétiques, comparer les produits et créer la routine de soin parfaite grâce à l'IA. Téléchargez gratuitement sur Play Store.",
        en: "Wathiq: The first Algerian platform to analyze cosmetic ingredients, compare products, and build the perfect skincare routine with AI. Download it for free on Play Store."
    };

    const defaultKeywordsList = {
        ar: "تطبيق وثيق, وثيق, Wathiq, تحليل مكونات التجميل, عناية بالبشرة, ذكاء اصطناعي, الجزائر, روتين شعر, بشرة, محلل مكونات",
        fr: "Wathiq, Wathiq app, analyse ingrédients cosmétiques, soins de la peau, intelligence artificielle, Algérie, routine cheveux, peau, analyseur de composants",
        en: "Wathiq, Wathiq app, cosmetic ingredients analysis, skincare, artificial intelligence, Algeria, hair routine, skin, ingredient analyzer"
    };

    const defaultTitle = currentLang === 'ar'
        ? "وثيق | محلل مكونات التجميل بالذكاء الاصطناعي"
        : currentLang === 'fr'
        ? "Wathiq | Votre Analyste Cosmétique"
        : "Wathiq | Your Cosmetic Analyst";

    const defaultDesc = defaultDescriptions[currentLang] || defaultDescriptions.ar;
    const defaultKeywords = defaultKeywordsList[currentLang] || defaultKeywordsList.ar;
    const defaultImage = "https://wathiq.web.app/og-image-compressed.jpg";
    const themeColor = "#10b981";

    const getCanonicalUrl = () => {
        if (typeof window === 'undefined') return "https://wathiq.web.app/";
        const { hostname, pathname, search } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `https://wathiq.web.app${pathname}${search}`;
        }
        return window.location.href;
    };
    const currentUrl = getCanonicalUrl();

    // Standardize all titles to: "وثيق | xxxxx" or "Wathiq | xxxxx"
    let fullTitle = '';
    if (title) {
        // Strip any existing prefix or suffix brand names from the title prop
        let cleanTitle = title
            .replace(/^وثيق\s*\|\s*/, '')
            .replace(/^Wathiq\s*\|\s*/, '')
            .replace(/\s*\|\s*تطبيق وثيق$/, '')
            .replace(/\s*\|\s*وثيق$/, '')
            .replace(/\s*\|\s*Wathiq$/, '')
            .replace(/\s*\|\s*Wathiq Academy$/, '')
            .replace(/\s*\|\s*أكاديمية وثيق$/, '');
        
        fullTitle = `${brandPrefix}${cleanTitle}`;
    } else {
        fullTitle = defaultTitle;
    }

    return (
        <Helmet>
            {/* Standard Metadata */}
            <html lang={currentLang} dir={currentLang === 'ar' ? 'rtl' : 'ltr'} />
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDesc} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <meta name="theme-color" content={themeColor} />
            <link rel="canonical" href={currentUrl} />

            {/* Hreflang Tags for Multilingual SEO/AEO */}
            <link rel="alternate" hreflang="ar" href="https://wathiq.web.app/?lang=ar" />
            <link rel="alternate" hreflang="fr" href="https://wathiq.web.app/?lang=fr" />
            <link rel="alternate" hreflang="en" href="https://wathiq.web.app/?lang=en" />
            <link rel="alternate" hreflang="x-default" href="https://wathiq.web.app/?lang=ar" />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDesc} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:site_name" content={currentLang === 'ar' ? "تطبيق وثيق" : "Wathiq App"} />
            <meta property="og:url" content={currentUrl} />
            
            {/* Freshness Signals for AI SEO */}
            {lastUpdated && <meta property="article:modified_time" content={lastUpdated} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDesc} />
            <meta name="twitter:image" content={image || defaultImage} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;