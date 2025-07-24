const { db } = require('./src/lib/database/connection');
const { questions } = require('./src/lib/database/schema');

async function addSampleQuestions() {
  try {
    console.log('Örnek sorular ekleniyor...');
    
    const sampleQuestions = [
      {
        id: `question_${Date.now()}_1`,
        subjectId: 'subject_1753304061010_ad031bc6q',
        subject: 'Finansal Tablolar Analizi',
        topic: 'Bilanço Analizi',
        type: 'Çoktan Seçmeli',
        difficulty: 'Orta',
        text: 'Cari oran hesaplanırken aşağıdakilerden hangisi kullanılır?',
        options: JSON.stringify([
          { text: 'Dönen varlıklar / Kısa vadeli borçlar', isCorrect: true },
          { text: 'Duran varlıklar / Uzun vadeli borçlar', isCorrect: false },
          { text: 'Toplam varlıklar / Toplam borçlar', isCorrect: false },
          { text: 'Özsermaye / Toplam varlıklar', isCorrect: false }
        ]),
        correctAnswer: 'Dönen varlıklar / Kısa vadeli borçlar',
        explanation: 'Cari oran, dönen varlıkların kısa vadeli borçlara bölünmesiyle hesaplanır. Bu oran, işletmenin kısa vadeli borçlarını ödeme kabiliyetini gösterir.',
        formula: 'Cari Oran = Dönen Varlıklar / Kısa Vadeli Borçlar',
        isActive: true
      },
      {
        id: `question_${Date.now()}_2`,
        subjectId: 'subject_1753304061010_ad031bc6q',
        subject: 'Finansal Tablolar Analizi',
        topic: 'Gelir Tablosu Analizi',
        type: 'Çoktan Seçmeli',
        difficulty: 'Kolay',
        text: 'Net kar marjı aşağıdakilerden hangisi ile hesaplanır?',
        options: JSON.stringify([
          { text: 'Net Kar / Satış Gelirleri', isCorrect: true },
          { text: 'Brüt Kar / Satış Gelirleri', isCorrect: false },
          { text: 'Faaliyet Karı / Toplam Varlıklar', isCorrect: false },
          { text: 'Net Kar / Toplam Varlıklar', isCorrect: false }
        ]),
        correctAnswer: 'Net Kar / Satış Gelirleri',
        explanation: 'Net kar marjı, net karın satış gelirlerine bölünmesiyle hesaplanır ve işletmenin satış başına ne kadar kar elde ettiğini gösterir.',
        formula: 'Net Kar Marjı = Net Kar / Satış Gelirleri',
        isActive: true
      },
      {
        id: `question_${Date.now()}_3`,
        subjectId: 'subject_1753304061010_ad031bc6q',
        subject: 'Finansal Tablolar Analizi',
        topic: 'Nakit Akış Analizi',
        type: 'Çoktan Seçmeli',
        difficulty: 'Zor',
        text: 'Faaliyet nakit akışı pozitif olduğunda bu ne anlama gelir?',
        options: JSON.stringify([
          { text: 'İşletme faaliyetlerinden nakit üretiyor', isCorrect: true },
          { text: 'İşletme zarar ediyor', isCorrect: false },
          { text: 'İşletme borç alıyor', isCorrect: false },
          { text: 'İşletme varlık satıyor', isCorrect: false }
        ]),
        correctAnswer: 'İşletme faaliyetlerinden nakit üretiyor',
        explanation: 'Pozitif faaliyet nakit akışı, işletmenin normal faaliyetlerinden nakit ürettiğini ve sürdürülebilir bir iş modeline sahip olduğunu gösterir.',
        formula: '',
        isActive: true
      }
    ];

    for (const question of sampleQuestions) {
      await db.insert(questions).values(question);
      console.log(`✅ Soru eklendi: ${question.text.substring(0, 50)}...`);
    }

    console.log('🎉 Tüm örnek sorular başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

addSampleQuestions(); 