# 🏗️ AkılHane - Kapsamlı Proje Analizi

## 📋 İçindekiler
1. [Genel Mimari Yapı](#1--genel-mimari-yapı)
2. [Klasör Yapısı ve Amaçları](#2--klasör-yapısı-ve-amaçları)
3. [Ana Bileşenlerin İletişimi](#3--ana-bileşenlerin-iletişimi)
4. [Kod Kalitesi Analizi](#4--kod-kalitesi-analizi)
5. [Güvenlik ve Performans](#5--güvenlik-ve-performans)
6. [Test Yapısı](#6--test-yapısı)
7. [Refactoring Önerileri](#7--refactoring-önerileri)
8. [Teknik Dokümantasyon Özeti](#8--teknik-dokümantasyon-özeti)

## 1. 📐 Genel Mimari Yapı

### **Teknoloji Yığını:**
- **Frontend:** Next.js 15.3.3 (React 18.3.1) + TypeScript
- **Styling:** Tailwind CSS + Radix UI + Framer Motion
- **Backend:** Next.js API Routes + Server Actions
- **Veritabanı:** PostgreSQL (Supabase) + Drizzle ORM
- **AI Entegrasyonu:** Google Genkit + Gemini AI
- **Auth:** Supabase Auth
- **Storage:** Cloudinary (avatar yönetimi)
- **PWA:** next-pwa

### **Katmanlar:**

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components + Next.js Pages + Tailwind CSS)      │
├─────────────────────────────────────────────────────────┤
│                    Business Logic Layer                  │
│     (Services + API Routes + Server Actions)            │
├─────────────────────────────────────────────────────────┤
│                      AI Layer                           │
│        (Genkit Flows + Google Gemini)                   │
├─────────────────────────────────────────────────────────┤
│                   Data Access Layer                      │
│      (Drizzle ORM + Repository Pattern)                 │
├─────────────────────────────────────────────────────────┤
│                    Database Layer                        │
│         (PostgreSQL via Supabase)                       │
└─────────────────────────────────────────────────────────┘
```

## 2. 📁 Klasör Yapısı ve Amaçları

### **`/src/app/` - Next.js App Router**
- **Sayfa Routes:** Her klasör bir route'u temsil eder
  - `dashboard/` - Ana kontrol paneli
  - `quiz/` - Test çözme modülü
  - `flashcard/` - Flashcard öğrenme sistemi
  - `ai-chat/` - AI sohbet arayüzü
  - `subject-manager/` - Ders yönetimi
  - `question-manager/` - Soru yönetimi
  - `profile/` - Kullanıcı profili
  - `settings/` - Ayarlar
  - `auth/` - Kimlik doğrulama sayfaları

### **`/src/ai/` - AI Entegrasyonu**
- `flows/` - Genkit AI akışları
  - `ai-tutor.ts` - AI öğretmen asistanı
  - `ai-chat.ts` - Sohbet sistemi
  - `flashcard-recommendation.ts` - Kişiselleştirilmiş kart önerileri
  - `personalize-question-difficulty.ts` - Zorluk seviyesi kişiselleştirme

### **`/src/components/` - React Bileşenleri**
- `ui/` - Temel UI bileşenleri (Button, Card, Dialog vb.)
- `ai/` - AI özellikli bileşenler
- Ana bileşenler (Quiz, Dashboard, FlashCard vb.)

### **`/src/lib/` - Yardımcı Kütüphaneler**
- `database/` - Veritabanı yapılandırması
  - `schema.ts` - Drizzle ORM şemaları
  - `connection.ts` - DB bağlantı yönetimi
  - `repositories/` - Repository pattern implementasyonu

### **`/src/services/` - İş Mantığı Servisleri**
- `performance-service.ts` - Performans analizi
- `supabase-service.ts` - Supabase entegrasyonu
- `localStorage-service.ts` - Local storage yönetimi

### **`/src/hooks/` - Custom React Hooks**
- `useAuth.ts` - Kimlik doğrulama hook'u
- `useLocalAuth.ts` - Local auth yönetimi
- `use-toast.ts` - Bildirim sistemi

## 3. 🔄 Ana Bileşenlerin İletişimi

### **API Endpoint'leri:**
```typescript
// Quiz API
POST /api/quiz - Test oluştur
GET  /api/quiz - Test sonuçlarını getir

// Subjects API  
GET  /api/subjects - Dersleri listele
POST /api/subjects - Yeni ders ekle
PUT  /api/subjects/[id] - Ders güncelle
DELETE /api/subjects/[id] - Ders sil

// Questions API
GET  /api/questions - Soruları listele
POST /api/questions - Yeni soru ekle
PUT  /api/questions/[id] - Soru güncelle
DELETE /api/questions/[id] - Soru sil

// AI Chat API
POST /api/ai-chat/sessions - Yeni oturum başlat
POST /api/ai-chat/messages - Mesaj gönder
GET  /api/ai-chat/history - Sohbet geçmişi

// Analytics API
GET  /api/analytics - Performans analizleri

// Avatar API
POST /api/upload-avatar - Avatar yükle
DELETE /api/delete-avatar - Avatar sil
```

### **Veri Akışı:**
```
User Action → React Component → API Route/Server Action
                                        ↓
                               Service Layer
                                        ↓
                               Repository Layer
                                        ↓
                                  Database
```

### **AI Flow Örneği:**
```typescript
// AI Tutor Flow
1. Kullanıcı soruya yardım ister
2. Component → AI Tutor API çağrısı
3. Genkit Flow → Google Gemini
4. Yapılandırılmış yanıt → UI'da gösterim
```

## 4. 📊 Kod Kalitesi Analizi

### **✅ Güçlü Yönler:**
1. **TypeScript Strict Mode:** Tam tip güvenliği
2. **Repository Pattern:** Temiz veri erişim katmanı
3. **Modüler Yapı:** İyi organize edilmiş klasör yapısı
4. **AI Entegrasyonu:** Genkit ile yapılandırılmış AI flow'ları
5. **Modern UI:** Radix UI + Tailwind CSS kombinasyonu
6. **PWA Desteği:** Offline çalışma kabiliyeti
7. **Responsive Design:** Tüm cihazlarda uyumlu
8. **Gradient Design Language:** Tutarlı görsel dil

### **⚠️ İyileştirme Alanları:**
1. **Test Eksikliği:** Hiç test dosyası bulunmuyor
2. **Error Boundary Eksikliği:** Global hata yakalama yok
3. **TypeScript Build Hataları:** `ignoreBuildErrors: true` kullanılmış
4. **ESLint Devre Dışı:** `ignoreDuringBuilds: true`
5. **Çevre Değişkeni Validasyonu:** .env validasyon eksik
6. **API Rate Limiting:** DDoS koruması yok
7. **Logging Sistemi:** Merkezi log yönetimi eksik

## 5. 🔒 Güvenlik ve Performans

### **Güvenlik:**
- ✅ Supabase RLS (Row Level Security) kullanımı
- ✅ TypeScript tip güvenliği
- ✅ Cloudinary ile güvenli dosya yükleme
- ✅ JWT token yönetimi
- ✅ HTTPS zorunluluğu
- ⚠️ API rate limiting eksik
- ⚠️ Input sanitization bazı yerlerde eksik
- ⚠️ CSRF koruması eksik
- ⚠️ Security headers eksik

### **Performans:**
- ✅ Next.js SSR/SSG optimizasyonları
- ✅ PWA ile offline destek
- ✅ Lazy loading bileşenler
- ✅ Image optimization (Next/Image)
- ✅ Code splitting
- ⚠️ Bundle size optimizasyonu yapılabilir
- ⚠️ Database query optimizasyonu gerekebilir
- ⚠️ Redis cache katmanı eklenebilir
- ⚠️ CDN entegrasyonu yapılabilir

## 6. 🧪 Test Yapısı

### **Mevcut Durum:** 
Test dosyası bulunmuyor ❌

### **Önerilen Test Stratejisi:**
```typescript
// Klasör yapısı
src/
  __tests__/
    unit/
      services/
        - performance-service.test.ts
        - supabase-service.test.ts
      hooks/
        - useAuth.test.ts
        - useLocalAuth.test.ts
      utils/
        - helpers.test.ts
    integration/
      api/
        - quiz.test.ts
        - subjects.test.ts
        - questions.test.ts
      database/
        - repositories.test.ts
    e2e/
      user-flows/
        - quiz-flow.test.ts
        - auth-flow.test.ts
```

### **Önerilen Test Araçları:**
- **Unit Tests:** Jest + React Testing Library
- **Integration Tests:** Jest + Supertest
- **E2E Tests:** Playwright veya Cypress
- **AI Flow Tests:** Genkit Test Utils

## 7. 🔧 Refactoring Önerileri

### **1. Kod Tekrarları:**
```typescript
// Problem: Tekrarlanan Supabase auth kontrolü
const { data: { user } } = await supabase.auth.getUser();

// Çözüm: Custom hook
function useSupabaseUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Merkezi user yönetimi
  }, []);
  
  return { user, loading };
}
```

### **2. Karmaşık Fonksiyonlar:**
```typescript
// Problem: Quiz bileşenindeki handleAnswer fonksiyonu çok uzun

// Çözüm: Parçalara ayırma
const answerHandlers = {
  validate: validateAnswer,
  updateScore: updateScore,
  saveProgress: saveProgress,
  moveNext: moveToNext
};

function handleAnswer(answer: string) {
  Object.values(answerHandlers).forEach(handler => handler(answer));
}
```

### **3. API Response Standardizasyonu:**
```typescript
// Önerilen response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Kullanım
export function createApiResponse<T>(
  data?: T, 
  error?: any
): ApiResponse<T> {
  return {
    success: !error,
    data,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId: generateRequestId()
    }
  };
}
```

### **4. Error Handling Standardizasyonu:**
```typescript
// Global error handler
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
  }
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Implementation
}
```

### **5. Environment Variables Validation:**
```typescript
// env.schema.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
});

