import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, schema, lastUpdated, lang = 'ar' }) => {
    // Homepage title — exact target keyword first
    const defaultTitle = "تطبيق وثيق | محلل مكونات التجميل بالذكاء الاصطناعي";
    const defaultDesc = "تطبيق وثيق: المنصة الجزائرية الأولى لتحليل مكونات مستحضرات التجميل، مقارنة المنتجات، وبناء روتين العناية المثالي بالذكاء الاصطناعي. حمّله مجاناً على Play Store.";
    const defaultKeywords = "تطبيق وثيق, وثيق, Wathiq, تحليل مكونات التجميل, عناية بالبشرة, ذكاء اصطناعي, الجزائر, روتين شعر, بشرة, محلل مكونات";
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

    // Sub-pages: "Page Title | تطبيق وثيق | Wathiq"
    // Homepage: uses defaultTitle directly (no title prop passed)
    const fullTitle = title
        ? `${title} | تطبيق وثيق`
        : defaultTitle;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
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
            <meta property="og:site_name" content="تطبيق وثيق" />
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