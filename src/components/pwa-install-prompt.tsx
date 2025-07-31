'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Extend Navigator interface for iOS Safari standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if PWA features are supported
    const checkSupport = () => 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;

    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check display mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }

      // Check for iOS Safari standalone
      if (window.navigator.standalone === true) {
        return true;
      }

      // Check document referrer for app context
      if (document.referrer.includes('android-app://')) {
        return true;
      }

      return false;
    };

    // Check dismissal status
    const checkDismissalStatus = () => {
      try {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
          const dismissedTime = parseInt(dismissed);
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

          // If dismissed less than 7 days ago, don't show
          return dismissedTime > sevenDaysAgo;
        }
        return false;
      } catch {
        //do nothing
        return false;
      }
    };

    // Initialize states
    setIsSupported(checkSupport());
    setIsInstalled(checkIfInstalled());
    setIsDismissed(checkDismissalStatus());

    // Early return if not supported or already installed
    if (!checkSupport() || checkIfInstalled()) {
      return;
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after a delay if conditions are met
      setTimeout(() => {
        if (!checkDismissalStatus() && !checkIfInstalled()) {
          setShowInstallPrompt(true);
        } else {
        }
      }, 3000);
    };

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Listen for app install
    const installHandler = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      // Clear dismissal status
      try {
        localStorage.removeItem('pwa-install-dismissed');
      } catch {
        //do nothing
      }
    };

    window.addEventListener('appinstalled', installHandler);

    // For iOS, we need to check periodically if the app was added to home screen
    const checkIOSInstall = () => {
      if (window.navigator.standalone === true) {
        installHandler();
      }
    };

    const iosCheckInterval = setInterval(checkIOSInstall, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('appinstalled', installHandler);
      clearInterval(iosCheckInterval);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      //do nothing
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      } else {
        handleDismiss();
      }

      setDeferredPrompt(null);
    } catch {
      //do nothing
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);

    // Remember dismissal for 7 days
    try {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    } catch {
      //do nothing
    }
  };

  const handleRemindLater = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);

    // Remember dismissal for 7 days
    try {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    } catch {
      //do nothing
    }
  };

  // Don't render if any blocking condition is true
  if (!isSupported || isInstalled || isDismissed || !showInstallPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-4 z-50 sm:bottom-4 sm:right-4 sm:left-auto sm:flex-none sm:px-0 left-0 right-0 flex justify-center px-4"
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  AkılHane&apos;i Yükle
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Daha hızlı erişim
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              AkılHane&apos;i ana ekranınıza ekleyerek daha hızlı erişim sağlayın ve çevrimdışı çalışın.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Hızlı erişim</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Çevrimdışı çalışma</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Push bildirimleri</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
                                onClick={() => { void handleInstall(); }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-h-[44px] text-sm font-medium border-0"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Yükle
            </Button>
            <Button
              variant="outline"
              onClick={handleRemindLater}
              size="sm"
              className="min-h-[44px] text-sm font-medium hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
            >
              Daha Sonra
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
