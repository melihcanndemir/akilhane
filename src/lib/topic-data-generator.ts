export interface TopicStep {
  id: string;
  title: string;
  content: string;
  visualAid?: string;
  examples: string[];
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  formulas?: string[];
  keyConcepts?: string[];
  practiceQuestions?: string[];
}

export interface TopicData {
  topic: string;
  subject: string;
  steps: TopicStep[];
  totalTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites?: string[];
  learningObjectives?: string[];
}

// Gerçek konu verileri - AI destekli dinamik üretim
const generateTopicData = (topic: string, subject: string): TopicData =>
  // Topic-explainer için her zaman gerçek verileri kullan (demo mode'u görmezden gel)
   generateRealTopicData(topic, subject)
;

const generateDemoTopicData = (topic: string, subject: string): TopicData => {
  const baseSteps: TopicStep[] = [
    {
      id: 'intro',
      title: 'Konuya Giriş',
      content: `${topic} konusu ${subject} dersinin temel yapı taşlarından biridir. Bu konuyu anlamak, daha karmaşık konuları öğrenmek için sağlam bir temel oluşturur.`,
      examples: [
        'Günlük hayattan örnekler',
        'Basit formüller',
        'Temel kavramlar',
      ],
      tips: [
        'Konuyu parça parça öğrenin',
        'Her adımı tam anlamadan geçmeyin',
        'Bol bol pratik yapın',
      ],
      difficulty: 'easy',
      estimatedTime: 5,
    },
    {
      id: 'core',
      title: 'Ana Kavramlar',
      content: `${topic} konusunun merkezinde yer alan temel kavramları öğrenelim. Bu kavramlar, konunun geri kalanını anlamak için kritik öneme sahiptir.`,
      examples: [
        'Matematiksel ifadeler',
        'Görsel diyagramlar',
        'İnteraktif simülasyonlar',
      ],
      tips: [
        'Kavramları kendi kelimelerinizle açıklayın',
        'Görselleştirmeleri dikkatle inceleyin',
        'Örnekleri kendiniz çözmeye çalışın',
      ],
      difficulty: 'medium',
      estimatedTime: 8,
    },
    {
      id: 'advanced',
      title: 'İleri Seviye',
      content: `Artık ${topic} konusunun daha karmaşık yönlerini keşfedelim. Bu seviyede, konuyu farklı açılardan ele alacağız.`,
      examples: [
        'Karmaşık problemler',
        'Gerçek hayat uygulamaları',
        'Sınav soruları',
      ],
      tips: [
        'Sabırlı olun, karmaşık konular zaman alır',
        'Farklı yöntemler deneyin',
        'Hata yapmaktan korkmayın',
      ],
      difficulty: 'hard',
      estimatedTime: 12,
    },
  ];

  return {
    topic,
    subject,
    steps: baseSteps,
    totalTime: 25,
    difficulty: 'medium',
    learningObjectives: [
      `${topic} konusunun temel kavramlarını anlamak`,
      'Günlük hayatta uygulamalarını görmek',
      'Problem çözme becerilerini geliştirmek',
    ],
  };
};

const generateRealTopicData = (topic: string, subject: string): TopicData => {
  // Konu bazlı özel içerik üretimi
  const topicSpecificData = getTopicSpecificContent(topic, subject);

  return topicSpecificData;
};

