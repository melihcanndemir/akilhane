import type { Question } from './types';

export const questions: Question[] = [
  // Finansal Tablo Analizi
  {
    id: 'fsa1',
    subject: 'Finansal Tablo Analizi',
    type: 'multiple-choice',
    difficulty: 'Easy',
    text: 'Cari Oran neyi ölçer?',
    options: [
      { text: 'Kârlılığı', isCorrect: false },
      { text: 'Likiditeyi', isCorrect: true },
      { text: 'Borçluluğu', isCorrect: false },
      { text: 'Verimliliği', isCorrect: false },
    ],
    explanation: 'Cari Oran (Dönen Varlıklar / Kısa Vadeli Yükümlülükler), bir şirketin kısa vadeli yükümlülüklerini ödeme yeteneğini ölçen bir likidite oranıdır.',
  },
  {
    id: 'fsa2',
    subject: 'Finansal Tablo Analizi',
    type: 'calculation',
    difficulty: 'Medium',
    text: 'Bir şirketin Dönen Varlıkları 500.000 TL ve Kısa Vadeli Yükümlülükleri 250.000 TL ise Cari Oranı kaçtır?',
    options: [
        { text: '2.0', isCorrect: true },
        { text: '0.5', isCorrect: false },
        { text: '2.5', isCorrect: false },
        { text: '1.0', isCorrect: false },
    ],
    explanation: 'Cari Oran = Dönen Varlıklar / Kısa Vadeli Yükümlülükler = 500.000 TL / 250.000 TL = 2.0.',
    formula: 'Cari Oran = Dönen Varlıklar / Kısa Vadeli Yükümlülükler',
  },
  {
    id: 'fsa3',
    subject: 'Finansal Tablo Analizi',
    type: 'true-false',
    difficulty: 'Easy',
    text: 'Öz Sermaye Kârlılığı (ROE), bir şirketin finansal kaldıracının bir ölçüsüdür.',
    options: [
        { text: 'Doğru', isCorrect: false },
        { text: 'Yanlış', isCorrect: true },
    ],
    explanation: 'Yanlış. Öz Sermaye Kârlılığı (ROE), hissedarların öz sermayesine göre bir şirketin kârlılığını ölçen bir kârlılık oranıdır.',
  },
   {
    id: 'fsa4',
    subject: 'Finansal Tablo Analizi',
    type: 'multiple-choice',
    difficulty: 'Hard',
    text: 'Aşağıdakilerden hangisi bir likidite oranı olarak kabul edilmez?',
    options: [
      { text: 'Asit-Test Oranı', isCorrect: false },
      { text: 'Cari Oran', isCorrect: false },
      { text: 'Nakit Oranı', isCorrect: false },
      { text: 'Borç/Öz Sermaye Oranı', isCorrect: true },
    ],
    explanation: 'Borç/Öz Sermaye Oranı bir likidite oranı değil, bir borç (veya kaldıraç) oranıdır. Bir şirketin finansal kaldıracını ölçer.',
  },

  // Karar Destek Sistemleri
  {
    id: 'dss1',
    subject: 'Karar Destek Sistemleri',
    type: 'multiple-choice',
    difficulty: 'Easy',
    text: 'Bir Karar Destek Sisteminin (KDS) temel amacı nedir?',
    options: [
      { text: 'Tüm karar verme süreçlerini otomatikleştirmek', isCorrect: false },
      { text: 'Yöneticilerin yerini almak', isCorrect: false },
      { text: 'Bilgi sağlayarak insanların karar vermesine yardımcı olmak', isCorrect: true },
      { text: 'Günlük işlemleri işlemek', isCorrect: false },
    ],
    explanation: 'Bir KDS\'nin temel amacı, karar verme sürecini tamamen otomatikleştirmek değil, insanlara yardımcı olmaktır. Veri, modeller ve analiz araçları sağlar.',
  },
  {
    id: 'dss2',
    subject: 'Karar Destek Sistemleri',
    type: 'true-false',
    difficulty: 'Medium',
    text: 'Doğrusal programlama, gereksinimleri doğrusal ilişkilerle temsil edilen bir matematiksel modelde en iyi sonucu bulmak için kullanılır.',
    options: [
        { text: 'Doğru', isCorrect: true },
        { text: 'Yanlış', isCorrect: false },
    ],
    explanation: 'Doğru. Doğrusal programlama, gereksinimleri doğrusal ilişkilerle temsil edilen bir matematiksel modelde en iyi sonucu (maksimum kâr veya en düşük maliyet gibi) elde etme yöntemidir.',
  },
  {
    id: 'dss3',
    subject: 'Karar Destek Sistemleri',
    type: 'multiple-choice',
    difficulty: 'Hard',
    text: 'Karar ağacı algoritmalarında bir veri setinin düzensizliğini veya rastgeleliğini ölçmek için hangi kavram kullanılır?',
    options: [
      { text: 'Bilgi Kazancı', isCorrect: false },
      { text: 'Entropi', isCorrect: true },
      { text: 'Monte Carlo Simülasyonu', isCorrect: false },
      { text: 'Ki-kare', isCorrect: false },
    ],
    explanation: 'Entropi, bir veri setindeki belirsizlik veya rastgelelik miktarının bir ölçüsüdür. Karar ağaçları, veriyi nasıl böleceğine karar vermek için bunu kullanır.',
  },

  // Müşteri İlişkileri Yönetimi
  {
    id: 'crm1',
    subject: 'Müşteri İlişkileri Yönetimi',
    type: 'multiple-choice',
    difficulty: 'Easy',
    text: 'Hangi CRM türü, satış, pazarlama ve müşteri hizmetleri gibi müşteriye dönük süreçlerin otomasyonuna odaklanır?',
    options: [
      { text: 'Analitik CRM', isCorrect: false },
      { text: 'Stratejik CRM', isCorrect: false },
      { text: 'İşbirlikçi CRM', isCorrect: false },
      { text: 'Operasyonel CRM', isCorrect: true },
    ],
    explanation: 'Operasyonel CRM, satış gücü otomasyonu, pazarlama otomasyonu ve hizmet otomasyonu gibi müşteriye dönük süreçlerin otomasyonu ile ilgilidir.',
  },
   {
    id: 'crm2',
    subject: 'Müşteri İlişkileri Yönetimi',
    type: 'true-false',
    difficulty: 'Medium',
    text: 'Demografik segmentasyon, müşterileri tutumlarına, değerlerine ve ilgi alanlarına göre böler.',
    options: [
        { text: 'Doğru', isCorrect: false },
        { text: 'Yanlış', isCorrect: true },
    ],
    explanation: 'Yanlış. Demografik segmentasyon, müşterileri yaş, cinsiyet, gelir ve meslek gibi değişkenlere göre böler. Psikografik segmentasyon ise tutum, değer ve ilgi alanlarına dayanır.',
  },
  {
    id: 'crm3',
    subject: 'Müşteri İlişkileri Yönetimi',
    type: 'multiple-choice',
    difficulty: 'Hard',
    text: 'Bir markayı alışkanlıktan dolayı sürekli satın alan ancak ona çok az bağlılık hisseden bir müşteri, ne tür bir sadakat göstermektedir?',
    options: [
      { text: 'Duygusal Sadakat', isCorrect: false },
      { text: 'Davranışsal Sadakat', isCorrect: true },
      { text: 'Bilişsel Sadakat', isCorrect: false },
      { text: 'Stratejik Sadakat', isCorrect: false },
    ],
    explanation: 'Davranışsal sadakat, markaya güçlü bir duygusal bağdan ziyade alışkanlık veya kolaylık tarafından yönlendirilebilen tekrarlı satın alma eylemini ifade eder.',
  },
];
