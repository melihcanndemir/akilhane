# AkılHane - AI Destekli Eğitim Platformu

Modern teknolojiler kullanılarak geliştirilmiş, AI destekli kapsamlı eğitim platformu. Yerli ve milli eğitim teknolojisi çözümü.

## 🚀 Özellikler

- **AI Destekli Öğrenme**: Google AI (Gemini 2.0) entegrasyonu
- **Kişiselleştirilmiş Zorluk**: Performansa göre otomatik zorluk ayarlama
- **Performans Analizi**: Detaylı istatistikler ve grafikler
- **SQLite Veritabanı**: Yerel veri saklama ve yönetimi
- **Modern UI/UX**: Tailwind CSS ve Radix UI
- **Responsive Design**: Tüm cihazlarda uyumlu
- **PWA Desteği**: Progressive Web App özellikleri
- **Çevrimdışı Çalışma**: İnternet olmadan da kullanım
- **Sesli Asistan**: Web Speech API entegrasyonu
- **Markdown Desteği**: Zengin içerik formatı

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: SQLite (better-sqlite3), Drizzle ORM
- **AI**: Google AI (Gemini 2.0), Genkit Framework
- **Charts**: Recharts
- **Animations**: Framer Motion
- **PWA**: next-pwa, Service Worker
- **Markdown**: React Markdown, Remark GFM

## 🤖 AI Araçları ve Geliştirme Süreci

### 🧠 Kullanılan AI Modelleri
- **Google Gemini 2.5 Pro**: Ana AI modeli, eğitim içeriği üretimi
- **OpenAI ChatGPT 4.1**: Kod geliştirme ve problem çözme
- **Anthropic Claude 4.0 Sonnet**: Karmaşık algoritma ve mimari tasarım

### 🛠️ Geliştirme Araçları
- **Cursor AI IDE**: AI destekli kod geliştirme ortamı
- **Firebase Studio**: Veritabanı yönetimi ve analitik
- **GitHub Copilot**: Kod tamamlama ve öneriler

### 🔧 AI Entegrasyonu
- **Genkit Framework**: Google AI entegrasyonu
- **Web Speech API**: Sesli asistan özellikleri
- **Markdown Processing**: AI çıktılarının zengin formatlanması

## 📱 PWA Özellikleri

### ✅ Mevcut Özellikler
- **Ana Ekrana Ekleme**: Mobil ve masaüstü cihazlarda kurulum
- **Çevrimdışı Çalışma**: İnternet bağlantısı olmadan da kullanım
- **Hızlı Yükleme**: Cache stratejileri ile optimize edilmiş performans
- **Push Bildirimleri**: Gerçek zamanlı bildirimler
- **Responsive Design**: Tüm cihaz boyutlarında uyumlu

### 🔧 Teknik Detaylar
- **Service Worker**: Network-first cache stratejisi
- **Manifest**: Tam PWA manifest dosyası
- **Install Prompt**: Akıllı kurulum önerisi
- **Offline Page**: Çevrimdışı durumda özel sayfa

## 📦 Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Veritabanını başlatın:**
```bash
npm run db:generate
npm run db:init
```

3. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

4. **Tarayıcıda açın:**
```
http://localhost:9002
```

## 📱 PWA Kurulumu

### Mobil Cihazlar
1. Tarayıcıda `http://localhost:9002` adresini açın
2. "Ana Ekrana Ekle" seçeneğini seçin
3. Uygulama ana ekranınıza eklenecek

### Masaüstü
1. Chrome/Edge'de siteyi açın
2. Adres çubuğundaki kurulum ikonuna tıklayın
3. "Kur" butonuna tıklayın

## 🗄️ Veritabanı İşlemleri

### Migration Oluşturma
```bash
npm run db:generate
```

### Migration Uygulama
```bash
npm run db:migrate
```

### Veritabanı Studio
```bash
npm run db:studio
```

### Veritabanı Başlatma
```bash
npm run db:init
```

## 📊 Veritabanı Şeması

### Tablolar:
- **users**: Kullanıcı bilgileri
- **subjects**: Ders konuları
- **questions**: Soru bankası
- **quiz_results**: Quiz sonuçları
- **performance_analytics**: Performans analizleri
- **ai_recommendations**: AI önerileri
- **flashcard_progress**: Flashcard ilerleme

## 🔧 API Endpoints

### Quiz İşlemleri
- `POST /api/quiz` - Quiz sonucu kaydetme
- `GET /api/quiz?userId={id}&subject={subject}` - Quiz sonuçlarını getirme

### AI İşlemleri
- `POST /api/ai-tutor` - AI Tutor yardımı
- `POST /api/ai-chat` - AI Chat konuşması

### Veritabanı İşlemleri
- `POST /api/init-db` - Veritabanı başlatma
- `GET /api/init-db` - Veritabanı sağlık kontrolü

## 🎯 Kullanım

1. **Ana Sayfa**: Ders seçimi ve genel bakış
2. **Quiz**: İnteraktif soru-cevap sistemi
3. **Flashcard**: Konu tekrarı için kartlar
4. **AI Chat**: Yapay zeka ile konuşma
5. **AI Tutor**: Kişiselleştirilmiş öğrenme yardımı
6. **Analizler**: Performans grafikleri ve istatistikler

## 🎤 Sesli Asistan Özellikleri

### Sesli Komutlar
- **"Soru oku"** - Mevcut soruyu sesli okur
- **"Cevap oku"** - Doğru cevabı sesli okur
- **"AI oku"** - AI Tutor çıktısını sesli okur
- **"Sonraki"** - Sonraki soruya geçer
- **"Önceki"** - Önceki soruya geçer
- **"Karıştır"** - Soruları karıştırır
- **"Açıkla"** - AI açıklama ister

### Özellikler
- **Türkçe Ses Tanıma**: Web Speech API
- **Türkçe Ses Sentezi**: Doğal dil akışı
- **Markdown Temizleme**: Sesli okuma için optimize
- **Çoklu Mod**: Asistan ve yazma modu

## 🔒 Güvenlik

- TypeScript strict mode
- Input validation
- SQL injection koruması (Drizzle ORM)
- Error handling
- AI rate limiting

## 📈 Performans

- WAL mode (Write-Ahead Logging)
- Database indexing
- Optimized queries
- Caching strategies
- PWA cache optimization
- AI response caching

## 🚀 Production

```bash
npm run build
npm start
```

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Push yapın
5. Pull Request açın

---

**Geliştirici**: AkılHane - Yerli ve Milli AI Destekli Eğitim Teknolojisi Platformu

**AI Destekli Geliştirme**: Bu proje modern AI araçları kullanılarak geliştirilmiştir.