const getTopicSpecificContent = (topic: string, subject: string): TopicData => {
  // Matematik konuları
  if (subject === 'Matematik') {
    switch (topic.toLowerCase()) {
      case 'türev':
        return {
          topic,
          subject,
          steps: [
            {
              id: 'intro',
              title: 'Türev Kavramına Giriş',
              content: 'Türev, bir fonksiyonun belirli bir noktadaki değişim oranını ölçen matematiksel bir kavramdır. Fonksiyonun grafiğine çizilen teğetin eğimi, o noktadaki türevi verir.',
              examples: [
                'Bir arabanın hızı, konumun zamana göre türevidir',
                'Bir fonksiyonun maksimum ve minimum noktaları türevin sıfır olduğu yerlerdir',
                'Ekonomide marjinal maliyet, toplam maliyetin türevidir',
              ],
              tips: [
                'Türev geometrik olarak teğet eğimi anlamına gelir',
                'Limit kavramını iyi anlamak türev için kritiktir',
                'Türev kurallarını ezberlemek yerine mantığını anlayın',
              ],
              difficulty: 'medium' as const,
              estimatedTime: 8,
              formulas: ['f\'(x) = lim(h→0) [f(x+h) - f(x)]/h'],
              keyConcepts: ['Limit', 'Teğet', 'Değişim Oranı'],
            },
            {
              id: 'rules',
              title: 'Türev Kuralları',
              content: 'Türev alırken kullanılan temel kuralları öğrenelim. Bu kurallar, karmaşık fonksiyonların türevini almayı kolaylaştırır.',
              examples: [
                'Sabit fonksiyon: f(x) = c → f\'(x) = 0',
                'Kuvvet kuralı: f(x) = x^n → f\'(x) = nx^(n-1)',
                'Çarpım kuralı: (fg)\' = f\'g + fg\'',
                'Bölüm kuralı: (f/g)\' = (f\'g - fg\')/g²',
              ],
              tips: [
                'Kuralları adım adım uygulayın',
                'İç fonksiyonları tespit edin',
                'Zincir kuralını unutmayın',
              ],
              difficulty: 'medium' as const,
              estimatedTime: 12,
              formulas: [
                'Sabit: d/dx(c) = 0',
                'Kuvvet: d/dx(x^n) = nx^(n-1)',
                'Çarpım: d/dx(fg) = f\'g + fg\'',
                'Bölüm: d/dx(f/g) = (f\'g - fg\')/g²',
              ],
              keyConcepts: ['Sabit Kuralı', 'Kuvvet Kuralı', 'Çarpım Kuralı', 'Bölüm Kuralı'],
            },
            {
              id: 'applications',
              title: 'Türevin Uygulamaları',
              content: 'Türev kavramının gerçek hayattaki uygulamalarını ve problem çözme tekniklerini öğrenelim.',
              examples: [
                'Maksimum-minimum problemleri',
                'Hız ve ivme hesaplamaları',
                'Ekonomik optimizasyon problemleri',
                'Fizik problemlerinde hareket analizi',
              ],
              tips: [
                'Problemi matematiksel olarak modelleyin',
                'Türev alıp sıfıra eşitleyin',
                'Kritik noktaları test edin',
                'Sonuçları yorumlayın',
              ],
              difficulty: 'hard',
              estimatedTime: 15,
              practiceQuestions: [
                'f(x) = x³ - 3x² + 2 fonksiyonunun yerel ekstremumlarını bulun',
                'Bir dikdörtgenin çevresi 20 cm ise, alanı maksimum yapan boyutları bulun',
                'Bir cismin konumu s(t) = t³ - 6t² + 9t ise, t=2 anındaki hızını bulun',
              ],
              keyConcepts: ['Ekstremum', 'Optimizasyon', 'Hız', 'İvme'],
            },
          ],
          totalTime: 35,
          difficulty: 'medium' as const,
          prerequisites: ['Limit', 'Fonksiyonlar', 'Grafik Çizimi'],
          learningObjectives: [
            'Türev kavramının geometrik anlamını anlamak',
            'Temel türev kurallarını uygulayabilmek',
            'Türevin gerçek hayat problemlerinde kullanımını öğrenmek',
          ],
        };

      case 'integral':
        return {
          topic,
          subject,
          steps: [
            {
              id: 'intro',
              title: 'İntegral Kavramına Giriş',
              content: 'İntegral, türevin tersi olan matematiksel işlemdir. Bir fonksiyonun belirli bir aralıktaki toplam değişimini ölçer.',
              examples: [
                'Bir cismin aldığı yol, hız fonksiyonunun integralidir',
                'Bir eğrinin altındaki alan, fonksiyonun integrali ile hesaplanır',
                'İş, kuvvet fonksiyonunun integralidir',
              ],
              tips: [
                'İntegral geometrik olarak alan anlamına gelir',
                'Türev kurallarının tersini düşünün',
                'Sabit terimi unutmayın',
              ],
              difficulty: 'medium',
              estimatedTime: 10,
              formulas: ['∫f(x)dx = F(x) + C'],
              keyConcepts: ['Alan', 'Antitürev', 'Belirsiz İntegral'],
            },
            {
              id: 'methods',
              title: 'İntegral Alma Yöntemleri',
              content: 'Karmaşık fonksiyonların integralini almak için kullanılan temel yöntemleri öğrenelim.',
              examples: [
                'Değişken değiştirme yöntemi',
                'Kısmi integral yöntemi',
                'Basit kesirlere ayırma',
                'Trigonometrik dönüşümler',
              ],
              tips: [
                'Uygun yöntemi seçmek için fonksiyonu analiz edin',
                'Değişken değiştirmede dx\'i unutmayın',
                'Kısmi integralde u ve dv seçimine dikkat edin',
              ],
              difficulty: 'hard',
              estimatedTime: 15,
              formulas: [
                'Değişken değiştirme: ∫f(g(x))g\'(x)dx = ∫f(u)du',
                'Kısmi integral: ∫udv = uv - ∫vdu',
              ],
              keyConcepts: ['Değişken Değiştirme', 'Kısmi İntegral', 'Basit Kesirler'],
            },
          ],
          totalTime: 40,
          difficulty: 'hard',
          prerequisites: ['Türev', 'Fonksiyonlar'],
          learningObjectives: [
            'İntegral kavramının geometrik anlamını anlamak',
            'Temel integral alma yöntemlerini uygulayabilmek',
            'Belirli integral ile alan hesaplayabilmek',
          ],
        };
    }
  }

  // Fizik konuları
  if (subject === 'Fizik') {
    switch (topic.toLowerCase()) {
      case 'kinematik':
        return {
          topic,
          subject,
          steps: [
            {
              id: 'intro',
              title: 'Hareketin Temelleri',
              content: 'Kinematik, hareketin matematiksel açıklamasını yapar. Konum, hız ve ivme kavramları ile hareketi tanımlar.',
              examples: [
                'Bir arabanın yolda ilerlemesi',
                'Bir topun düşmesi',
                'Bir uçağın uçması',
              ],
              tips: [
                'Hareketi vektörel olarak düşünün',
                'Referans noktasını belirleyin',
                'Zaman eksenini doğru kullanın',
              ],
              difficulty: 'easy',
              estimatedTime: 8,
              formulas: ['v = dx/dt', 'a = dv/dt'],
              keyConcepts: ['Konum', 'Hız', 'İvme', 'Zaman'],
            },
            {
              id: 'equations',
              title: 'Kinematik Denklemleri',
              content: 'Sabit ivmeli hareket için kullanılan temel kinematik denklemlerini öğrenelim.',
              examples: [
                'Serbest düşme hareketi',
                'Düzgün hızlanan hareket',
                'Fren yapan araba',
              ],
              tips: [
                'Hangi denklemi kullanacağınızı belirleyin',
                'Birimlere dikkat edin',
                'Vektör yönlerini unutmayın',
              ],
              difficulty: 'medium',
              estimatedTime: 12,
              formulas: [
                'v = v₀ + at',
                'x = x₀ + v₀t + ½at²',
                'v² = v₀² + 2a(x-x₀)',
              ],
              keyConcepts: ['Başlangıç Hızı', 'Son Hız', 'Yer Değiştirme', 'Zaman'],
            },
          ],
          totalTime: 30,
          difficulty: 'medium',
          prerequisites: ['Matematik', 'Vektörler'],
          learningObjectives: [
            'Hareket kavramlarını anlamak',
            'Kinematik denklemlerini uygulayabilmek',
            'Gerçek hayat problemlerini çözebilmek',
          ],
        };
    }
  }

  // Kimya konuları
  if (subject === 'Kimya') {
    switch (topic.toLowerCase()) {
      case 'stokiyometri':
        return {
          topic,
          subject,
          steps: [
            {
              id: 'intro',
              title: 'Kimyasal Hesaplamalar',
              content: 'Stokiyometri, kimyasal reaksiyonlarda madde miktarlarının hesaplanmasını sağlar. Mol kavramı temel birimdir.',
              examples: [
                '2H₂ + O₂ → 2H₂O reaksiyonunda su oluşumu',
                'Asit-baz nötrleşme reaksiyonları',
                'Yanma reaksiyonları',
              ],
              tips: [
                'Kimyasal dengeyi doğru yazın',
                'Mol-mol oranlarını kullanın',
                'Birim dönüşümlerine dikkat edin',
              ],
              difficulty: 'medium',
              estimatedTime: 10,
              formulas: ['n = m/M', 'n = V/Vm'],
              keyConcepts: ['Mol', 'Kütle', 'Hacim', 'Avogadro Sayısı'],
            },
            {
              id: 'calculations',
              title: 'Stokiyometrik Hesaplamalar',
              content: 'Kimyasal reaksiyonlarda madde miktarlarını hesaplama yöntemlerini öğrenelim.',
              examples: [
                'Sınırlayıcı reaktif hesaplamaları',
                'Verim hesaplamaları',
                'Konsantrasyon hesaplamaları',
              ],
              tips: [
                'Reaktiflerin mol sayılarını karşılaştırın',
                'Sınırlayıcı reaktifi belirleyin',
                'Teorik ve gerçek verimi ayırt edin',
              ],
              difficulty: 'hard',
              estimatedTime: 15,
              formulas: [
                'Verim = (Gerçek Verim / Teorik Verim) × 100',
                'Konsantrasyon = n/V',
              ],
              keyConcepts: ['Sınırlayıcı Reaktif', 'Verim', 'Konsantrasyon'],
            },
          ],
          totalTime: 35,
          difficulty: 'hard',
          prerequisites: ['Mol Kavramı', 'Kimyasal Denklemler'],
          learningObjectives: [
            'Stokiyometrik hesaplamaları yapabilmek',
            'Sınırlayıcı reaktif kavramını anlamak',
            'Verim hesaplamalarını öğrenmek',
          ],
        };
    }
  }

  // Genel fallback
  return generateDemoTopicData(topic, subject);
};

