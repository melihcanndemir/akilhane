const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 AI Özellikler Test Ediliyor...\n');

// 1. Environment variables kontrolü
console.log('1. Environment Variables Kontrolü:');
try {
  require('dotenv').config();
  const requiredVars = ['GEMINI_API_KEY', 'GOOGLE_GENAI_API_KEY', 'GOOGLE_AI_API_KEY'];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Mevcut`);
    } else {
      console.log(`❌ ${varName}: Eksik`);
    }
  });
} catch (error) {
  console.log('❌ .env dosyası bulunamadı');
}

// 2. AI flow dosyalarının varlığı
console.log('\n2. AI Flow Dosyaları Kontrolü:');
const aiFiles = [
  'src/ai/flows/question-generator.ts',
  'src/ai/genkit.ts',
  'src/types/question-manager.ts'
];

aiFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Mevcut`);
  } else {
    console.log(`❌ ${file}: Eksik`);
  }
});

// 3. TypeScript compilation testi
console.log('\n3. TypeScript Compilation Testi:');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation başarılı');
} catch (error) {
  console.log('❌ TypeScript compilation hatası');
}

// 4. Build testi
console.log('\n4. Build Testi:');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build başarılı');
} catch (error) {
  console.log('❌ Build hatası');
}

console.log('\n🎯 Test Tamamlandı!');
console.log('\n📝 Sonraki Adımlar:');
console.log('1. Tarayıcıda localhost:3000/question-manager sayfasını aç');
console.log('2. AI soru üretimi test et');
console.log('3. Console\'da hata mesajları kontrol et');
console.log('4. Network tab\'da API çağrılarını izle');
