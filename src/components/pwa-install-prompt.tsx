'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const checkSupport = () => {
      return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check display mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      
      // Check for iOS Safari standalone
      if ((window.navigator as any).standalone === true) {
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
      } catch (error) {
        console.warn('localStorage not available:', error);
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

    console.log('🔍 PWA Install: Listening for beforeinstallprompt event');

    const handler = (e: BeforeInstallPromptEvent) => {
      console.log('🎯 beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay if conditions are met
      setTimeout(() => {
        if (!checkDismissalStatus() && !checkIfInstalled()) {
          console.log('✅ Showing PWA install prompt');
          setShowInstallPrompt(true);
        } else {
          console.log('❌ PWA install prompt blocked - dismissed or installed');
        }
      }, 3000);
    };

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Listen for app install
    const installHandler = () => {
      console.log('🎉 PWA installed successfully!');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      // Clear dismissal status
      try {
        localStorage.removeItem('pwa-install-dismissed');
      } catch (error) {
        console.warn('localStorage not available:', error);
      }
    };

    window.addEventListener('appinstalled', installHandler);

    // For iOS, we need to check periodically if the app was added to home screen
    const checkIOSInstall = () => {
      if ((window.navigator as any).standalone === true) {
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
      console.warn('❌ No deferred prompt available');
      return;
    }

    try {
      console.log('🚀 Triggering install prompt');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        setShowInstallPrompt(false);
      } else {
        console.log('❌ User dismissed the install prompt');
        handleDismiss();
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Error during install:', error);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    
    // Remember dismissal for 7 days
    try {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      console.log('📅 PWA install dismissed for 7 days');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  };

  const handleRemindLater = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    
    // Remember dismissal for 7 days
    try {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      console.log('⏰ PWA install reminder set for 7 days');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  };

  // Debug info (remove in production)
  useEffect(() => {
    console.log('🐛 PWA Install Debug:', {
      isSupported,
      isInstalled,
      isDismissed,
      showInstallPrompt,
      hasDeferredPrompt: !!deferredPrompt
    });
  }, [isSupported, isInstalled, isDismissed, showInstallPrompt, deferredPrompt]);

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
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  AkılHane'i Yükle
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daha hızlı erişim
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              AkılHane'i ana ekranınıza ekleyerek daha hızlı erişim sağlayın ve çevrimdışı çalışın.
            </p>
            
            {/* Benefits */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Hızlı erişim</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Çevrimdışı çalışma</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Push bildirimleri</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Yükle
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRemindLater}
              size="sm"
              className="text-xs"
            >
              Daha Sonra
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}