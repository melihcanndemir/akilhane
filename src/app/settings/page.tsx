'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Settings, 
  Bell, 
  Palette, 
  Database, 
  Trash2, 
  Download,
  Upload,
  BookOpen,
  GraduationCap,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import MobileNav from '@/components/mobile-nav';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language-switcher';

interface Subject {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  is_active: boolean;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation(['settings', 'common']);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    achievements: true,
  });

  const [appearance, setAppearance] = useState({
    fontSize: 'medium',
    compactMode: false,
  });

  const [studyPreferences, setStudyPreferences] = useState({
    defaultSubject: '',
    questionsPerQuiz: 10,
    timeLimit: 30,
    showTimer: true,
    autoSubmit: false,
  });

  // Custom values state
  const [customQuestionsValue, setCustomQuestionsValue] = useState('');
  const [customTimeValue, setCustomTimeValue] = useState('');


  useEffect(() => {
    const initializeSettings = async () => {
      setLoading(true);
      
      let loadedStudyPrefs = studyPreferences;
      let loadedNotifications = notifications;
      let loadedAppearance = appearance;
      let loadedTheme = theme || 'system';

      // 1. Load settings from localStorage first
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.studyPreferences) loadedStudyPrefs = { ...loadedStudyPrefs, ...parsed.studyPreferences };
          if (parsed.notifications) loadedNotifications = { ...loadedNotifications, ...parsed.notifications };
          if (parsed.appearance) {
            loadedAppearance = { ...loadedAppearance, ...parsed.appearance };
            loadedTheme = parsed.appearance.theme || loadedTheme;
          }
        } catch {
          // Failed to parse settings from localStorage
        }
      }

      // 2. Fetch subjects from the API
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const subjectData = await response.json();
          setSubjects(subjectData);

          // 3. Set default subject if needed, based on loaded or initial prefs
          if (!loadedStudyPrefs.defaultSubject && subjectData.length > 0) {
            const firstActiveSubject = subjectData.find((s: Subject) => s.is_active);
            if (firstActiveSubject) {
              loadedStudyPrefs.defaultSubject = firstActiveSubject.name;
            }
          }
        }
      } catch {
        // Error fetching subjects
      }

      // 4. Reconcile custom values for the UI
      const standardQuestionOptions = [5, 10, 15, 20];
      if (loadedStudyPrefs.questionsPerQuiz && !standardQuestionOptions.includes(loadedStudyPrefs.questionsPerQuiz)) {
        setCustomQuestionsValue(loadedStudyPrefs.questionsPerQuiz.toString());
        loadedStudyPrefs.questionsPerQuiz = -1; // Set UI to "custom"
      }

      const standardTimeOptions = [15, 30, 45, 60];
      if (loadedStudyPrefs.timeLimit && !standardTimeOptions.includes(loadedStudyPrefs.timeLimit)) {
        setCustomTimeValue(loadedStudyPrefs.timeLimit.toString());
        loadedStudyPrefs.timeLimit = -1; // Set UI to "custom"
      }

      // 5. Set all states at once
      setNotifications(loadedNotifications);
      setAppearance(loadedAppearance);
      setStudyPreferences(loadedStudyPrefs);
      setTheme(loadedTheme); // Set the theme globally
      
      // 6. Apply visual styles from settings
      const root = document.documentElement;
      if (loadedAppearance.compactMode) root.classList.add('compact-mode');
      else root.classList.remove('compact-mode');
      
      switch (loadedAppearance.fontSize) {
        case 'small': root.style.fontSize = '14px'; break;
        case 'medium': root.style.fontSize = '16px'; break;
        case 'large': root.style.fontSize = '18px'; break;
        default: root.style.fontSize = '16px'; break;
      }
      
      setLoading(false);
    };

    initializeSettings();
  }, [setTheme]); // Using setTheme in dependency array as it's a stable function from the hook.

  const handleExportData = () => {
    // Export user data
    const userData = {
      performance: localStorage.getItem('performanceData'),
      settings: {
        notifications,
        appearance,
        studyPreferences,
      },
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aof-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.performance) {
              localStorage.setItem('performanceData', data.performance);
            }
            if (data.settings) {
              setNotifications(data.settings.notifications || notifications);
              setAppearance(data.settings.appearance || appearance);
              setStudyPreferences(data.settings.studyPreferences || studyPreferences);
            }
            alert('Veriler başarıyla içe aktarıldı!');
          } catch {
            alert('Dosya formatı geçersiz!');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Tüm verileriniz silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      localStorage.clear();
      alert('Tüm veriler silindi!');
    }
  };

  const handleSaveSettings = () => {
    const settingsToSave = {
      ...studyPreferences,
    };

    if (settingsToSave.questionsPerQuiz === -1) {
      settingsToSave.questionsPerQuiz = parseInt(customQuestionsValue) || 10; // default to 10 if invalid
    }
    if (settingsToSave.timeLimit === -1) {
      settingsToSave.timeLimit = parseInt(customTimeValue) || 30; // default to 30 if invalid
    }

    const settings = {
      notifications,
      appearance: {
        ...appearance,
        theme: theme, // Get the current theme from the hook
      },
      studyPreferences: settingsToSave,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    toast({
      title: t('settings:changes_saved'),
      description: t('settings:changes_saved'),
    });
  };

  return (
    <div className="min-h-screen">
      {/* Responsive Navigation Bar */}
      <MobileNav />

      <div className="p-4 md:p-8">
        <div className="container mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-headline font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('settings:title')}</h1>
                <p className="text-muted-foreground">{t('settings:title')}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notifications */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('settings:notifications')}
                </CardTitle>
                <CardDescription>
                  {t('settings:notification_settings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">Önemli güncellemeler için e-posta alın</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">Anlık bildirimler alın</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminders">Hatırlatıcılar</Label>
                    <p className="text-sm text-muted-foreground">Çalışma hatırlatıcıları</p>
                  </div>
                  <Switch
                    id="reminders"
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, reminders: checked})}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="achievements">Başarı Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">Başarılarınızı kutlayın</p>
                  </div>
                  <Switch
                    id="achievements"
                    checked={notifications.achievements}
                    onCheckedChange={(checked) => setNotifications({...notifications, achievements: checked})}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t('settings:appearance')}
                </CardTitle>
                <CardDescription>
                  {t('settings:theme_settings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">{t('common:theme')}</Label>
                  <Select value={theme || 'system'} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">
                        {t('common:light')}
                      </SelectItem>
                      <SelectItem value="dark" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">
                        {t('common:dark')}
                      </SelectItem>
                      <SelectItem value="system" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">
                        {t('common:system')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="font-size">Yazı Boyutu</Label>
                  <Select value={appearance.fontSize} onValueChange={(value) => setAppearance({...appearance, fontSize: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">
                        Küçük
                      </SelectItem>
                      <SelectItem value="medium" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">
                        Orta
                      </SelectItem>
                      <SelectItem value="large" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">
                        Büyük
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">Kompakt Mod</Label>
                    <p className="text-sm text-muted-foreground">Daha az boşluk kullanın</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => setAppearance({...appearance, compactMode: checked})}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Study Preferences */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Çalışma Tercihleri
                </CardTitle>
                <CardDescription>
                  Test ve çalışma ayarlarınızı yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-subject">Varsayılan Ders</Label>
                  <Select 
                    value={studyPreferences.defaultSubject} 
                    onValueChange={(value) => setStudyPreferences({...studyPreferences, defaultSubject: value})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Dersler yükleniyor...
                        </div>
                      ) : (
                        <SelectValue placeholder="Varsayılan ders seçin" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter(subject => subject.is_active).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Henüz ders bulunmuyor
                          </p>
                          <p className="text-xs text-muted-foreground/70 mb-4">
                            Ders yöneticisinden yeni ders ekleyebilirsiniz
                          </p>
                          <Link href="/subject-manager">
                            <Button size="sm" variant="outline" className="text-xs">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Ders Ekle
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        subjects
                          .filter(subject => subject.is_active)
                          .map((subject) => (
                            <SelectItem key={subject.id} value={subject.name} className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">
                              {subject.name}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="questions-per-quiz">Test Başına Soru Sayısı</Label>
                   <div className="flex gap-2">
                    <Select 
                      value={studyPreferences.questionsPerQuiz === -1 ? 'custom' : studyPreferences.questionsPerQuiz.toString()} 
                      onValueChange={(value) => {
                        setStudyPreferences({...studyPreferences, questionsPerQuiz: value === 'custom' ? -1 : parseInt(value)});
                        if (value !== 'custom') setCustomQuestionsValue('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">5 Soru</SelectItem>
                        <SelectItem value="10" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">10 Soru</SelectItem>
                        <SelectItem value="15" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">15 Soru</SelectItem>
                        <SelectItem value="20" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">20 Soru</SelectItem>
                        <SelectItem value="custom" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">Özel...</SelectItem>
                      </SelectContent>
                    </Select>
                    {studyPreferences.questionsPerQuiz === -1 && (
                      <Input
                        type="number"
                        placeholder="Örn: 25"
                        value={customQuestionsValue}
                        onChange={(e) => setCustomQuestionsValue(e.target.value)}
                        className="w-28"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="time-limit">Zaman Limiti (dakika)</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={studyPreferences.timeLimit === -1 ? 'custom' : studyPreferences.timeLimit.toString()} 
                       onValueChange={(value) => {
                        setStudyPreferences({...studyPreferences, timeLimit: value === 'custom' ? -1 : parseInt(value)});
                        if (value !== 'custom') setCustomTimeValue('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">15 Dakika</SelectItem>
                        <SelectItem value="30" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">30 Dakika</SelectItem>
                        <SelectItem value="45" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">45 Dakika</SelectItem>
                        <SelectItem value="60" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">60 Dakika</SelectItem>
                        <SelectItem value="custom" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-blue-600 data-[highlighted]:to-purple-600 data-[highlighted]:text-white">Özel...</SelectItem>
                      </SelectContent>
                    </Select>
                     {studyPreferences.timeLimit === -1 && (
                      <Input
                        type="number"
                        placeholder="Örn: 50"
                        value={customTimeValue}
                        onChange={(e) => setCustomTimeValue(e.target.value)}
                        className="w-28"
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-timer">Zamanlayıcı Göster</Label>
                    <p className="text-sm text-muted-foreground">Test sırasında kalan süreyi göster</p>
                  </div>
                  <Switch
                    id="show-timer"
                    checked={studyPreferences.showTimer}
                    onCheckedChange={(checked) => setStudyPreferences({...studyPreferences, showTimer: checked})}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-submit">Otomatik Gönder</Label>
                    <p className="text-sm text-muted-foreground">Süre dolduğunda otomatik gönder</p>
                  </div>
                  <Switch
                    id="auto-submit"
                    checked={studyPreferences.autoSubmit}
                    onCheckedChange={(checked) => setStudyPreferences({...studyPreferences, autoSubmit: checked})}
                    className="data-[state=checked]:bg-indigo-600 hover:bg-indigo-600/20 transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Veri Yönetimi
                </CardTitle>
                <CardDescription>
                  Verilerinizi yedekleyin veya yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleExportData} variant="outline" className="flex-1 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0">
                    <Download className="w-4 h-4 mr-2" />
                    Verileri Dışa Aktar
                  </Button>
                  <Button onClick={handleImportData} variant="outline" className="flex-1 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0">
                    <Upload className="w-4 h-4 mr-2" />
                    Verileri İçe Aktar
                  </Button>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={handleClearData} variant="destructive" className="flex-1 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white hover:border-0">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Tüm Verileri Sil
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dışa aktarılan veriler JSON formatında kaydedilir ve daha sonra içe aktarılabilir.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" onClick={handleSaveSettings}>
              <Settings className="w-4 h-4 mr-2" />
              {t('settings:save_changes')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 