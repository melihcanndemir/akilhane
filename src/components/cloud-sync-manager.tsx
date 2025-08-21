'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CloudSyncService } from '@/services/cloud-sync-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Cloud, HardDrive, CheckCircle, AlertCircle, Database, Upload, Download, TestTube } from 'lucide-react';

interface SyncStatus {
  hasLocalData: boolean;
  hasCloudData: boolean;
  localCounts: {
    subjects: number;
    questions: number;
  };
  cloudCounts: {
    subjects: number;
    questions: number;
  };
}

interface SyncState {
  isLoading: boolean;
  error: string | null;
  lastAction: string;
  syncStatus: SyncStatus | null;
}

export function CloudSyncManager() {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<SyncState>({
    isLoading: false,
    error: null,
    lastAction: '',
    syncStatus: null,
  });

  const updateState = (updates: Partial<SyncState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const checkSyncStatus = async () => {
    updateState({ isLoading: true, error: null });

    try {
      const status = await CloudSyncService.getSyncStatus();
      updateState({
        isLoading: false,
        syncStatus: status,
        error: null,
      });
    } catch (error) {
      updateState({
        isLoading: false,
        error: `Sync status kontrolü başarısız: ${error}`,
      });
    }
  };

  // Silent version for refresh after sync operations
  const checkSyncStatusSilently = async () => {
    try {
      const status = await CloudSyncService.getSyncStatus();
      updateState({
        syncStatus: status,
        error: null,
      });
    } catch {
      // Silent error handling - don't show errors or loading states
    }
  };

  const handleSyncAction = async (action: () => Promise<{ success: boolean; message?: string }>, actionName: string) => {
    updateState({ lastAction: actionName, isLoading: true, error: null });

    try {
      const result = await action();

      if (result.success) {
        updateState({
          isLoading: false,
          error: null,
        });

        // Refresh status silently after sync action
        setTimeout(() => {
          checkSyncStatusSilently();
        }, 1000);
      } else {
        updateState({
          isLoading: false,
          error: result.message || null,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = `${actionName} hatası: ${error}`;
      updateState({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, message: errorMessage };
    }
  };

  const syncLocalToCloud = () => {
    void handleSyncAction(CloudSyncService.syncLocalToCloud, 'Buluta Yükleme');
  };
  const syncCloudToLocal = () => {
    void handleSyncAction(CloudSyncService.syncCloudToLocal, 'Buluttan İndirme');
  };
  const fullSync = () => {
    void handleSyncAction(CloudSyncService.fullSync, 'Tam Senkronizasyon');
  };
  const testConnection = () => {
    void handleSyncAction(CloudSyncService.testCloudConnection, 'Bağlantı Testi');
  };

  const clearError = () => {
    updateState({ error: null });
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Bulut Senkronizasyonu
          </CardTitle>
          <CardDescription>
            Verilerinizi bulutla senkronize etmek için oturum açmanız gerekiyor.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { syncStatus, isLoading, error, lastAction } = state;
  const hasLocalData = syncStatus?.hasLocalData || false;
  const hasCloudData = syncStatus?.hasCloudData || false;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Bulut Senkronizasyonu
          </CardTitle>
          <CardDescription>
            {user?.email} hesabınız için veri senkronizasyonu yönetimi
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Temizle
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Check Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Veri Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={() => void checkSyncStatus()} disabled={isLoading} variant="outline">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Durumu Kontrol Et
            </Button>

            {syncStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local Data */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="font-medium">Yerel Veri</span>
                    <Badge variant={hasLocalData ? "default" : "secondary"}>
                      {hasLocalData ? "Mevcut" : "Yok"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>📚 Dersler: {syncStatus.localCounts.subjects}</div>
                    <div>❓ Sorular: {syncStatus.localCounts.questions}</div>
                  </div>
                </div>

                {/* Cloud Data */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    <span className="font-medium">Bulut Veri</span>
                    <Badge variant={hasCloudData ? "default" : "secondary"}>
                      {hasCloudData ? "Mevcut" : "Yok"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>📚 Dersler: {syncStatus.cloudCounts.subjects}</div>
                    <div>❓ Sorular: {syncStatus.cloudCounts.questions}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Senkronizasyon İşlemleri
          </CardTitle>
          <CardDescription>
            Verilerinizi yerel depolama ile bulut arasında senkronize edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload to Cloud */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="font-medium">Buluta Yükle</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Yerel verilerinizi bulut depolamaya yükleyin
              </p>
              <Button
                onClick={syncLocalToCloud}
                disabled={isLoading || !hasLocalData}
                variant="outline"
                className="w-full"
              >
                {isLoading && lastAction === 'Buluta Yükleme' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Yerel → Bulut
              </Button>
            </div>

            {/* Download from Cloud */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="font-medium">Buluttan İndir</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bulut verilerinizi yerel depolamaya indirin
              </p>
              <Button
                onClick={syncCloudToLocal}
                disabled={isLoading || !hasCloudData}
                variant="outline"
                className="w-full"
              >
                {isLoading && lastAction === 'Buluttan İndirme' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Bulut → Yerel
              </Button>
            </div>

            {/* Full Sync */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Tam Senkronizasyon</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Her iki yönde de veri birleştirme yapın
              </p>
              <Button
                onClick={fullSync}
                disabled={isLoading || (!hasLocalData && !hasCloudData)}
                className="w-full"
              >
                {isLoading && lastAction === 'Tam Senkronizasyon' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Tam Senkronizasyon
              </Button>
            </div>

            {/* Test Connection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <span className="font-medium">Bağlantı Testi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bulut bağlantısını test edin
              </p>
              <Button
                onClick={testConnection}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading && lastAction === 'Bağlantı Testi' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Bağlantıyı Test Et
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {syncStatus && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Öneriler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!hasLocalData && !hasCloudData && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Henüz hiç veri yok. Ders Yöneticisi veya Soru Yöneticisi&apos;nden veri eklemeye başlayın.
                  </AlertDescription>
                </Alert>
              )}

              {hasLocalData && !hasCloudData && (
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    Yerel verileriniz var ama bulutta yok. &quot;Yerel → Bulut&quot; ile yükleyebilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              {!hasLocalData && hasCloudData && (
                <Alert>
                  <Download className="h-4 w-4" />
                  <AlertDescription>
                    Bulutta verileriniz var ama yerel depolamada yok. &quot;Bulut → Yerel&quot; ile indirebilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              {hasLocalData && hasCloudData && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Hem yerel hem bulut verileriniz var. &quot;Tam Senkronizasyon&quot; ile her ikisini birleştirebilirsiniz.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
