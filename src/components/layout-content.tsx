"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import PWAServiceWorker from "@/components/pwa-service-worker";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import Footer from "@/components/footer";
import { useAppearance } from "@/hooks/use-appearance";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  // Initialize appearance settings
  useAppearance();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="akilhane-theme"
    >
      <div className="flex-grow">{children}</div>
      <Toaster />
      <PWAServiceWorker />
      <PWAInstallPrompt />
      <Footer />
    </ThemeProvider>
  );
}
