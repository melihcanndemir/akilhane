# AI Soru Oluşturma Servisi Kurulumu

Bu proje, Google'ın Gemini AI servisini kullanarak otomatik soru oluşturma özelliği sunar.

## Gereksinimler

1. **Google AI API Anahtarı**: Gemini API'ye erişim için gerekli
2. **Node.js**: Proje çalıştırma için gerekli

## Kurulum Adımları

### 1. Google AI API Anahtarı Alma

1. [Google AI Studio](https://aistudio.google.com/) adresine gidin
2. Google hesabınızla giriş yapın
3. API anahtarı oluşturun
4. Anahtarı güvenli bir yerde saklayın

### 2. Environment Variables Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun ve aşağıdaki değişkeni ekleyin:

```bash
# Google AI API anahtarı (aşağıdaki seçeneklerden birini kullanın)
GEMINI_API_KEY=your_api_key_here
# VEYA
GOOGLE_GENAI_API_KEY=your_api_key_here
# VEYA
GOOGLE_AI_API_KEY=your_api_key_here
```

### 3. Projeyi Çalıştırma

```bash
npm install
npm run dev
```

## Kullanım

1. **Soru Yöneticisi** sayfasına gidin
2. **"AI ile Soru Oluştur"** butonuna tıklayın
3. Formu doldurun:
   - Ders seçin
   - Konu belirtin
   - Soru tipini seçin
   - Zorluk seviyesini belirleyin
   - Soru sayısını belirleyin (maksimum 25)
   - İsteğe bağlı ek yönergeler ekleyin
4. **"AI ile Soru Oluştur"** butonuna tıklayın
5. Oluşturulan soruları inceleyin ve onaylayın

## Desteklenen Soru Tipleri

- **Çoktan Seçmeli**: 4 seçenekli klasik test soruları
- **Doğru/Yanlış**: Basit doğru-yanlış soruları
- **Hesaplama**: Matematiksel problem çözme soruları
- **Vaka Çalışması**: Gerçek hayat senaryoları

## Zorluk Seviyeleri

- **Kolay**: Temel hatırlama ve anlama
- **Orta**: Uygulama ve analiz
- **Zor**: Sentez ve değerlendirme

## Sorun Giderme

### API Anahtarı Hatası
```
AI Servisi Hatası: Google AI API anahtarı bulunamadı
```
**Çözüm**: `.env.local` dosyasında doğru API anahtarını ayarladığınızdan emin olun.

### Soru Oluşturma Hatası
```
AI soruları oluşturulurken bir hata oluştu
```
**Çözüm**: 
1. API anahtarınızın geçerli olduğundan emin olun
2. İnternet bağlantınızı kontrol edin
3. Daha az soru sayısı deneyin

## Güvenlik

- API anahtarınızı asla public repository'lerde paylaşmayın
- `.env.local` dosyasını `.gitignore`'a eklediğinizden emin olun
- API anahtarınızı düzenli olarak yenileyin

## Teknik Detaylar

- **AI Model**: Google Gemini 2.0 Flash
- **Dil Desteği**: Türkçe (varsayılan), İngilizce
- **Maksimum Soru Sayısı**: 25 (token limiti nedeniyle)
- **Kalite Kontrolü**: Otomatik kalite puanlama ve öneriler

## Katkıda Bulunma

AI servisini geliştirmek için:
1. `src/ai/flows/question-generator.ts` dosyasını inceleyin
2. Prompt'ları ve kalite kriterlerini iyileştirin
3. Yeni soru tipleri ekleyin
4. Test coverage'ı artırın
