# 🧠 AkılHane Checker - GUI Version

PyQt5 ile geliştirilmiş glassmorphism tasarımlı, gelişmiş test özellikleri ve dark/light mode destekli GUI versiyonu.

## 🚀 Özellikler

### 🎨 **Glassmorphism Tasarım**
- Modern cam efekti
- Şeffaf arka planlar
- Blur efektleri
- Gradient renkler

### 🌙 **Dark/Light Mode**
- Otomatik tema değiştirme
- Smooth geçişler
- Kullanıcı dostu arayüz

### 🔧 **Gelişmiş Test Özellikleri**
- Lint Test
- TypeScript Test
- Build Test
- Tüm Testler (sıralı çalıştırma)
- Gerçek zamanlı sonuçlar

### 📊 **Detaylı Raporlama**
- Test sonuçları tablosu
- Süre ölçümü
- Detaylı log
- Renkli durum göstergeleri

## 📦 Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
pip install -r requirements-gui.txt
```

### 2. GUI'yi Çalıştırın
```bash
python akilhane-checker-gui.py
```

## 🎯 Kullanım

### **Test Çalıştırma**
1. **Tek Test:** İlgili butona tıklayın
   - 🔍 Lint Test
   - 📝 TypeScript Test
   - 🏗️ Build Test

2. **Tüm Testler:** 🚀 Tüm Testler butonuna tıklayın
   - Sıralı çalıştırma
   - Otomatik sonuç güncelleme

3. **Temizleme:** 🗑️ Temizle butonuna tıklayın
   - Tüm sonuçları temizler
   - Butonları sıfırlar

### **Tema Değiştirme**
- 🌙 Dark Mode / ☀️ Light Mode butonuna tıklayın
- Otomatik tema değişimi

## 📊 Sonuçlar

### **Test Sonuçları Tablosu**
- **Test:** Test adı
- **Durum:** ✅ Başarılı / ❌ Hata / ⚠️ Uyarı
- **Süre:** Test süresi (saniye)
- **Zaman:** Test zamanı
- **Detay:** Test çıktısı

### **Log Paneli**
- Gerçek zamanlı log
- Renkli durum göstergeleri
- Detaylı hata mesajları

## 🎨 Tasarım Özellikleri

### **Glassmorphism Efektleri**
```css
background: rgba(255, 255, 255, 0.1);
border-radius: 15px;
border: 1px solid rgba(255, 255, 255, 0.2);
backdrop-filter: blur(10px);
```

### **Renk Paleti**
- **Primary:** #3b82f6 (Mavi)
- **Success:** #10b981 (Yeşil)
- **Warning:** #f59e0b (Turuncu)
- **Error:** #ef4444 (Kırmızı)

### **Buton Stilleri**
- Hover efektleri
- Pressed durumları
- Renkli durum göstergeleri

## 🔧 Teknik Detaylar

### **Thread Yapısı**
- Testler ayrı thread'lerde çalışır
- UI donmaz
- Gerçek zamanlı güncelleme

### **Timeout Yönetimi**
- Lint: 60 saniye
- TypeScript: 30 saniye
- Build: 120 saniye

### **Error Handling**
- Detaylı hata mesajları
- Timeout yönetimi
- Exception handling

## 🚀 Geliştirme

### **Yeni Test Ekleme**
1. `TestThread` sınıfına yeni test metodu ekleyin
2. `run()` metodunda test tipini kontrol edin
3. UI'da yeni buton ekleyin

### **Tema Özelleştirme**
1. `Colors` sınıfında renkleri değiştirin
2. `get_button_style()` metodunu güncelleyin
3. CSS stillerini özelleştirin

## 📝 Lisans

MIT License - AkılHane Project

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

---

**🧠 AkılHane Checker GUI - Modern Test Aracı**
