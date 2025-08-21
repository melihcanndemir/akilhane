'use client';

import { CloudSyncManager } from '@/components/cloud-sync-manager';

export default function CloudSyncPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🔄 Bulut Senkronizasyonu
          </h1>
          <p className="text-lg text-muted-foreground">
            Verilerinizi yerel depolama ile bulut arasında güvenli bir şekilde senkronize edin
          </p>
        </div>

        <CloudSyncManager />
      </div>
    </div>
  );
}
