export const ingredientsEviter = {
  slug: 'ingredients-a-eviter-cosmetiques-bon-marche',
  lang: 'fr',
  publishedAt: '2026-06-29',
  category: 'science',
  readTime: 6,
  author: 'Équipe Scientifique Wathiq',
  coverEmoji: '🚫',
  coverColor: '#c0392b',
  seo: {
    title: 'Les 5 ingrédients à éviter dans les cosmétiques bon marché | Wathiq',
    description: "Guide des 5 ingrédients problématiques les plus courants dans les cosmétiques bon marché vendus en Algérie, avec noms INCI et alternatives sûres.",
    keywords: ['ingrédients à éviter cosmétique', 'cosmétique bon marché algérie', 'ingrédients dangereux crème', 'SLS parabène'],
  },
  translations: {},
  content: [
    {
      type: 'heading',
      data: { level: 2, text: 'Le prix bas a toujours un prix caché' }
    },
    {
      type: 'paragraph',
      data: "Les cosmétiques bon marché sont souvent formulés avec des ingrédients moins coûteux qui peuvent être irritants, perturbateurs ou simplement inefficaces. Ce guide identifie les 5 ingrédients les plus problématiques que vous retrouverez fréquemment dans les produits d'entrée de gamme vendus sur le marché algérien."
    },
    {
      type: 'heading',
      data: { level: 2, text: '1. Sodium Lauryl Sulfate (SLS)' }
    },
    {
      type: 'paragraph',
      data: "Le SLS est un tensioactif utilisé pour créer de la mousse. C'est l'un des nettoyants les plus agressifs existants — il détruit la barrière cutanée, irrite la peau sensible et provoque souvent des réactions eczémateuses. On le retrouve dans les shampooings bon marché, gels douche et même certaines crèmes. Alternative sûre : Sodium Laureth Sulfate (SLES), ou mieux encore, des tensioactifs doux comme Cocamidopropyl Betaine."
    },
    {
      type: 'comparison_table',
      data: {
        headers: ['Ingrédient', 'Problème', 'Alternative sûre'],
        rows: [
          ['Sodium Lauryl Sulfate (SLS)', 'Très irritant, détruit la barrière cutanée', 'Cocamidopropyl Betaine'],
          ['Methylisothiazolinone (MI)', 'Allergène puissant, interdit concentré en EU', 'Phenoxyethanol'],
          ['Hydroquinone > 2%', 'Cancérigène potentiel, interdit en UE cosmétique', 'Niacinamide, Acide Kojique'],
          ['Alcool Denat. en position 1-3', 'Dessèche et irritе chroniquement', 'Aucun alcool ou Cetyl Alcohol'],
          ['Triclosan', "Perturbateur endocrinien, en cours d'interdiction", 'Conservateurs non-halogénés'],
        ]
      }
    },
    {
      type: 'heading',
      data: { level: 2, text: '2. Methylisothiazolinone (MI/MCI)' }
    },
    {
      type: 'paragraph',
      data: "La MI et sa variante MCI (Methylchloroisothiazolinone) sont des conservateurs extrêmement efficaces mais aussi extrêmement allergisants. L'UE a interdit leur utilisation dans les produits sans rinçage (crèmes, lotions) à des concentrations supérieures à 0,0015%. On les retrouve souvent en remplacement des parabènes dans des produits se vantant d'être \"sans paraben\" — ce qui est une substitution problématique."
    },
    {
      type: 'heading',
      data: { level: 2, text: '3-5. Hydroquinone, Alcool Denat. et Triclosan' }
    },
    {
      type: 'paragraph',
      data: "L'hydroquinone à forte concentration est interdite dans les cosmétiques UE mais peut se retrouver dans des produits importés ou fabriqués localement sans contrôle rigoureux. L'alcool dénat. en grande quantité (position 1-3 dans INCI) détruit chroniquement le microbiome cutané. Le triclosan, antibactérien autrefois omniprésent, fait l'objet de restrictions croissantes pour son potentiel de perturbation endocrinienne."
    },
    {
      type: 'tip_box',
      data: {
        icon: '🛡️',
        title: 'Votre bouclier: la liste INCI',
        text: "Ces ingrédients peuvent être détectés instantanément dans la liste INCI par l'app Wathiq. Un scan de quelques secondes vous protège d'années d'exposition à des formulations problématiques."
      }
    },
    {
      type: 'cta_wathiq',
      data: {
        message: "Scannez vos produits avant qu'ils ne scannent votre peau. Wathiq détecte ces 5 ingrédients et bien d'autres.",
        buttonText: 'Télécharger Wathiq',
        link: 'https://play.google.com/store/apps/details?id=com.wathiq.app'
      }
    }
  ]
};