export const getTopicData = (topic: string, subject: string): TopicData => generateTopicData(topic, subject);

export const getAvailableTopics = () =>
  // Topic-explainer için her zaman gerçek verileri kullan (demo mode'u görmezden gel)

  // Gerçek modda daha fazla konu
   [
    // Matematik
    { name: 'Türev', subject: 'Matematik', difficulty: 'medium', estimatedTime: 35 },
    { name: 'İntegral', subject: 'Matematik', difficulty: 'hard', estimatedTime: 40 },
    { name: 'Limit', subject: 'Matematik', difficulty: 'easy', estimatedTime: 20 },
    { name: 'Fonksiyonlar', subject: 'Matematik', difficulty: 'medium', estimatedTime: 25 },

    // Fizik
    { name: 'Kinematik', subject: 'Fizik', difficulty: 'easy', estimatedTime: 30 },
    { name: 'Dinamik', subject: 'Fizik', difficulty: 'medium', estimatedTime: 35 },
    { name: 'Elektrik', subject: 'Fizik', difficulty: 'hard', estimatedTime: 40 },
    { name: 'Manyetizma', subject: 'Fizik', difficulty: 'hard', estimatedTime: 35 },

    // Kimya
    { name: 'Stokiyometri', subject: 'Kimya', difficulty: 'hard', estimatedTime: 35 },
    { name: 'Asit-Baz', subject: 'Kimya', difficulty: 'medium', estimatedTime: 30 },
    { name: 'Organik Kimya', subject: 'Kimya', difficulty: 'hard', estimatedTime: 45 },
    { name: 'Elektrokimya', subject: 'Kimya', difficulty: 'hard', estimatedTime: 40 },
  ]
;
