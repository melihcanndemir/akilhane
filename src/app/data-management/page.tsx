'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Cloud,
  Download,
  Upload,
  Trash2,
  UserX,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  HardDrive,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import MobileNav from '@/components/mobile-nav';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DataBackupService } from '@/services/data-backup-service';

function DataManagementContent() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');
  const [clearSuccess, setClearSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Redirect if not authenticated and load last backup timestamp
  useEffect(() => {
    if (!authLoading && !authUser) {
      window.location.href = '/login';
    }

    // Load last backup timestamp
    const loadLastBackup = async () => {
      if (authUser) {
        const timestamp = await DataBackupService.getLastBackupTimestamp(authUser.id);
        setLastBackup(timestamp);
      }
    };

    if (authUser) {
      loadLastBackup();
    }
  }, [authLoading, authUser]);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      setBackupSuccess('');

      // Create real backup
      const backupData = await DataBackupService.createBackup();

      if (backupData) {
        // Update last backup time
        setLastBackup(backupData.timestamp);
        setBackupSuccess('Verileriniz başarıyla yedeklendi!');
      } else {
        throw new Error('Yedekleme işlemi başarısız oldu');
      }

    } catch {
      setBackupSuccess(''); // Clear success message
      setDeleteError('Yedekleme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {

    try {
      setIsRestoring(true);
      setRestoreSuccess('');

      // Restore from real backup
      const success = await DataBackupService.restoreFromBackup();

      if (success) {
        setRestoreSuccess('Verileriniz başarıyla geri yüklendi!');
      } else {
        throw new Error('Geri yükleme işlemi başarısız oldu');
      }

    } catch {
      setRestoreSuccess(''); // Clear success message
      setDeleteError('Geri yükleme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearData = async () => {

    try {
      setIsClearing(true);
      setClearSuccess('');

      // Clear real cloud data
      const success = await DataBackupService.clearAllCloudData();

      if (success) {
        setClearSuccess('Bulut verileriniz başarıyla silindi!');
        setLastBackup(null); // Reset backup timestamp
      } else {
        throw new Error('Veri silme işlemi başarısız oldu');
      }

    } catch {
      setClearSuccess(''); // Clear success message
      setDeleteError('Veri silme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {

    try {
      setIsDeleting(true);
      setDeleteError('');

      // Delete account with real service
      const success = await DataBackupService.deleteAccount();

      if (success) {
        // Show success message briefly before redirect
        toast({
          title: 'Hesap Silindi',
          description: 'Hesabınız başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz...',
        });
        // DataBackupService already handles logout and redirect
      } else {
        throw new Error('Hesap silme işlemi başarısız oldu');
      }

    } catch {
      setDeleteError('Hesap silme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Giriş yapmanız gerekiyor
          </p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <MobileNav />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/profile" className="hover:text-foreground transition-colors">
                  Profil
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">Veri Yönetimi</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <Link href="/profile">
              <Button
                variant="outline"
                size="sm"
                className="mb-4 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Profile Dön
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Veri Yönetimi
            </h1>
            <p className="text-muted-foreground mt-2">
              Verilerinizi güvenle yedekleyin, geri yükleyin veya hesabınızı yönetin
            </p>
          </div>

          {/* Data Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Cloud Backup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-600" />
                    Bulut Yedekleme
                  </CardTitle>
                  <CardDescription>
                    Tüm ders verilerinizi ve test sonuçlarınızı güvenle buluta yedekleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Son yedekleme:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {lastBackup ? new Date(lastBackup).toLocaleDateString('tr-TR') : 'Henüz yedekleme yapılmamış'}
                    </span>
                  </div>

                  {backupSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400">{backupSuccess}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => { void handleBackup(); }}
                    disabled={isBackingUp}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 w-full"
                  >
                    {isBackingUp ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isBackingUp ? 'Yedekleniyor...' : 'Şimdi Yedekle'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Restore Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-600" />
                    Veri Geri Yükleme
                  </CardTitle>
                  <CardDescription>
                    Önceki yedekten tüm verilerinizi geri yükleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Bu işlem mevcut verilerinizi değiştirebilir
                      </p>
                    </div>
                  </div>

                  {restoreSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400">{restoreSuccess}</p>
                      </div>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isRestoring}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 w-full"
                      >
                        {isRestoring ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {isRestoring ? 'Geri Yükleniyor...' : 'Yedekten Geri Yükle'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Yedekten Geri Yükle</AlertDialogTitle>
                        <AlertDialogDescription>
                          Mevcut verilerinizi yedekten geri yüklemek istediğinizden emin misiniz? Bu işlem mevcut verilerinizi değiştirebilir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { void handleRestore(); }}>
                          Geri Yükle
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>

            {/* Clear Cloud Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-orange-600" />
                    Bulut Verilerini Temizle
                  </CardTitle>
                  <CardDescription>
                    Bulutta saklanan tüm verilerinizi silin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400 leading-tight">
                        Bu işlem geri alınamaz ve tüm verileriniz kaybolacak
                      </p>
                    </div>
                  </div>

                  {clearSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400">{clearSuccess}</p>
                      </div>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isClearing}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 w-full"
                      >
                        {isClearing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        {isClearing ? 'Temizleniyor...' : 'Tüm Bulut Verilerini Temizle'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bulut Verilerini Temizle</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tüm bulut verilerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { void handleClearData(); }}>
                          Temizle
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delete Account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="w-5 h-5 text-red-600" />
                    Hesabı Sil
                  </CardTitle>
                  <CardDescription>
                    Hesabınızı ve tüm verilerinizi kalıcı olarak silin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400 leading-tight">
                        Bu işlem geri alınamaz ve tüm verileriniz kaybolacak
                      </p>
                    </div>
                  </div>

                  {deleteError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isDeleting}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 w-full"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserX className="w-4 h-4 mr-2" />
                        )}
                        {isDeleting ? 'Hesap Siliniyor...' : 'Hesabımı Sil'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hesabı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kaybolacak.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => { void handleDeleteAccount(); }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Hesabı Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Güvenlik Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Verileriniz şifrelenmiş olarak saklanır
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Güvenli bulut altyapısı kullanılır
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      GDPR uyumlu veri işleme
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function DataManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Yükleniyor...</span>
        </div>
      </div>
    }>
      <DataManagementContent />
    </Suspense>
  );
}