export function validateEnv() {
  return envSchema.parse(process.env);
}
```

## 8. 📚 Teknik Dokümantasyon Özeti

### **Hızlı Başlangıç:**
```bash
# 1. Repoyu klonla
git clone https://github.com/melihcanndemir/akilhane.git
cd akilhane

# 2. Bağımlılıkları yükle
npm install

# 3. Çevre değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle

# 4. Veritabanını hazırla
npm run db:generate
npm run db:migrate
npm run db:init

# 5. Geliştirme sunucusunu başlat
npm run dev

# 6. Genkit UI (opsiyonel)
npm run genkit:dev
```

### **Temel Veri Modelleri:**

#### **Users Table:**
- `id`: CUID2 primary key
- `email`: Unique email
- `name`: Kullanıcı adı
- `createdAt`, `updatedAt`: Timestamps

#### **Subjects Table:**
- `id`: CUID2 primary key
- `name`: Ders adı
- `description`: Açıklama
- `category`: Kategori
- `difficulty`: Zorluk seviyesi
- `questionCount`: Soru sayısı
- `isActive`: Aktiflik durumu

#### **Questions Table:**
- `id`: CUID2 primary key
- `subjectId`: Foreign key to subjects
- `type`: Soru tipi (multiple-choice, true-false, vb.)
- `text`: Soru metni
- `options`: JSON array of options
- `correctAnswer`: Doğru cevap
- `explanation`: Açıklama

#### **Quiz Results Table:**
- `id`: CUID2 primary key
- `userId`: Foreign key to users
- `subject`: Konu
- `score`: Puan
- `totalQuestions`: Toplam soru
- `timeSpent`: Harcanan süre
- `weakTopics`: Zayıf konular (JSON)

### **Kritik Bağımlılıklar:**
```json
{
  "next": "15.3.3",
  "react": "18.3.1",
  "@supabase/supabase-js": "2.52.1",
  "drizzle-orm": "0.37.0",
  "genkit": "1.15.5",
  "@genkit-ai/googleai": "1.15.5",
  "@radix-ui/react-*": "latest",
  "tailwindcss": "3.4.1"
}
```

### **Deployment Checklist:**
- [ ] Supabase projesi oluştur
- [ ] Cloudinary hesabı aç
- [ ] Google AI API key al
- [ ] Environment variables ayarla
- [ ] Database migration'ları çalıştır
- [ ] Vercel/Railway'e deploy et
- [ ] Custom domain ayarla
- [ ] SSL sertifikası aktif et
- [ ] Monitoring kurulumu yap
- [ ] Backup stratejisi belirle

### **Monitoring ve Maintenance:**
- **Error Tracking:** Sentry entegrasyonu önerilir
- **Analytics:** Google Analytics veya Plausible
- **Performance:** Lighthouse CI entegrasyonu
- **Uptime:** UptimeRobot veya Pingdom
- **Logs:** Vercel Logs veya custom solution

Bu proje, modern web development best practice'lerini takip eden, AI destekli bir eğitim platformudur. Kod kalitesi yüksek, mimari sağlam ancak test coverage ve bazı güvenlik optimizasyonları eklenmelidir.