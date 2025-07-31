'use client';

import EnhancedDashboard from '@/components/enhanced-dashboard';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <EnhancedDashboard />
      </main>
    </div>
  );
}
