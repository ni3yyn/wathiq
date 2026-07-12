export const ingredientsCreme = {
  slug: 'comment-lire-liste-ingredients-cosmetique',
  lang: 'fr',
  publishedAt: '2026-07-02',
  category: 'science',
  readTime: 5,
  author: 'Équipe Scientifique Wathiq',
  coverEmoji: '📋',
  coverColor: '#2980b9',
  seo: {
    title: 'Comment lire la liste des ingrédients INCI de votre crème | Wathiq',
    description: 'Guide complet pour décrypter la liste INCI des cosmétiques: ordre des ingrédients, concentration, ingrédients à éviter et termes clés à connaître.',
    keywords: ['liste INCI cosmetique', 'lire ingrédients crème', 'INCI algérie', 'analyser cosmétique'],
  },
  translations: { ar: 'kayfa-taqrai-qaimat-almukawwinat', en: 'how-to-read-inci-ingredient-list' },
  content: [
    {
      type: 'heading',
      data: { level: 2, text: 'Le système INCI — la langue universelle de la cosmétique' }
    },
    {
      type: 'paragraph',
      data: "INCI signifie International Nomenclature of Cosmetic Ingredients — un système de nomenclature universel pour les ingrédients cosmétiques. Tout produit autorisé doit lister ses ingrédients sous leurs noms scientifiques latins ou anglais selon ce système. Cela permet aux spécialistes — et aux utilisateurs de Wathiq ! — de lire les ingrédients quelle que soit la langue locale de l'emballage."
    },
    {
      type: 'bubble_qa',
      data: {
        question: "Je lis la liste des ingrédients mais je ne comprends rien — tout est en anglais et très long. Par où commencer ?"
      }
    },
    {
      type: 'heading',
      data: { level: 2, text: 'Règle N°1 : L\'ordre = la concentration' }
    },
    {
      type: 'paragraph',
      data: "Le premier ingrédient de la liste est le plus concentré. Généralement ce sera l'eau (Aqua) ou une huile. Les 5 derniers ingrédients de la liste ont généralement des concentrations inférieures à 1% — cela inclut les parfums, conservateurs et colorants. Si vous voyez un ingrédient vedette (comme l'huile d'argan) dans la seconde moitié, sa concentration est symbolique."
    },
    {
      type: 'comparison_table',
      data: {
        headers: ["Position dans la liste", "Concentration approximative", "Signification"],
        rows: [
          ["1 - 3", "70-95%", "Base principale du produit"],
          ["4 - 8", "5-20%", "Actifs principaux"],
          ["9 - 15", "1-5%", "Actifs secondaires"],
          ["Au-delà de 15", "Moins de 1%", "Parfums, conservateurs, colorants"],
        ]
      }
    },
    {
      type: 'heading',
      data: { level: 2, text: 'Termes INCI essentiels à connaître' }
    },
    {
      type: 'comparison_table',
      data: {
        headers: ['Nom INCI', "Qu'est-ce?", 'Sécurité'],
        rows: [
          ['Aqua', 'Eau', '✅ Sûr'],
          ['Glycerin', 'Glycérine — hydratant', '✅ Sûr'],
          ['Cetearyl Alcohol', 'Alcool gras émollient (pas desséchant)', '✅ Sûr'],
          ['Alcohol Denat.', 'Alcool dénaturé — dessèche', '⚠️ Éviter en grande quantité'],
          ['Fragrance / Parfum', 'Parfum — peut cacher des dizaines de substances', '⚠️ Allergène potentiel'],
          ['Phenoxyethanol', 'Conservateur alternatif aux parabènes', '🟡 Sûr à 1%'],
          ['Niacinamide', 'Vitamine B3 — unifie le teint', '✅ Efficace et sûr'],
        ]
      }
    },
    {
      type: 'tip_box',
      data: {
        icon: '📱',
        title: 'La méthode la plus rapide',
        text: "Plutôt que de mémoriser des centaines de noms, photographiez la liste d'ingrédients avec Wathiq. L'IA l'analyse instantanément et vous donne une évaluation de chaque composant."
      }
    },
    {
      type: 'cta_wathiq',
      data: {
        message: "Transformez la liste INCI d'une équation complexe en rapport clair — en quelques secondes.",
        buttonText: 'Essayer Wathiq gratuitement',
        link: 'https://play.google.com/store/apps/details?id=com.wathiq.app'
      }
    }
  ]
};
