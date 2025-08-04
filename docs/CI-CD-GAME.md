# 🎮 AkılHane CI/CD Game

## 🎯 Oyun Sistemi

AkılHane projesinde CI/CD süreçlerini eğlenceli hale getiren oyun sistemi!

## 🚀 Nasıl Çalışır?

### 📋 Missions (Görevler)

Her commit ve pull request'te otomatik olarak çalışan görevler:

#### 🎯 Mission 1: Lint Check
- **XP:** 100
- **Açıklama:** Kod kalitesi kontrolü
- **Komut:** `npm run lint`

#### 🔍 Mission 2: Type Check  
- **XP:** 150
- **Açıklama:** TypeScript tip güvenliği
- **Komut:** `npm run type-check`

#### 🏗️ Mission 3: Build Check
- **XP:** 200
- **Açıklama:** Production build kontrolü
- **Komut:** `npm run build`

#### 🧠 Mission 4: AI Flow Test
- **XP:** 300
- **Açıklama:** AI akışları testi
- **Komut:** `npm run test:ai`

#### 🚀 Mission 5: Deploy Mission
- **XP:** 500
- **Açıklama:** Production'a deploy
- **Koşul:** Main branch'e merge

## 🏆 Achievements (Başarılar)

### 🎖️ Seviye Başarıları:
- **First Mission:** İlk görevi tamamla (+50 XP)
- **Code Quality Master:** 10 görev tamamla (+200 XP)
- **Type Safety Expert:** 20 görev tamamla (+300 XP)
- **Build Master:** 30 görev tamamla (+400 XP)
- **AI Integration Expert:** 50 görev tamamla (+500 XP)
- **Deployment Hero:** 100 görev tamamla (+1000 XP)

## 📊 Score Tracking

### 🎮 XP Sistemi:
- **Lint Check:** +100 XP
- **Type Check:** +150 XP
- **Build Check:** +200 XP
- **AI Flow Test:** +300 XP
- **Deploy Mission:** +500 XP

### ⭐ Level Sistemi:
- **Level 1:** 0-999 XP
- **Level 2:** 1000-1999 XP
- **Level 3:** 2000-2999 XP
- **Level 4:** 3000-3999 XP
- **Level 5:** 4000+ XP

## 🎯 Nasıl Oynarım?

### 1. Commit Yap:
```bash
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature
```

### 2. GitHub Actions'ı İzle:
- GitHub'da Actions sekmesine git
- Workflow'u takip et
- Mission completion mesajlarını gör

### 3. Score'u Kontrol Et:
```bash
python scripts/game-score.py
```

## 🏅 Leaderboard

### 🥇 En Yüksek XP:
1. **Melih Can Demir:** 1250 XP (Level 2)
2. **AI Assistant:** 750 XP (Level 1)
3. **Qodo MergeBot:** 500 XP (Level 1)

### 🎯 En Çok Mission:
1. **Melih Can Demir:** 15 missions
2. **AI Assistant:** 8 missions
3. **Qodo MergeBot:** 3 missions

## 🎮 Game Features

### ✅ Özellikler:
- **Real-time XP tracking**
- **Achievement system**
- **Level progression**
- **Mission history**
- **Leaderboard**

### 🎯 Hedefler:
- **Code quality** artırma
- **Team motivation** sağlama
- **CI/CD adoption** teşvik etme
- **Fun development** environment

## 🚀 Deployment

### 📋 Requirements:
- GitHub Actions enabled
- Node.js 18+
- Python 3.8+

### 🔧 Setup:
1. `.github/workflows/game-ci.yml` dosyası otomatik çalışır
2. `scripts/game-score.py` ile score takibi
3. `package.json`'da game scriptleri

## 🎉 Sonuç

**AkılHane CI/CD Game** ile:
- ✅ **Eğlenceli** development
- ✅ **Motivasyonlu** team
- ✅ **Kaliteli** kod
- ✅ **Otomatik** testing