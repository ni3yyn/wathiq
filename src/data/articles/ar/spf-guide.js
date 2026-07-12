export const spfGuide = {
  slug: 'al-farq-bayna-spf30-wa-spf50',
  lang: 'ar',
  publishedAt: '2026-06-22',
  category: 'science',
  readTime: 5,
  author: 'فريق وثيق العلمي',
  coverEmoji: '☀️',
  coverColor: '#f39c12',
  seo: {
    title: 'الفرق بين SPF 30 وSPF 50 — أيهما تختارين في الجزائر؟ | وثيق',
    description: 'شرح علمي كامل لمعنى SPF ومعامل PA، والفرق الحقيقي بين SPF 30 و50، ومتى تختارين كل منهما في المناخ الجزائري.',
    keywords: ['SPF 30 50', 'واقي شمس جزائر', 'معنى SPF', 'UV protection'],
  },
  translations: {},
  content: [
    {
      type: 'heading',
      data: { level: 2, text: 'SPF — الرقم الذي يُفهم خطأً دائماً' }
    },
    {
      type: 'paragraph',
      data: 'SPF (Sun Protection Factor) هو مؤشر حماية الجلد من الأشعة UVB فقط — وهي الأشعة التي تسبب الاحمرار وحروق الشمس. لكن هناك نوع آخر من الأشعة فوق البنفسجية هو UVA — الأعمق اختراقاً والأكثر مسؤولية عن الشيخوخة المبكرة وسرطان الجلد — ولا يقيسه الـ SPF مباشرة.'
    },
    {
      type: 'bubble_qa',
      data: {
        question: 'كنت أظن أن SPF 50 يحميني ضعف SPF 30 — هل هذا صحيح؟'
      }
    },
    {
      type: 'paragraph',
      data: 'الحقيقة المفاجئة: SPF 30 يمنع 96.7% من أشعة UVB، أما SPF 50 فيمنع 98%. الفرق النظري ضئيل جداً في الاختبارات المخبرية. لكن في الاستخدام الفعلي، SPF 50 يمنحك هامشاً أوسع لأن معظم الناس لا تضع الكمية الكافية من الواقي (2mg/cm²) في الواقع.'
    },
    {
      type: 'comparison_table',
      data: {
        headers: ['معامل SPF', 'نسبة حجب UVB', 'مدة الحماية', 'الاستخدام المثالي'],
        rows: [
          ['SPF 15', '93.3%', 'يومي في المناطق الباردة', 'داخل المكتب'],
          ['SPF 30', '96.7%', 'حماية جيدة', 'تنقل يومي، جزائر شمال'],
          ['SPF 50', '98.0%', 'حماية عالية', 'شمس مباشرة، شاطئ، رياضة'],
          ['SPF 50+', '+98%', 'أقصى حماية', 'جنوب جزائر، صيف شديد'],
        ]
      }
    },
    {
      type: 'heading',
      data: { level: 2, text: 'PA+++ — ما يتجاهله معظم الناس' }
    },
    {
      type: 'paragraph',
      data: 'معامل PA (Protection Grade of UVA) هو نظام ياباني لقياس الحماية من UVA. يُرمز له بعلامات + (من + إلى ++++). في المناخ الجزائري، خاصة في الصيف، PA++++ أو PA+++ ضروري لأن الـ UVA لا ترتبط بالحرارة — تخترق السحاب والزجاج وتسبب التصبغات والشيخوخة المبكرة طوال السنة.'
    },
    {
      type: 'heading',
      data: { level: 2, text: 'كيف تقرئي مكونات الواقي في قائمة INCI' }
    },
    {
      type: 'comparison_table',
      data: {
        headers: ['نوع الفلتر', 'اسم INCI', 'يحمي من', 'ملاحظة'],
        rows: [
          ['كيميائي UVB', 'Ethylhexyl Methoxycinnamate', 'UVB', 'شائع، محل دراسة'],
          ['كيميائي UVA', 'Butyl Methoxydibenzoylmethane (Avobenzone)', 'UVA', 'غير مستقر وحده'],
          ['معدني واسع الطيف', 'Titanium Dioxide', 'UVA + UVB', '✅ آمن، يُبيّض مؤقتاً'],
          ['معدني واسع الطيف', 'Zinc Oxide', 'UVA + UVB', '✅ الأفضل، مناسب للحساسة'],
        ]
      }
    },
    {
      type: 'tip_box',
      data: {
        icon: '☀️',
        title: 'توصية وثيق للمناخ الجزائري',
        text: 'SPF 50 + PA+++ على الأقل للخروج اليومي. اختاري واقي يحتوي على Zinc Oxide أو Titanium Dioxide كمكون أساسي لأشعة UVA الواسعة الطيف. أعيدي التطبيق كل ساعتين عند التعرض للشمس المباشرة.'
      }
    },
    {
      type: 'cta_wathiq',
      data: {
        message: 'تحققي من مكونات واقي الشمس لديك وهل يحمي من UVA وUVB معاً.',
        buttonText: 'حمّلي وثيق مجاناً',
        link: 'https://play.google.com/store/apps/details?id=com.wathiq.app'
      }
    }
  ]
};
