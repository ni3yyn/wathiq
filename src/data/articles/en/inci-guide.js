export const inciGuide = {
  slug: 'how-to-read-inci-ingredient-list',
  lang: 'en',
  publishedAt: '2026-07-04',
  category: 'science',
  readTime: 5,
  author: 'Wathiq Scientific Team',
  coverEmoji: '📋',
  coverColor: '#2980b9',
  seo: {
    title: 'How to Read a Cosmetic Ingredient List (Complete INCI Guide) | Wathiq',
    description: 'Step-by-step guide to reading INCI cosmetic ingredient lists: ingredient order, concentration, red-flag ingredients, and key terms every smart shopper must know.',
    keywords: ['INCI ingredient list', 'how to read cosmetic ingredients', 'cosmetic ingredients guide', 'INCI analysis'],
  },
  translations: { ar: 'kayfa-taqrai-qaimat-almukawwinat', fr: 'comment-lire-liste-ingredients-cosmetique' },
  content: [
    {
      type: 'heading',
      data: { level: 2, text: 'The INCI System — The Global Language of Cosmetics' }
    },
    {
      type: 'paragraph',
      data: "INCI stands for International Nomenclature of Cosmetic Ingredients — a globally standardized naming system for cosmetic ingredients. Every licensed product must list its ingredients under their scientific Latin or English names according to this system. This allows specialists — and Wathiq users! — to read ingredients regardless of the local language on the packaging."
    },
    {
      type: 'bubble_qa',
      data: {
        question: "I read ingredient lists but understand nothing — all the names are in English and very long. Where do I start?"
      }
    },
    {
      type: 'heading',
      data: { level: 2, text: 'Rule #1: Order = Concentration' }
    },
    {
      type: 'paragraph',
      data: "The first ingredient in the list is the highest concentration. Usually this will be water (Aqua) or an oil (like Cetearyl Alcohol). The last 5 ingredients in the list are usually below 1% concentration — this includes fragrances, preservatives, and colorants. If you see a star ingredient (like argan oil) in the second half, its concentration is symbolic."
    },
    {
      type: 'comparison_table',
      data: {
        headers: ['Position in List', 'Approximate Concentration', 'What It Means'],
        rows: [
          ['1 - 3', '70-95%', 'The main base of the product'],
          ['4 - 8', '5-20%', 'Primary active ingredients'],
          ['9 - 15', '1-5%', 'Secondary active ingredients'],
          ['Beyond 15', 'Less than 1%', 'Fragrances, preservatives, colorants'],
        ]
      }
    },
    {
      type: 'heading',
      data: { level: 2, text: 'Essential INCI Terms to Know' }
    },
    {
      type: 'comparison_table',
      data: {
        headers: ['INCI Name', 'What Is It?', 'Safety Rating'],
        rows: [
          ['Aqua', 'Water', '✅ Completely safe'],
          ['Glycerin', 'Glycerine — humectant', '✅ Safe'],
          ['Cetearyl Alcohol', 'Fatty alcohol — emollient (not drying)', '✅ Safe'],
          ['Alcohol Denat.', 'Denatured alcohol — drying', '⚠️ Avoid in large amounts'],
          ['Fragrance / Parfum', 'Perfume — can hide dozens of substances', '⚠️ Potential allergen'],
          ['Phenoxyethanol', 'Preservative — paraben alternative', '🟡 Safe at 1%'],
          ['Sodium Lauryl Sulfate', 'Strong foaming cleanser', '⚠️ Irritating for sensitive skin'],
          ['Niacinamide', 'Vitamin B3 — skin tone evening', '✅ Effective and safe'],
        ]
      }
    },
    {
      type: 'tip_box',
      data: {
        icon: '📱',
        title: 'The Fastest Method',
        text: "Instead of memorizing hundreds of names, photograph the ingredient list with Wathiq. The AI analyzes it instantly and gives you a rating for every component."
      }
    },
    {
      type: 'cta_wathiq',
      data: {
        message: "Turn the INCI list from an impossible equation into a clear report — in seconds.",
        buttonText: 'Try Wathiq Free',
        link: 'https://play.google.com/store/apps/details?id=com.wathiq.app'
      }
    }
  ]
};
